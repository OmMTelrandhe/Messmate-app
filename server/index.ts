import express, { Request, Response } from "express"; // Import Request/Response types
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
// This is essential for secure cookies (secure: true) to work behind Railway's load balancer.
app.set("trust proxy", 1); 

// --- Global Environment Variables ---
// ➡️ FIX 1: Use parseInt() to ensure PORT is a number (Fixes TS2769)
const PORT = parseInt(process.env.PORT || '5000', 10);
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";
const SESSION_SECRET = process.env.SESSION_SECRET || "b83e9b1238350ecc51095c274bdddbea";

// ➡️ FIX 2: Define the host to listen on all interfaces (0.0.0.0)
const HOST = '0.0.0.0'; 

// --- Middleware ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 1. Configure CORS
app.use(
  cors({
    // Use the single CLIENT_URL from the environment variable
    origin: '*', 
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

      // Required for Netlify -> Railway cross-site request
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
app.get("/", (req: Request, res: Response) => {
  res.send(`Server running. Frontend URL: ${CLIENT_URL}`);
});

app.use("/api/auth", authRoutes);
app.use("/api/messes", messRoutes);

// ➡️ FIX 3 & 4: Listen on the converted PORT and specified HOST
app.listen(PORT, HOST, () => console.log(`Server running on ${HOST}:${PORT}`));
