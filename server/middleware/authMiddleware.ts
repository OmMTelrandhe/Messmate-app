// server/middleware/authMiddleware.ts

import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import mongoose from "mongoose";
import { UserRole } from "../types";

const protect: RequestHandler = async (req, res, next) => {
  let token;

  // 1. Check for the JWT cookie
  // The cookie-parser middleware ensures 'req.cookies.jwt' is available
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (!token) {
    // No token found, user is not authorized
    return res.status(401).json({ message: "Not authorized, no token." });
  }

  try {
    // 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload & {
      userId: string;
    };

    // 3. Find the user in the database (excluding the sensitive password field)
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    // 4. Attach the user object to the request for access in controllers
    req.user = {
      _id: user._id as mongoose.Types.ObjectId,
      role: user.role,
    };

    next(); // Proceed to the next middleware or controller
  } catch (error) {
    console.error("JWT verification failed:", error);
    // Clear the invalid token cookie
    res.cookie("jwt", "", { httpOnly: true, expires: new Date(0) });
    res
      .status(401)
      .json({ message: "Not authorized, token failed or expired." });
  }
};

const isOwner: RequestHandler = (req, res, next) => {
  const user = req.user as { role?: string } | undefined;
  if (user?.role === UserRole.OWNER) {
    next();
  } else {
    res.status(403).json({
      message: "Forbidden: Only Mess Owners can perform this action.",
    });
  }
};

export { protect, isOwner };
