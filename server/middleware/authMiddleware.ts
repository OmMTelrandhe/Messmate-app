// server/middleware/authMiddleware.ts

import { Request, Response, NextFunction, RequestHandler } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";
import mongoose from "mongoose";
import { UserRole } from "../types";

const protect: RequestHandler = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({ message: "Not authorized, no token." });
  }

  try {
    console.log("Auth: Bearer token received");
    const envSecret = process.env.JWT_SECRET;
    const fallbackSecret = "a-strong-jwt-fallback-secret-for-dev";
    const decodedPreview = jwt.decode(token, { complete: true }) as any;
    console.log(
      "Auth: token header",
      decodedPreview?.header,
      "payload",
      decodedPreview?.payload
    );
    let decoded: JwtPayload & { id: string };
    try {
      decoded = jwt.verify(token, envSecret || fallbackSecret) as JwtPayload & {
        id: string;
      };
    } catch (e: any) {
      if (envSecret && e?.name === "JsonWebTokenError") {
        console.warn("Auth: env secret failed, trying fallback");
        decoded = jwt.verify(token, fallbackSecret) as JwtPayload & {
          id: string;
        };
      } else {
        throw e;
      }
    }
    console.log("Auth: decoded payload", decoded);

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      console.warn("Auth: user not found for id", decoded.id);
      return res.status(404).json({ message: "User not found." });
    }

    req.user = {
      _id: user._id as mongoose.Types.ObjectId,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error("Auth: verification error", error);
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
