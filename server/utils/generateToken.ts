// import jwt from "jsonwebtoken";
// import { Response } from "express";
// import mongoose from "mongoose";

// const generateTokenAndSetCookie = (
//   res: Response,
//   userId: mongoose.Types.ObjectId
// ) => {
//   const token = jwt.sign({ userId }, process.env.JWT_SECRET!, {
//     expiresIn: "30d", // Token expires in 30 days
//   });

//   res.cookie("jwt", token, {
//     httpOnly: true, // IMPORTANT: Prevents XSS attacks from reading the cookie
//     secure: process.env.NODE_ENV !== "development", // Use secure only in production (HTTPS)
//     sameSite: "strict", // Mitigates CSRF attacks
//     maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
//   });
// };

// export default generateTokenAndSetCookie;


import jwt from "jsonwebtoken";

// Use a fallback for the secret, but ensure it is set in Railway env variables
const JWT_SECRET = process.env.JWT_SECRET || "a-strong-jwt-fallback-secret-for-dev";

// Generates a token containing the user's ID, signed with the secret.
const generateToken = (id: string): string => {
  return jwt.sign({ id }, JWT_SECRET, {
    expiresIn: "30d", // Token is valid for 30 days
  });
};

export default generateToken;
