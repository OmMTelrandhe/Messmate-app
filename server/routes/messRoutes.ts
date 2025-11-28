// server/routes/messRoutes.ts
import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  listMesses,
  createMess,
  addReview,
} from "../controllers/messController";

const router = express.Router();

// @route   POST /api/messes
// @access  Private (Any logged-in user)
// Requires: `protect` (JWT valid)
router.post("/", protect, createMess);

// @route   GET /api/messes
// @access  Public
router.get("/", listMesses);

// @route POST /api/messes/:messId/reviews
// @access Public (non-logged-in users allowed)
router.post("/:messId/reviews", addReview);

export default router;
