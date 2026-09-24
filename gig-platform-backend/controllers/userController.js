import User from "../models/User.js";
import Gig from "../models/Gig.js";
import Application from "../models/Application.js";
import Review from "../models/Review.js";
import Payment from "../models/Payment.js";
import Message from "../models/Message.js";
import Notification from "../models/Notification.js";
import Report from "../models/Report.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const MIN_PASSWORD_LENGTH = 6;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register user
// @route   POST /api/users/register
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role, phone, gender } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required" });
    }

    if (!EMAIL_REGEX.test(String(email).trim())) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (String(password).length < MIN_PASSWORD_LENGTH) {
      return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      return res.status(400).json({ message: "User already exists with this email" });
    }

    // Admin accounts must never be self-registered; promote them directly in the database.
    const safeRole = ["worker", "client"].includes(role) ? role : "worker";

    const cleanedPhone = String(phone || "").trim();
    if (cleanedPhone && !/^\d{10,15}$/.test(cleanedPhone)) {
      return res.status(400).json({ message: "Phone number must contain only digits (10 to 15)." });
    }

    const safeGender = String(gender || "").trim().toLowerCase();
    if (!safeGender || !["male", "female"].includes(safeGender)) {
      return res.status(400).json({ message: "Gender must be either Male or Female." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: safeRole,
      phone: cleanedPhone,
      gender: safeGender,
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      skills: user.skills,
      location: user.location,
      phone: user.phone,
      gender: user.gender,
      workType: user.workType,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/users/login
// @access  Public
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    if (!user.isActive) {
      return res.status(403).json({ message: "Account has been deactivated" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      bio: user.bio,
      skills: user.skills,
      location: user.location,
      phone: user.phone,
      gender: user.gender,
      workType: user.workType,
      avatar: user.avatar,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, bio, skills, location, phone, gender, workType, avatar, password } = req.body;

    if (name) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (skills) user.skills = skills;
    if (location !== undefined) user.location = location;
    if (phone !== undefined) {
      const cleanedPhone = String(phone || "").trim();
      if (cleanedPhone && !/^\d{10,15}$/.test(cleanedPhone)) {
        return res.status(400).json({ message: "Phone number must contain only digits (10 to 15)." });
      }
      user.phone = cleanedPhone;
    }
    if (gender !== undefined) {
      const safeGender = String(gender || "").trim().toLowerCase();
      if (safeGender && !["male", "female"].includes(safeGender)) {
        return res.status(400).json({ message: "Gender must be either Male or Female." });
      }
      user.gender = safeGender;
    }
    if (workType !== undefined) user.workType = workType;
    if (avatar !== undefined) user.avatar = avatar;

    if (password) {
      if (String(password).length < MIN_PASSWORD_LENGTH) {
        return res.status(400).json({ message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` });
      }
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      bio: updatedUser.bio,
      skills: updatedUser.skills,
      location: updatedUser.location,
      phone: updatedUser.phone,
      gender: updatedUser.gender,
      workType: updatedUser.workType,
      avatar: updatedUser.avatar,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user by ID (public profile)
// @route   GET /api/users/:id
// @access  Public
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -email");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle user active status (admin only)
// @route   PUT /api/users/:id/toggle-status
// @access  Private/Admin
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? "activated" : "deactivated"}`, isActive: user.isActive });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete user (admin only)
// @route   DELETE /api/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (id === req.user._id.toString()) {
      return res.status(400).json({ message: "You cannot delete your own admin account" });
    }

    const target = await User.findById(id);
    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    if (target.role === "admin") {
      const admins = await User.countDocuments({ role: "admin" });
      if (admins <= 1) {
        return res.status(400).json({ message: "Cannot delete the last admin account" });
      }
    }

    const clientGigs = await Gig.find({ client: id }).select("_id");
    const gigIds = clientGigs.map((gig) => gig._id);

    if (gigIds.length) {
      await Promise.all([
        Application.deleteMany({ gig: { $in: gigIds } }),
        Review.deleteMany({ gig: { $in: gigIds } }),
        Payment.deleteMany({ gig: { $in: gigIds } }),
        Message.deleteMany({ gig: { $in: gigIds } }),
        Notification.deleteMany({ relatedGig: { $in: gigIds } }),
        Report.deleteMany({ targetGig: { $in: gigIds } }),
        Gig.deleteMany({ _id: { $in: gigIds } }),
      ]);
    }

    await Promise.all([
      Application.deleteMany({ $or: [{ worker: id }, { client: id }] }),
      Review.deleteMany({ $or: [{ reviewer: id }, { reviewee: id }] }),
      Payment.deleteMany({ $or: [{ client: id }, { worker: id }] }),
      Message.deleteMany({ $or: [{ sender: id }, { receiver: id }] }),
      Notification.deleteMany({ $or: [{ recipient: id }, { sender: id }] }),
      Report.deleteMany({
        $or: [{ reporter: id }, { targetUser: id }, { resolvedBy: id }],
      }),
      Gig.updateMany(
        { $or: [{ worker: id }, { assignedWorkers: id }] },
        {
          $set: { worker: null },
          $pull: { assignedWorkers: id },
        }
      ),
      User.findByIdAndDelete(id),
    ]);

    res.json({ message: "User and related records deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get worker updates (application outcomes, payment updates, invoice-ready jobs)
// @route   GET /api/users/worker-updates
// @access  Private (Worker)
export const getWorkerUpdates = async (req, res) => {
  try {
    if (req.user.role !== "worker") {
      return res.status(403).json({ message: "Only workers can access worker updates" });
    }

    const [applications, payments, completedGigs, chatMessages] = await Promise.all([
      Application.find({ worker: req.user._id, status: { $in: ["accepted", "rejected"] } })
        .populate("gig", "title")
        .populate("client", "name email phone")
        .sort({ updatedAt: -1 }),
      Payment.find({ worker: req.user._id })
        .populate("gig", "title")
        .sort({ paidAt: -1 }),
      Gig.find({ assignedWorkers: req.user._id, status: "completed" })
        .populate("client", "name")
        .sort({ updatedAt: -1 }),
      Message.find({ receiver: req.user._id })
        .populate("gig", "title")
        .populate("sender", "name role")
        .sort({ createdAt: -1 }),
    ]);

    const appUpdates = applications.map((app) => ({
      type: "application",
      status: app.status,
      gigId: app.gig?._id,
      gigTitle: app.gig?.title || "Untitled Job",
      message: app.status === "accepted"
        ? `You have been accepted for the job. For further information, contact the client (${app.client?.name || "Client"}${app.client?.phone ? `, ${app.client.phone}` : app.client?.email ? `, ${app.client.email}` : ""}).`
        : "Thank you for applying!!",
      createdAt: app.updatedAt || app.createdAt,
    }));

    const paymentUpdates = payments.map((payment) => ({
      type: "payment",
      gigId: payment.gig?._id,
      gigTitle: payment.gig?.title || "Untitled Job",
      amount: payment.amount,
      message: `Payment received: ₹${Number(payment.amount || 0).toLocaleString("en-IN")}`,
      createdAt: payment.paidAt || payment.createdAt,
    }));

    const invoiceUpdates = completedGigs.map((gig) => ({
      type: "invoice",
      gigId: gig._id,
      gigTitle: gig.title,
      invoiceReady: true,
      totalWorkHours: gig.totalWorkHours || 0,
      message: "Job completed. Invoice is ready to download.",
      createdAt: gig.workEndedAt || gig.updatedAt || gig.createdAt,
    }));

    const chatUpdates = chatMessages.map((msg) => ({
      type: "chat",
      gigId: msg.gig?._id,
      gigTitle: msg.gig?.title || "Untitled Job",
      senderName: msg.sender?.name || "Client",
      senderRole: msg.sender?.role || "client",
      message: msg.amountOffer
        ? `${msg.sender?.name || "Client"} sent an offer: ₹${Number(msg.amountOffer || 0).toLocaleString("en-IN")}`
        : `${msg.sender?.name || "Client"}: ${msg.message}`,
      createdAt: msg.createdAt,
    }));

    const updates = [...chatUpdates, ...appUpdates, ...paymentUpdates, ...invoiceUpdates].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(updates);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};