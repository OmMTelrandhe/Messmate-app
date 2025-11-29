import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import session from "express-session";
import connectDB from "./config/db";
import authRoutes from "./routes/authRoutes";
import messRoutes from "./routes/messRoutes";
import passport from "passport";
import setupGoogleStrategy from "./config/passport";

dotenv.config();

connectDB();

const app = express();

// --- CRUCIAL FIX: TRUST PROXY HEADERS ---
// This line tells Express to trust the headers sent by Render's load balancer.
// This is required for the 'secure: true' cookie setting to work when using sameSite: 'none' over HTTPS.
app.set("trust proxy", 1); // <--- ADDED THIS LINE

// --- Global Environment Variables ---
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const SESSION_SECRET = process.env.SESSION_SECRET || "a-strong-default-secret";

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 1. Configure CORS
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

// 2. Express Session Middleware
// This must run before passport.initialize()
app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 24 * 60 * 60 * 1000,

      // secure: true is now correctly enabled by 'trust proxy'
      secure: process.env.NODE_ENV === "production",

      httpOnly: true,

      // Required for Vercel -> Render cross-site request
      sameSite: "none",
    },
  })
);

// 3. Initialize Passport (MUST be after session middleware)
app.use(passport.initialize());
app.use(passport.session());

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
