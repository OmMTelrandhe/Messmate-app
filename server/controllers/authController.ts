import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/User";
import generateTokenAndSetCookie from "../utils/generateToken";
import { UserRole } from "../types"; // Use your existing type
import mongoose from "mongoose";
import generateToken from "../utils/generateToken";

// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, role } = req.body;

  // 1. Basic validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Please enter all fields." });
  }

  // 2. Check if user exists
  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: "User already exists." });
  }

  try {
    // 3. Create user (password hashing done via pre-save middleware in User model)
    const user = await User.create({
      name,
      email,
      password,
      // A simple implementation: allow client to set role, but a proper app would have admin-only endpoint for OWNER role
      role: role === UserRole.OWNER ? UserRole.OWNER : UserRole.STUDENT,
    });

    // 4. Generate token and set secure cookie
    generateTokenAndSetCookie(res, user._id as mongoose.Types.ObjectId);

    // 5. Send successful response
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error during registration." });
  }
};

// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Find user by email
    const user = await User.findOne({ email });

    // 2. Validate credentials
    if (user && (await user.matchPassword(password))) {
      // 3. Generate token and set secure cookie
      generateTokenAndSetCookie(res, user._id as mongoose.Types.ObjectId);

      // 4. Send successful response
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      });
    } else {
      res.status(401).json({ message: "Invalid email or password." });
    }
  } catch (error) {
    res.status(500).json({ message: "Server error during login." });
  }
};

// @route   POST /api/auth/logout
// @access  Private (but can be public to clear token)
export const logoutUser = (req: Request, res: Response) => {
  // 1. Clear the HTTP-only cookie
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0), // Set to expire immediately
  });
  res.status(200).json({ message: "Logged out successfully." });
};

// @route   GET /api/auth/me
// @access  Private (Requires JWT middleware)
export const getProfile = async (req: Request, res: Response) => {
  // The JWT middleware would attach the user object to the request (next phase)
  // For now, assume req.user is available after authentication
  const user = await User.findById((req as any).user._id).select("-password");
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "User not found" });
  }
};

// @desc    Handle successful Google OAuth login
// @route   GET /api/auth/google/success
export const googleAuthSuccess = (req: Request, res: Response) => {
  // Passport attaches the user to req.user upon successful authentication
  const user = req.user as any;

  if (user) {
    // Generate and set the secure HTTP-only JWT cookie
    generateToken(res, user._id);

    // Redirect the user back to the frontend homepage
    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    return res.redirect(clientURL);
  } else {
    // Should not happen if Passport ran correctly
    res.status(401).json({ message: "Google authentication failed." });
  }
};
