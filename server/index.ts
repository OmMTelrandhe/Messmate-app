import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session"; // <-- NEW: Required for Passport sessions
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import messRoutes from "./routes/messRoutes";
import passport from "passport";
import setupGoogleStrategy from "./config/passport";

dotenv.config();

connectDB();

const app = express();

// --- Global Environment Variables ---
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173"; // Should be your Vercel URL
const SESSION_SECRET = process.env.SESSION_SECRET || "a-strong-default-secret"; // Load from Render ENV

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 1. Configure CORS
app.use(
  cors({
    origin: CLIENT_URL, // Whitelists your Vercel frontend URL
    credentials: true, // Crucial for sending/receiving cookies across domains
  })
);

// 2. Express Session Middleware (CRUCIAL FIX for 401)
// This must run before passport.initialize()
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000, // Session duration (24 hours)
      // Set secure: true in production, but use a conditional check
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      sameSite: "lax", // Best balance for cross-site requests
    },
  })
);

// 3. Initialize Passport (MUST be after session middleware)
app.use(passport.initialize());
app.use(passport.session()); // <-- UNCOMMENTED/ADDED: Enables session tracking for req.isAuthenticated()

// 4. Initialize the Google Strategy (and define serialize/deserialize)
setupGoogleStrategy();

// --- Routes ---
// Simple test route to check server status
app.get("/", (req, res) => {
  res.send(`Server running. Frontend URL: ${CLIENT_URL}`);
});

app.use("/api/auth", authRoutes);
app.use("/api/messes", messRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
