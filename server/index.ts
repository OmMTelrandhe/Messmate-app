import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import messRoutes from "./routes/messRoutes";
import passport from "passport"; 
import setupGoogleStrategy from "./config/passport";

dotenv.config();

connectDB();

const app = express();

// --- Middleware ---
app.use(express.json()); // Body parser for raw JSON
app.use(express.urlencoded({ extended: true })); // Body parser for form data
app.use(cookieParser()); // Allows reading and setting cookies

// Configure CORS for security (allows frontend to talk to backend)
// CHANGE THE ORIGIN TO YOUR DEPLOYED FRONTEND URL LATER!
const allowedOrigins = process.env.CLIENT_URL || 'http://localhost:5173'
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true, // Crucial for sending/receiving HTTP-only cookies
  })
);

// --- Passport Initialization ---
// Passport needs session middleware to track sessions (even if we use JWT for actual auth)
app.use(passport.initialize()); 
// Passport session is required for Passport's built-in session management (even for OAuth flow)
// Note: We are NOT using Express Session store, Passport handles the temp session for OAuth.
// If you were to use a full session, you would need `express-session` here. 
// We are keeping it minimal as our primary auth is JWT-cookie.
// app.use(passport.session()); // Omit this line for stateless JWT usage

// Initialize the Google Strategy
setupGoogleStrategy(); // <--- NEW CALL

// --- Routes ---
app.use("/api/auth", authRoutes);
app.use("/api/messes", messRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
