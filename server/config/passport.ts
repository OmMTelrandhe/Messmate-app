// server/config/passport.ts

import passport from "passport";
import {
  Strategy as GoogleStrategy,
  VerifyCallback,
} from "passport-google-oauth20";
import User from "../models/User";
import { UserRole } from "../types"; // Import UserRole from shared types
import generateToken from "../utils/generateToken";

// The logic to serialize/deserialize the user session (required by Passport)
// We only need the user ID for simplicity.
passport.serializeUser((user: any, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// Configure the Google Strategy
const setupGoogleStrategy = () => {
  // Ensure environment variables are loaded
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error("Missing Google OAuth environment variables.");
    return;
  }

  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: process.env.GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"], // Request profile and email access
      },
      async (
        accessToken: string,
        refreshToken: string,
        profile: any,
        done: VerifyCallback
      ) => {
        try {
          // 1. Check if user already exists
          let user = await User.findOne({ googleId: profile.id });

          if (user) {
            // User exists, log them in
            return done(null, user);
          }

          // 2. Check if a user exists with the same email (for merging accounts)
          const email = profile.emails?.[0].value;
          if (email) {
            user = await User.findOne({ email });
          }

          if (user) {
            // User exists via email, link Google ID and log them in
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
          }

          // 3. User does not exist, register them
          const newUser = await User.create({
            googleId: profile.id,
            name:
              profile.displayName || profile.name.givenName || "Google User",
            email: email || "",
            // Assign the default role
            role: UserRole.STUDENT,
          });

          done(null, newUser);
        } catch (error) {
          done(error as Error, undefined);
        }
      }
    )
  );
};

export default setupGoogleStrategy;
