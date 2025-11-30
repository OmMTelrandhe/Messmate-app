import express from "express";
import passport from "passport";
import {
  loginUser,
  registerUser,
  logoutUser,
  getProfile,
  googleAuthSuccess,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/login", loginUser);
router.post("/register", registerUser);
router.post("/logout", logoutUser);
router.get("/me", protect, getProfile);

// Google OAuth endpoints (JWT-based, no session)
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);
router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/", session: false }),
  googleAuthSuccess
);

export default router;
