import type { Types } from "mongoose";

declare module "express-serve-static-core" {
  interface Request {
    user?: {
      _id: Types.ObjectId;
      role: string;
    };
  }
}

declare global {
  namespace Express {
    interface User {
      _id: Types.ObjectId;
      role: string;
    }
  }
}

export {};
