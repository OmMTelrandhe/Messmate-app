import { Request, Response, NextFunction } from "express";
import User, { IUser } from "../models/User";
import { UserRole } from "../types";
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
    const user = await User.create({
      name,
      email,
      password,
      role: role === UserRole.OWNER ? UserRole.OWNER : UserRole.STUDENT,
    });

    const token = generateToken((user._id as mongoose.Types.ObjectId).toString());

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
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
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const token = generateToken((user._id as mongoose.Types.ObjectId).toString());

      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token,
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
  res.status(200).json({ message: "Logged out successfully." });
};

// @route   GET /api/auth/me
// @access  Private (Requires JWT middleware)
export const getProfile = async (req: Request, res: Response) => {
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
  const user = req.user as any;

  if (user) {
    const token = generateToken((user._id as mongoose.Types.ObjectId).toString());
    const clientURL = process.env.CLIENT_URL || "http://localhost:5173";
    console.log("Google OAuth success, issuing token for", user._id?.toString());
    return res.redirect(`${clientURL}/auth/callback?token=${token}`);
  } else {
    res.status(401).json({ message: "Google authentication failed." });
  }
};
