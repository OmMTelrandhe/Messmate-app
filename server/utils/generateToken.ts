import jwt from "jsonwebtoken";
import { Response } from "express";
import mongoose from "mongoose";

const generateTokenAndSetCookie = (
  res: Response,
  userId: mongoose.Types.ObjectId
) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
    expiresIn: "30d", // Token expires in 30 days
  });

  res.cookie("jwt", token, {
    httpOnly: true, // IMPORTANT: Prevents XSS attacks from reading the cookie
    secure: process.env.NODE_ENV !== "development", // Use secure only in production (HTTPS)
    sameSite: "strict", // Mitigates CSRF attacks
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

export default generateTokenAndSetCookie;
