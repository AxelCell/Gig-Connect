import Gig from "../models/Gig.js";
import Application from "../models/Application.js";
import Payment from "../models/Payment.js";
import Notification from "../models/Notification.js";
import {
  ALLOWED_STATUS_TRANSITIONS,
  JOB_CATEGORIES,
  LOCAL_SERVICE_CATEGORIES,
} from "../constants/gigMeta.js";

const isValidDate = (dateValue) => {
  if (!dateValue) return false;
  const parsed = new Date(dateValue);
  return !Number.isNaN(parsed.getTime());
};

const validateCategoryPair = (category, subcategory) => {
  if (!category || !JOB_CATEGORIES[category]) {
    return "Invalid category input";
  }

  if (!subcategory || typeof subcategory !== "string" || !subcategory.trim()) {
    return "Subcategory is required";
  }

  const allowedSubcategories = JOB_CATEGORIES[category];
  if (!allowedSubcategories.includes(subcategory)) {
    return "Invalid subcategory for selected category";
  }

  return null;
};

const canMoveToStatus = (currentStatus, nextStatus) => {
  if (currentStatus === nextStatus) return true;
  return (ALLOWED_STATUS_TRANSITIONS[currentStatus] || []).includes(nextStatus);
};

const normalizeGigForRead = (gig) => {
  if (!gig.worker && gig.assignedWorkers?.length > 0) {
    gig.worker = gig.assignedWorkers[0];
  }
  return gig;
};

export const getGigCategories = async (req, res) => {
  res.json({ categories: JOB_CATEGORIES });
};

// @desc    Create a new gig (client only)
// @route   POST /api/gigs
// @access  Private (client)
export const createGig = async (req, res) => {
  try {
    const {
      title,
      description,
      budget,
      category,
      subcategory,
      skills,
      deadline,
      duration,
      location,
      requiredWorkers,
    } = req.body;

    if (req.user.role !== "client") {
      return res.status(403).json({ message: "Only clients can create gigs" });
    }

    const categoryError = validateCategoryPair(category, subcategory);
    if (categoryError) {
      return res.status(400).json({ message: categoryError });
    }

    const parsedBudget = Number(budget);
    if (!parsedBudget || parsedBudget <= 0) {
      return res.status(400).json({ message: "Budget must be greater than zero" });
    }

    if (!duration || !String(duration).trim()) {
      return res.status(400).json({ message: "Duration is required" });
    }

    let parsedDeadline = null;
    if (deadline !== undefined && deadline !== null && deadline !== "") {
      if (!isValidDate(deadline)) {
        return res.status(400).json({ message: "Invalid date format for deadline" });
      }
      parsedDeadline = new Date(deadline);
      if (parsedDeadline <= new Date()) {
        return res.status(400).json({ message: "Deadline must be in the future" });
      }
    }

    if (LOCAL_SERVICE_CATEGORIES.has(category) && !location?.trim()) {
      return res.status(400).json({ message: "Location is mandatory for local jobs" });
    }

    const requiredWorkersValue = Number(requiredWorkers || 1);
    if (!requiredWorkersValue || requiredWorkersValue < 1) {
      return res.status(400).json({ message: "Required workers must be at least 1" });
    }

    const gig = await Gig.create({
      title,
      description,
      budget: parsedBudget,
      category,
      subcategory,
      skills: skills || [],
      deadline: parsedDeadline,
      duration,
      location: location || "",
      requiredWorkers: requiredWorkersValue,
      client: req.user.id,
    });

    res.status(201).json(gig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Get all available gigs (with optional filters)
// @route   GET /api/gigs
// @access  Public
export const getGigs = async (req, res) => {
  try {
    const { category, subcategory, minBudget, maxBudget, status, search } = req.query;

    const filter = {};

    if (category) filter.category = category;
    if (subcategory) filter.subcategory = subcategory;
    if (status) filter.status = status;
    else filter.status = { $in: ["open", "pending"] }; // default to gigs still accepting applications

    if (status === "all") {
      delete filter.status;
    }

    const min = Number(minBudget);
    const max = Number(maxBudget);
    if (minBudget && Number.isFinite(min)) filter.budget = { ...filter.budget, $gte: min };
    if (maxBudget && Number.isFinite(max)) filter.budget = { ...filter.budget, $lte: max };

    if (search) {
      // Escape regex special characters so user input is matched literally
      const safeSearch = String(search).trim().slice(0, 100).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
      ];
    }

    // Public listing: never expose contact details here
    const gigs = await Gig.find(filter)
      .populate("client", "name")
      .populate("assignedWorkers", "name")
      .sort({ createdAt: -1 });

    const normalized = gigs.map((gig) => normalizeGigForRead(gig));

    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get a single gig by ID
// @route   GET /api/gigs/:id
// @access  Public
export const getGigById = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate("client", "name email phone")
      .populate("worker", "name email")
      .populate("assignedWorkers", "name email");

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    const viewerId = req.user?._id?.toString();
    const canSeeContacts = Boolean(viewerId) && (
      req.user.role === "admin" ||
      gig.client?._id?.toString() === viewerId ||
      gig.assignedWorkers.some((worker) => worker._id.toString() === viewerId)
    );

    const result = normalizeGigForRead(gig.toObject());
    if (!canSeeContacts) {
      // Only the client, the hired worker and admins may see emails and phone numbers
      [result.client, result.worker, ...(result.assignedWorkers || [])]
        .filter((person) => person && typeof person === "object")
        .forEach((person) => {
          delete person.email;
          delete person.phone;
        });
    }

    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a gig (only the client who created it)
// @route   PUT /api/gigs/:id
// @access  Private (client owner)
export const updateGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (gig.client.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to update this gig" });
    }

    if (gig.status === "completed") {
      return res.status(400).json({ message: "Completed jobs cannot be edited" });
    }

    const {
      title,
      description,
      budget,
      category,
      subcategory,
      skills,
      deadline,
      status,
      duration,
      location,
      requiredWorkers,
    } = req.body;

    const nextCategory = category || gig.category;
    const nextSubcategory = subcategory || gig.subcategory;
    const categoryError = validateCategoryPair(nextCategory, nextSubcategory);
    if (categoryError) {
      return res.status(400).json({ message: categoryError });
    }

    if (status && !canMoveToStatus(gig.status, status)) {
      return res.status(400).json({ message: "Invalid status transition" });
    }

    if (title) gig.title = title;
    if (description) gig.description = description;
    if (budget !== undefined) {
      const parsedBudget = Number(budget);
      if (!parsedBudget || parsedBudget <= 0) {
        return res.status(400).json({ message: "Budget must be greater than zero" });
      }
      gig.budget = parsedBudget;
    }
    if (category) gig.category = category;
    if (subcategory) gig.subcategory = subcategory;
    if (skills) gig.skills = skills;
    if (duration !== undefined) {
      if (!String(duration).trim()) {
        return res.status(400).json({ message: "Duration is required" });
      }
      gig.duration = duration;
    }
    if (deadline !== undefined) {
      if (deadline === null || deadline === "") {
        gig.deadline = null;
      } else {
        if (!isValidDate(deadline)) {
          return res.status(400).json({ message: "Invalid date format for deadline" });
        }
        const parsedDeadline = new Date(deadline);
        if (parsedDeadline <= new Date()) {
          return res.status(400).json({ message: "Deadline must be in the future" });
        }
        gig.deadline = parsedDeadline;
      }
    }
    if (location !== undefined) gig.location = location;
    if (requiredWorkers !== undefined) {
      const workersNeeded = Number(requiredWorkers);
      if (!workersNeeded || workersNeeded < 1) {
        return res.status(400).json({ message: "Required workers must be at least 1" });
      }
      if (gig.assignedWorkers.length > workersNeeded) {
        return res.status(400).json({ message: "Required workers cannot be below assigned workers" });
      }
      gig.requiredWorkers = workersNeeded;
    }
    if (status) gig.status = status;

    if (LOCAL_SERVICE_CATEGORIES.has(gig.category) && !gig.location?.trim()) {
      return res.status(400).json({ message: "Location is mandatory for local jobs" });
    }

    const updatedGig = await gig.save();
    const populatedGig = await Gig.findById(updatedGig._id)
      .populate("client", "name email")
      .populate("worker", "name email")
      .populate("assignedWorkers", "name email");

    res.json(normalizeGigForRead(populatedGig));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a gig (only the client who created it)
// @route   DELETE /api/gigs/:id
// @access  Private (client owner)
export const deleteGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (gig.client.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized to delete this gig" });
    }

    if (gig.status === "in-progress" || gig.status === "completed") {
      return res.status(400).json({ message: "Cannot delete active or completed jobs" });
    }

    const hasApplications = await Application.exists({ gig: gig._id });
    if (hasApplications) {
      return res.status(400).json({ message: "Cannot delete job with existing applications" });
    }

    await Notification.deleteMany({ relatedGig: gig._id });
    await gig.deleteOne();
    res.json({ message: "Gig removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Worker applies / accepts a gig
// @route   PUT /api/gigs/:id/accept
// @access  Private (worker)
export const acceptGig = async (req, res) => {
  try {
    return res
      .status(410)
      .json({ message: "Direct gig acceptance is deprecated. Apply through applications." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get gigs created by the logged-in client
// @route   GET /api/gigs/my-gigs
// @access  Private
export const getMyGigs = async (req, res) => {
  try {
    let gigs;
    if (req.user.role === "client") {
      gigs = await Gig.find({ client: req.user.id })
        .populate("worker", "name email")
        .populate("assignedWorkers", "name email")
        .sort({ updatedAt: -1, createdAt: -1 });
    } else {
      gigs = await Gig.find({ assignedWorkers: req.user.id })
        .populate("client", "name email")
        .sort({ updatedAt: -1, createdAt: -1 });
    }

    const normalized = gigs.map((gig) => normalizeGigForRead(gig));
    res.json(normalized);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const completeGig = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id);
    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (gig.client.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (gig.status !== "in-progress") {
      return res.status(400).json({ message: "Job must be in progress before completion" });
    }

    if (gig.paymentStatus !== "paid") {
      return res.status(400).json({ message: "Payment must be completed first" });
    }

    gig.status = "completed";
    if (!gig.workEndedAt) {
      gig.workEndedAt = new Date();
    }
    if (gig.workStartedAt && gig.workEndedAt) {
      const elapsedHours = (gig.workEndedAt.getTime() - gig.workStartedAt.getTime()) / (1000 * 60 * 60);
      gig.totalWorkHours = Math.max(0, Number(elapsedHours.toFixed(2)));
    }
    await gig.save();

    const updated = await Gig.findById(gig._id)
      .populate("client", "name email")
      .populate("worker", "name email")
      .populate("assignedWorkers", "name email");

    res.json(normalizeGigForRead(updated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const generateGigInvoice = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate("client", "name email")
      .populate("assignedWorkers", "name email")
      .populate("worker", "name email");

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    if (
      req.user.role !== "admin" &&
      gig.client._id.toString() !== req.user.id &&
      !gig.assignedWorkers.some((w) => w._id.toString() === req.user.id)
    ) {
      return res.status(403).json({ message: "Not authorized to access invoice" });
    }

    if (gig.status !== "completed") {
      return res.status(400).json({ message: "Invoice can only be generated after completion" });
    }

    const payment = await Payment.findOne({ gig: gig._id });

    const primaryWorker = gig.assignedWorkers[0] || gig.worker;
    const invoice = {
      invoiceId: `INV-${gig._id.toString().slice(-8).toUpperCase()}`,
      generatedAt: new Date().toISOString(),
      clientName: gig.client?.name || "N/A",
      workerName: primaryWorker?.name || "N/A",
      jobTitle: gig.title,
      amountINR: gig.budget,
      amountFormatted: `₹${Number(gig.budget).toLocaleString("en-IN")}`,
      paymentDate: payment?.paidAt || null,
      paymentStatus: gig.paymentStatus,
      completionDate: gig.updatedAt,
      workStartedAt: gig.workStartedAt,
      workEndedAt: gig.workEndedAt,
      totalWorkHours: gig.totalWorkHours || 0,
    };

    res.setHeader("Content-Disposition", `attachment; filename=invoice-${gig._id}.json`);
    res.json(invoice);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const startGigWork = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate("client", "name email")
      .populate("worker", "name email")
      .populate("assignedWorkers", "name email");

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    const isAssignedWorker = gig.assignedWorkers.some((worker) => worker._id.toString() === req.user.id);
    if (!isAssignedWorker) {
      return res.status(403).json({ message: "Only assigned worker can start this job" });
    }

    if (!["accepted", "in-progress"].includes(gig.status)) {
      return res.status(400).json({ message: "Job must be accepted before starting work" });
    }

    if (gig.workStartedAt) {
      return res.status(400).json({ message: "Work already started for this job" });
    }

    gig.workStartedAt = new Date();
    gig.workEndedAt = null;
    if (gig.status === "accepted") {
      gig.status = "in-progress";
    }
    await gig.save();

    const updated = await Gig.findById(gig._id)
      .populate("client", "name email")
      .populate("worker", "name email")
      .populate("assignedWorkers", "name email");

    res.json(normalizeGigForRead(updated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const stopGigWork = async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate("client", "name email")
      .populate("worker", "name email")
      .populate("assignedWorkers", "name email");

    if (!gig) {
      return res.status(404).json({ message: "Gig not found" });
    }

    const isAssignedWorker = gig.assignedWorkers.some((worker) => worker._id.toString() === req.user.id);
    if (!isAssignedWorker) {
      return res.status(403).json({ message: "Only assigned worker can stop this job" });
    }

    if (gig.status === "completed") {
      return res.status(400).json({ message: "Job is already completed" });
    }

    // Test/demo flows may set payment as paid while status is still accepted.
    if (gig.status === "accepted" && gig.paymentStatus === "paid") {
      gig.status = "in-progress";
    }

    if (gig.status !== "in-progress") {
      return res.status(400).json({ message: "Job must be in progress before stopping work" });
    }

    if (!gig.workStartedAt) {
      // Graceful fallback for jobs moved to in-progress by payment flow.
      gig.workStartedAt = new Date();
    }

    gig.workEndedAt = new Date();
    const elapsedHours = (gig.workEndedAt.getTime() - new Date(gig.workStartedAt).getTime()) / (1000 * 60 * 60);
    gig.totalWorkHours = Math.max(0, Number(elapsedHours.toFixed(2)));
    gig.status = "completed";
    await gig.save();

    const updated = await Gig.findById(gig._id)
      .populate("client", "name email")
      .populate("worker", "name email")
      .populate("assignedWorkers", "name email");

    res.json(normalizeGigForRead(updated));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
