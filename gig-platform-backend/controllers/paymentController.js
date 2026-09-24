import crypto from "crypto";
import Razorpay from "razorpay";
import Gig from "../models/Gig.js";
import Payment from "../models/Payment.js";
import { createNotification } from "../services/notificationService.js";
import { emitToGig, emitToUser } from "../utils/socket.js";

const getRazorpayClient = () => {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials are not configured");
  }

  return new Razorpay({ key_id: keyId, key_secret: keySecret });
};

// Constant-time comparison so the signature can't be guessed via response timing.
const signaturesMatch = (expected, received) => {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && crypto.timingSafeEqual(a, b);
};

const buildPaymentResponse = async (payment) => {
  return Payment.findById(payment._id)
    .populate("gig", "title budget status paymentStatus client worker assignedWorkers")
    .populate("client", "name email role")
    .populate("worker", "name email role");
};

const finalizePaymentAndGig = async (payment) => {
  payment.status = "paid";
  payment.paidAt = new Date();
  await payment.save();

  const gig = await Gig.findById(payment.gig)
    .populate("client", "name email role")
    .populate("worker", "name email role")
    .populate("assignedWorkers", "name email role");

  if (!gig) {
    throw new Error("Gig not found while finalizing payment");
  }

  gig.paymentStatus = "paid";
  gig.paidAt = payment.paidAt;
  gig.status = "in-progress";
  await gig.save();

  const paymentDoc = await buildPaymentResponse(payment);

  await Promise.all([
    createNotification({
      recipientId: payment.worker,
      senderId: payment.client,
      type: "payment",
      title: "Payment received",
      message: `Payment of ₹${Number(payment.amount || 0).toLocaleString("en-IN")} has been verified for ${gig.title}.`,
      relatedGigId: gig._id,
    }),
    createNotification({
      recipientId: payment.client,
      senderId: payment.worker,
      type: "payment",
      title: "Payment completed",
      message: `Payment for ${gig.title} was verified successfully.`,
      relatedGigId: gig._id,
    }),
  ]);

  emitToGig(gig._id.toString(), "payment:updated", { payment: paymentDoc, gig });
  emitToUser(payment.worker.toString(), "gig:updated", gig);
  emitToUser(payment.client.toString(), "gig:updated", gig);

  return { payment: paymentDoc, gig };
};

export const createPaymentOrder = async (req, res) => {
  try {
    const gigId = req.params.id || req.body.gigId;
    const { workerId } = req.body;

    const gig = await Gig.findById(gigId)
      .populate("client", "name email role")
      .populate("worker", "name email role")
      .populate("assignedWorkers", "name email role");

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (gig.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const selectedWorker = workerId || gig.worker?._id || gig.assignedWorkers?.[0]?._id;
    if (!selectedWorker) {
      return res.status(400).json({ message: "Select a worker before creating payment" });
    }

    if (gig.worker && gig.worker._id.toString() !== String(selectedWorker)) {
      return res.status(400).json({ message: "Selected worker does not match the hired worker" });
    }

    const existingPayment = await Payment.findOne({ gig: gig._id });
    if (existingPayment && ["created", "pending"].includes(existingPayment.status) && existingPayment.razorpayOrderId) {
      gig.paymentStatus = "pending";
      await gig.save();

      const populatedPayment = await buildPaymentResponse(existingPayment);
      emitToGig(gig._id.toString(), "payment:updated", populatedPayment);

      return res.json({
        payment: populatedPayment,
        order: {
          id: existingPayment.razorpayOrderId,
          amount: Math.round(Number(existingPayment.amount || gig.budget || 0) * 100),
          currency: existingPayment.currency || "INR",
        },
        keyId: process.env.RAZORPAY_KEY_ID,
      });
    }

    if (existingPayment && existingPayment.status === "paid") {
      return res.status(400).json({ message: "Payment already completed for this gig" });
    }

    const amountInPaise = Math.round(Number(gig.budget || 0) * 100);
    if (!amountInPaise || amountInPaise <= 0) {
      return res.status(400).json({ message: "Invalid payment amount" });
    }

    const razorpay = getRazorpayClient();
    const shortGigId = String(gig._id).slice(-10);
    const shortTs = Date.now().toString().slice(-8);
    const receiptId = `gig_${shortGigId}_${shortTs}`;
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: "INR",
      receipt: receiptId,
      notes: {
        gigId: gig._id.toString(),
        clientId: gig.client._id.toString(),
        workerId: String(selectedWorker),
      },
    });

    const paymentPayload = {
      gig: gig._id,
      client: gig.client._id,
      worker: selectedWorker,
      amount: gig.budget,
      currency: "INR",
      razorpayOrderId: order.id,
      razorpayPaymentId: null,
      razorpaySignature: null,
      status: "created",
      paidAt: null,
    };

    let payment;
    if (existingPayment) {
      Object.assign(existingPayment, paymentPayload);
      payment = await existingPayment.save();
    } else {
      payment = await Payment.create(paymentPayload);
    }

    gig.paymentStatus = "pending";
    await gig.save();

    const populatedPayment = await buildPaymentResponse(payment);
    emitToGig(gig._id.toString(), "payment:updated", populatedPayment);

    res.status(201).json({
      payment: populatedPayment,
      order,
      keyId: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    const razorpayMessage = error?.error?.description || error?.description || error?.message;
    const message = razorpayMessage || "Failed to create payment order";

    if (/authentication failed/i.test(message)) {
      return res.status(500).json({
        message: "Razorpay authentication failed. Verify RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
        details: message,
      });
    }

    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    res.status(statusCode).json({ message, details: razorpayMessage || null });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({ message: "Missing Razorpay verification details" });
    }

    const payment = await Payment.findOne({ razorpayOrderId })
      .populate("gig")
      .populate("client", "name email role")
      .populate("worker", "name email role");

    if (!payment) {
      return res.status(404).json({ message: "Payment record not found" });
    }

    if (payment.client?._id?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized to verify this payment" });
    }

    if (payment.status === "paid") {
      return res.json({ payment, gig: payment.gig });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials are not configured");
    }

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");

    if (!signaturesMatch(generatedSignature, String(razorpaySignature))) {
      payment.status = "failed";
      payment.razorpayPaymentId = razorpayPaymentId;
      payment.razorpaySignature = razorpaySignature;
      await payment.save();

      if (payment.gig) {
        payment.gig.paymentStatus = "unpaid";
        await payment.gig.save();
        emitToGig(payment.gig._id.toString(), "payment:updated", payment);
      }

      return res.status(400).json({ message: "Payment verification failed" });
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    const finalized = await finalizePaymentAndGig(payment);

    res.json(finalized);
  } catch (error) {
    const razorpayMessage = error?.error?.description || error?.description || error?.message;
    const message = razorpayMessage || "Failed to verify payment";
    const statusCode = Number.isInteger(error?.statusCode) ? error.statusCode : 500;
    res.status(statusCode).json({ message, details: razorpayMessage || null });
  }
};

export const getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ $or: [{ client: req.user._id }, { worker: req.user._id }] })
      .populate("gig", "title budget status paymentStatus")
      .populate("client", "name email")
      .populate("worker", "name email")
      .sort({ paidAt: -1, createdAt: -1 });

    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const markTestPaymentPaid = async (req, res) => {
  try {
    // Opt-in only: otherwise a failed Razorpay payment could still mark a gig as paid.
    if (process.env.ALLOW_TEST_PAYMENT_BYPASS !== "true") {
      return res.status(403).json({ message: "Test payment bypass is disabled" });
    }

    const { gigId, workerId } = req.body;
    if (!gigId) {
      return res.status(400).json({ message: "gigId is required" });
    }

    const gig = await Gig.findById(gigId)
      .populate("client", "name email role")
      .populate("worker", "name email role")
      .populate("assignedWorkers", "name email role");

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (gig.client._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const selectedWorker = workerId || gig.worker?._id || gig.assignedWorkers?.[0]?._id;
    if (!selectedWorker) {
      return res.status(400).json({ message: "Select a worker before payment" });
    }

    let payment = await Payment.findOne({ gig: gig._id });
    if (payment && payment.status === "paid") {
      const paymentDoc = await buildPaymentResponse(payment);
      return res.json({ payment: paymentDoc, gig });
    }

    if (!payment) {
      payment = await Payment.create({
        gig: gig._id,
        client: gig.client._id,
        worker: selectedWorker,
        amount: gig.budget,
        currency: "INR",
        razorpayOrderId: `test_order_${Date.now()}`,
        razorpayPaymentId: `test_payment_${Date.now()}`,
        razorpaySignature: "test-bypass",
        status: "pending",
      });
    } else {
      payment.worker = selectedWorker;
      payment.amount = gig.budget;
      payment.currency = payment.currency || "INR";
      payment.razorpayPaymentId = payment.razorpayPaymentId || `test_payment_${Date.now()}`;
      payment.razorpaySignature = payment.razorpaySignature || "test-bypass";
      if (!payment.razorpayOrderId) {
        payment.razorpayOrderId = `test_order_${Date.now()}`;
      }
    }

    const finalized = await finalizePaymentAndGig(payment);
    return res.json({
      ...finalized,
      testMode: true,
    });
  } catch (error) {
    const message = error?.message || "Failed to mark test payment as paid";
    res.status(500).json({ message });
  }
};