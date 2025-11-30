import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import User from "../models/User";

// Define the custom request type to include the user property
interface AuthRequest extends Request {
  user?: any;
}

// Use the same fallback secret as in generateToken.ts
const JWT_SECRET = process.env.JWT_SECRET || "a-strong-jwt-fallback-secret-for-dev";

const jwtAuth = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  // 1. Check if the token is present in the Authorization header
  // Header format: Authorization: Bearer <token>
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // Get token from header (split "Bearer <token>" and take the second part)
      token = req.headers.authorization.split(" ")[1];

      // 2. Verify the token
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

      // 3. Find the user based on the decoded ID and attach it to the request
      // We exclude the password for security, even though it's likely not present on a Google-only login
      req.user = await User.findById(decoded.id).select("-password");

      if (req.user) {
        next(); // Token is valid, proceed to the route handler
      } else {
        res.status(401).json({ message: "Not authorized, user not found" });
      }
    } catch (error) {
      console.error("JWT Verification Error:", error);
      // If verification fails (e.g., token expired or invalid signature)
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  }

  // 4. If no token is provided in the header
  if (!token) {
    res.status(401).json({ message: "Not authorized, no token" });
  }
};

export default jwtAuth;
