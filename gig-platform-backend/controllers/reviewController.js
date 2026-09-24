import Review from "../models/Review.js";
import Gig from "../models/Gig.js";
import Application from "../models/Application.js";

// @desc    Add a review/rating for a completed gig
// @route   POST /api/reviews/:gigId
// @access  Private
export const addReview = async (req, res) => {
    try {
        const { rating, comment, revieweeId } = req.body;
        const gigId = req.params.gigId;

        if (!rating || !comment || !revieweeId) {
            return res.status(400).json({ message: "Rating, comment, and reviewee are required" });
        }

        const numericRating = Number(rating);
        if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
            return res.status(400).json({ message: "Rating must be between 1 and 5" });
        }

        const gig = await Gig.findById(gigId);
        if (!gig) {
            return res.status(404).json({ message: "Gig not found" });
        }

        // Only allow reviews on completed gigs
        if (gig.status !== "completed") {
            return res.status(400).json({ message: "Can only review completed gigs" });
        }

        // Reviewer must be the client or the worker of the gig
        const isClient = gig.client.toString() === req.user._id.toString();
        const isWorker = gig.worker && gig.worker.toString() === req.user._id.toString();

        if (!isClient && !isWorker) {
            return res.status(403).json({ message: "You are not part of this gig" });
        }

        // Clients review the hired worker; workers review the client
        const expectedReviewee = isClient ? gig.worker?.toString() : gig.client.toString();
        if (!expectedReviewee || String(revieweeId) !== expectedReviewee) {
            return res.status(400).json({ message: "You can only review the other party of this gig" });
        }

        // Check reviewer didn't already review this gig
        const existingReview = await Review.findOne({ gig: gigId, reviewer: req.user._id });
        if (existingReview) {
            return res.status(400).json({ message: "You have already reviewed this gig" });
        }

        const review = await Review.create({
            gig: gigId,
            reviewer: req.user._id,
            reviewee: revieweeId,
            rating: numericRating,
            comment,
        });

        const populated = await Review.findById(review._id)
            .populate("reviewer", "name avatar role")
            .populate("reviewee", "name avatar role")
            .populate("gig", "title");

        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all reviews received by a user
// @route   GET /api/reviews/user/:userId
// @access  Public
export const getUserReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ reviewee: req.params.userId })
            .populate("reviewer", "name avatar role")
            .populate("gig", "title")
            .sort({ createdAt: -1 });

        const avgRating =
            reviews.length > 0
                ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
                : 0;

        res.json({ reviews, avgRating: Math.round(avgRating * 10) / 10, total: reviews.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get reviews for a specific gig
// @route   GET /api/reviews/gig/:gigId
// @access  Public
export const getGigReviews = async (req, res) => {
    try {
        const reviews = await Review.find({ gig: req.params.gigId })
            .populate("reviewer", "name avatar role")
            .sort({ createdAt: -1 });
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
