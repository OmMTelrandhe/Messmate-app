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
// Required for the 'secure: true' cookie setting to work over HTTPS.
app.set("trust proxy", 1); 

// --- Global Environment Variables ---
const PORT = parseInt(process.env.PORT || '5000', 10);
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const SESSION_SECRET = process.env.SESSION_SECRET || "b83e9b1238350ecc51095c274bdddbea";

// ➡️ CHANGE 1: Create an array of allowed origins from the CLIENT_URL variable
const ALLOWED_ORIGINS = CLIENT_URL.split(',').map(s => s.trim()); 
const HOST = '0.0.0.0'; // ➡️ CHANGE 2: Define the host for the server to listen on

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 1. Configure CORS
app.use(
  cors({
    // ➡️ CHANGE 3: Update origin from a single string to a dynamic function
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or same-origin requests)
      if (!origin) return callback(null, true);
      
      // Check if the requesting origin is in our allowed list
      if (ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        console.error(`CORS Blocked: Origin ${origin} not allowed`);
        callback(new Error(`Not allowed by CORS: ${origin}`), false);
      }
    },
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
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
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

// ➡️ CHANGE 4: Listen on the specified HOST to resolve accessibility issues
app.listen(PORT, HOST, () => console.log(`Server running on ${HOST}:${PORT}`));
