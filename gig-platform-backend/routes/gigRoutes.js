import express from "express";
import {
  createGig,
  getGigs,
  getGigById,
  updateGig,
  deleteGig,
  acceptGig,
  getMyGigs,
  getGigCategories,
  completeGig,
  generateGigInvoice,
  startGigWork,
  stopGigWork,
} from "../controllers/gigController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/", getGigs);
router.get("/categories", getGigCategories);

// Protected routes — MUST come before /:id to avoid being captured by param
router.get("/user/my-gigs", protect, getMyGigs);
router.put("/:id/complete", protect, completeGig);
router.put("/:id/start", protect, startGigWork);
router.put("/:id/stop", protect, stopGigWork);
router.get("/:id/invoice", protect, generateGigInvoice);

// Parameterized routes
router.get("/:id", getGigById);

// Mutation routes
router.post("/", protect, createGig);
router.put("/:id", protect, updateGig);
router.delete("/:id", protect, deleteGig);
router.put("/:id/accept", protect, acceptGig);

export default router;
