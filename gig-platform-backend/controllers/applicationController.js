import Application from "../models/Application.js";
import Gig from "../models/Gig.js";
import Message from "../models/Message.js";
import { createNotification } from "../services/notificationService.js";
import { emitToGig, emitToUser } from "../utils/socket.js";

const buildWorkerProfileState = (worker) => {
    const requiredFields = ["name", "email", "phone", "location", "bio", "workType"];
    const missing = requiredFields.filter((field) => !worker?.[field]);
    if (!worker?.skills || !worker.skills.length) {
        missing.push("skills");
    }

    return {
        isProfileComplete: missing.length === 0,
        missingProfileFields: missing,
    };
};

// @desc    Apply to a specific gig
// @route   POST /api/applications/:gigId
// @access  Private (Worker only)
export const applyForGig = async (req, res) => {
    try {
        if (req.user.role !== "worker") {
            return res.status(403).json({ message: "Only workers can apply for gigs" });
        }

        const { proposal, proposedPrice, workerExperience, workerSkills } = req.body;
        const normalizedSkills = Array.isArray(workerSkills)
            ? workerSkills.map((skill) => String(skill).trim()).filter(Boolean)
            : String(workerSkills || "")
                .split(",")
                .map((skill) => skill.trim())
                .filter(Boolean);
        const trimmedExperience = String(workerExperience || "").trim();
        const price = Number(proposedPrice);

        if (!trimmedExperience || normalizedSkills.length === 0 || !Number.isFinite(price) || price <= 0) {
            return res.status(400).json({
                message: "Work experience, skills and valid proposed price are required",
            });
        }

        const generatedProposal = String(proposal || "").trim() || [
            `Experience: ${trimmedExperience}`,
            `Skills: ${normalizedSkills.join(", ")}`,
        ].join("\n");

        const gigId = req.params.gigId;
        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({ message: "Gig not found" });
        }

        if (!["open", "pending"].includes(gig.status)) {
            return res.status(400).json({ message: "This gig is no longer accepting applications" });
        }

        // Workers cannot apply to their own gigs (shouldn't happen but safety check)
        if (gig.client.toString() === req.user._id.toString()) {
            return res.status(403).json({ message: "You cannot apply to your own gig" });
        }

        const existingApplication = await Application.findOne({ gig: gigId, worker: req.user._id });
        if (existingApplication) {
            return res.status(400).json({ message: "You have already applied for this gig" });
        }

        const application = await Application.create({
            gig: gigId,
            worker: req.user._id,
            client: gig.client,
            proposal: generatedProposal,
            proposedPrice: price,
        });

        const populated = await Application.findById(application._id)
            .populate("worker", "name email phone bio skills location workType")
            .populate("gig", "title budget category");

        if (gig.status === "open") {
            gig.status = "pending";
            await gig.save();
        }

        res.status(201).json(populated);
    } catch (error) {
        if (error?.code === 11000) {
            return res.status(400).json({ message: "You have already applied for this gig" });
        }
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all applications for a specific gig (client only)
// @route   GET /api/applications/gig/:gigId
// @access  Private (Client)
export const getGigApplications = async (req, res) => {
    try {
        const gig = await Gig.findById(req.params.gigId);
        if (!gig) {
            return res.status(404).json({ message: "Gig not found" });
        }

        if (gig.client.toString() !== req.user._id.toString() && req.user.role !== "admin") {
            return res.status(403).json({ message: "Not authorized to view these applications" });
        }

        const applications = await Application.find({ gig: req.params.gigId })
            .populate("worker", "name email phone bio skills location avatar workType")
            .populate("gig", "title budget");

        const enrichedApplications = applications.map((application) => {
            const plain = application.toObject();
            return {
                ...plain,
                workerProfile: buildWorkerProfileState(plain.worker),
            };
        });

        res.json(enrichedApplications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all applications for the logged-in worker
// @route   GET /api/applications/my-applications
// @access  Private (Worker)
export const getMyApplications = async (req, res) => {
    try {
        const applications = await Application.find({ worker: req.user._id })
            .populate("gig", "title budget category subcategory status deadline")
            .populate("client", "name email")
            .sort({ createdAt: -1 });

        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update application status (client only)
// @route   PUT /api/applications/:id/status
// @access  Private (Client)
export const updateApplicationStatus = async (req, res) => {
    try {
        const { status, finalAmount } = req.body;
        const application = await Application.findById(req.params.id);

        if (!application) {
            return res.status(404).json({ message: "Application not found" });
        }

        if (!["pending", "accepted", "rejected"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        // Only the gig client (or admin) can update status
        if (
            application.client.toString() !== req.user._id.toString() &&
            req.user.role !== "admin"
        ) {
            return res.status(403).json({ message: "Not authorized to update this application" });
        }

        const gig = await Gig.findById(application.gig);
        if (!gig) {
            return res.status(404).json({ message: "Gig not found" });
        }

        if (gig.status === "completed") {
            return res.status(400).json({ message: "Cannot change applications for completed jobs" });
        }

        if (status === "accepted") {
            if (["accepted", "in-progress", "completed"].includes(gig.status) && gig.worker?.toString() !== application.worker.toString()) {
                return res.status(400).json({ message: "Worker already finalized for this job" });
            }

            let negotiatedAmount = application.proposedPrice;
            if (finalAmount !== undefined && finalAmount !== null && finalAmount !== "") {
                negotiatedAmount = Number(finalAmount);
                if (!negotiatedAmount || negotiatedAmount <= 0) {
                    return res.status(400).json({ message: "Final amount must be greater than zero" });
                }
            }

            application.proposedPrice = negotiatedAmount;
            gig.assignedWorkers = [application.worker];
            gig.worker = application.worker;
            gig.requiredWorkers = 1;
            gig.budget = negotiatedAmount;
            gig.status = "accepted";
            gig.paymentStatus = gig.paymentStatus === "paid" ? "paid" : "unpaid";
            await gig.save();

            const otherApplications = await Application.find({
                gig: application.gig,
                _id: { $ne: application._id },
            }).populate("worker", "name email role");

            await Application.updateMany(
                { gig: application.gig, _id: { $ne: application._id } },
                { status: "rejected" }
            );

            const compactDescription = String(gig.description || "")
                .replace(/\s+/g, " ")
                .trim();

            const selectionDetails = [
                "Congratulations! You have been selected for this gig.",
                `Gig title: ${gig.title}`,
                compactDescription ? `Description: ${compactDescription}` : null,
                `Budget/payment amount: ₹${Number(negotiatedAmount).toLocaleString("en-IN")}`,
                `Location: ${gig.location || "Not specified"}`,
                `Deadline/date: ${gig.deadline ? new Date(gig.deadline).toLocaleString() : "Not specified"}`,
                `Client name: ${req.user.name || "Client"}`,
            ].filter(Boolean).join("\n");

            await Message.create({
                gig: gig._id,
                sender: req.user._id,
                receiver: application.worker,
                message: selectionDetails,
                messageType: "system",
            });

            await createNotification({
                recipientId: application.worker,
                senderId: req.user._id,
                type: "selection",
                title: "You have been selected",
                message: selectionDetails,
                relatedGigId: gig._id,
            });

            await Promise.all(otherApplications.map(async (otherApplication) => {
                const rejectionMessage = "Thank you for applying for this gig. We appreciate your interest, but another candidate has been selected for this opportunity. We encourage you to apply for future gigs.";

                await Message.create({
                    gig: gig._id,
                    sender: req.user._id,
                    receiver: otherApplication.worker._id,
                    message: rejectionMessage,
                    messageType: "system",
                });

                await createNotification({
                    recipientId: otherApplication.worker._id,
                    senderId: req.user._id,
                    type: "rejection",
                    title: "Application update",
                    message: rejectionMessage,
                    relatedGigId: gig._id,
                });
            }));

            emitToGig(gig._id.toString(), "gig:updated", gig);
            emitToUser(application.worker.toString(), "gig:updated", gig);
            otherApplications.forEach((otherApplication) => {
                emitToUser(otherApplication.worker._id.toString(), "gig:updated", gig);
            });
        }

        application.status = status;
        await application.save();

        if (status === "rejected") {
            if (gig.assignedWorkers.length === 0) {
                const pendingApplications = await Application.countDocuments({
                    gig: application.gig,
                    status: "pending",
                });
                gig.status = pendingApplications > 0 ? "pending" : "open";
                await gig.save();
            }

            const rejectionMessage = "Thank you for applying for this gig. We appreciate your interest, but the client has decided not to move forward with your application. We encourage you to apply for future gigs.";
            await Message.create({
                gig: gig._id,
                sender: req.user._id,
                receiver: application.worker,
                message: rejectionMessage,
                messageType: "system",
            });

            await createNotification({
                recipientId: application.worker,
                senderId: req.user._id,
                type: "rejection",
                title: "Application update",
                message: rejectionMessage,
                relatedGigId: gig._id,
            });

            emitToUser(application.worker.toString(), "gig:updated", gig);
        }

        const populated = await Application.findById(application._id)
            .populate("worker", "name email phone location skills workType bio")
            .populate("gig", "title");

        res.json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all applications (admin)
// @route   GET /api/applications
// @access  Private/Admin
export const getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find({})
            .populate("worker", "name email")
            .populate("client", "name email")
            .populate("gig", "title")
            .sort({ createdAt: -1 });
        res.json(applications);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
