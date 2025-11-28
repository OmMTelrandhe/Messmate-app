import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcryptjs";
// Define the UserRole enum inline to avoid missing module error
export enum UserRole {
  STUDENT = "STUDENT",
  ADMIN = "ADMIN",
}

// Define the interface for the User document
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Optional for Google login
  googleId?: string; // For Google login
  role: UserRole;
  matchPassword: (enteredPassword: string) => Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // Only required for local auth
    googleId: { type: String, required: false }, // Only required for Google auth
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.STUDENT,
    },
  },
  {
    timestamps: true,
  }
);

// --- Middleware: Hash password before saving ---
UserSchema.pre("save", async function (next) {
  // Only hash if the password field is present and modified
  if (!this.isModified("password") || !this.password) {
    return next;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password as string, salt);
  return next;
});

// --- Method: Compare entered password with stored hash ---
UserSchema.methods.matchPassword = async function (enteredPassword: string) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model<IUser>("User", UserSchema);
export default User;
