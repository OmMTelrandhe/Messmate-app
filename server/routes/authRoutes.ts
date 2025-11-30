// import express from "express";
// import passport from 'passport'; // <--- NEW IMPORT
// import { registerUser, loginUser, logoutUser, getProfile, googleAuthSuccess } from '../controllers/authController'; 
// import { protect } from "../middleware/authMiddleware";


// const router = express.Router();

// router.post("/register", registerUser);
// router.post("/login", loginUser);
// router.post("/logout", logoutUser);
// router.get('/me', protect, getProfile); 

// // --- Google OAuth Routes (NEW) ---

// // 1. @route   GET /api/auth/google
// // @desc    Start Google OAuth flow (Redirects to Google)
// router.get(
//     '/google', 
//     passport.authenticate('google', { 
//         // scope: ['profile', 'email'], // Request access to profile and email
//         // session: false
//     })
// );

// // 2. @route   GET /api/auth/google/callback
// // @desc    Google's callback URL (Handles the response from Google)
// router.get(
//     '/google/callback', 
//     passport.authenticate('google', { 
//         failureRedirect: '/', // Redirect to homepage on failure 
//         // session: false
//         // Note: successRedirect is handled by `googleAuthSuccess` redirect
//     }),

import express from "express";
import passport from 'passport';
// --- JWT IMPORTS ---
import generateToken from "../utils/generateToken"; 
import jwtAuth from "../middleware/jwtAuth";
// --- CONTROLLER IMPORTS (Removed googleAuthSuccess as it's now handled here) ---
import { registerUser, loginUser, logoutUser, getProfile } from '../controllers/authController'; 

const router = express.Router();

const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// --- Custom JWT Success Handler ---
// This function executes after successful authentication by Google/Passport
const googleAuthSuccess = (req: any, res: any) => {
    // req.user is populated by the successful passport.authenticate call
    if (req.user) {
      // 1. Generate the JWT using the user's ID
      const token = generateToken(req.user._id.toString());
      
      // 2. Redirect back to the client with the token attached as a query parameter.
      // The frontend must read this token and store it in Local Storage.
      res.redirect(`${CLIENT_URL}/auth-success?token=${token}`);
    } else {
      // Should only happen on an unexpected failure after Google validation
      res.redirect(`${CLIENT_URL}/login?error=no_user_data`);
    }
};

router.post("/register", registerUser);
router.post("/login", loginUser);

// LOGOUT: Since authentication is stateless (JWT), logout is mostly client-side.
router.post("/logout", (req, res) => {
    // The client is responsible for deleting the JWT from Local Storage.
    res.status(200).json({ message: "Logout success (Client token deletion required)" });
});

// --- PROTECTED ROUTES ---
// The /me route now uses the new jwtAuth middleware for protection.
router.get('/me', jwtAuth, getProfile); 

// --- Google OAuth Routes (JWT Flow) ---

// 1. @route   GET /api/auth/google
// @desc    Start Google OAuth flow (Redirects to Google)
router.get(
    '/google', 
    passport.authenticate('google', { 
        scope: ['profile', 'email'], 
        session: false // CRUCIAL: Disables session creation
    })
);

// 2. @route   GET /api/auth/google/callback
// @desc    Google's callback URL (Handles the response from Google)
router.get(
    '/google/callback', 
    passport.authenticate('google', { 
        failureRedirect: `${CLIENT_URL}/login?error=auth_failed`, // Redirect to client login on failure 
        session: false // CRUCIAL: Disables session creation
    }),
    googleAuthSuccess // Use the custom JWT success handler (defined above)
);

export default router;
//     googleAuthSuccess // Use the success handler to set the JWT cookie and redirect to client
// );

// export default router;
