import express from "express";
import passport from 'passport'; // <--- NEW IMPORT
import { registerUser, loginUser, logoutUser, getProfile, googleAuthSuccess } from '../controllers/authController'; 
import { protect } from "../middleware/authMiddleware";


const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);
router.get('/me', protect, getProfile); 

// --- Google OAuth Routes (NEW) ---

// 1. @route   GET /api/auth/google
// @desc    Start Google OAuth flow (Redirects to Google)
router.get(
    '/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'], // Request access to profile and email
        session: false
    })
);

// 2. @route   GET /api/auth/google/callback
// @desc    Google's callback URL (Handles the response from Google)
router.get(
    '/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: '/', // Redirect to homepage on failure 
        session: false
        // Note: successRedirect is handled by `googleAuthSuccess` redirect
    }),
    googleAuthSuccess // Use the success handler to set the JWT cookie and redirect to client
);

export default router;
