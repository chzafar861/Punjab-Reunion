import type { Express, RequestHandler } from "express";
import { z } from "zod";
import {
  createUser,
  createVerificationToken,
  verifyEmailToken,
  getUserByEmail,
  getUserByUsername,
  verifyPassword,
  getUserById,
  createOrUpdateGoogleUser,
} from "../services/auth";
import { sendVerificationEmail } from "../services/email";
import { OAuth2Client } from "google-auth-library";

const signupSchema = z.object({
  email: z.string().email("Please enter a valid email"),
  username: z.string().min(3, "Username must be at least 3 characters").max(30, "Username too long")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const loginSchema = z.object({
  emailOrUsername: z.string().min(1, "Email or username is required"),
  password: z.string().min(1, "Password is required"),
});

const googleAuthSchema = z.object({
  credential: z.string(),
});

export function registerCustomAuthRoutes(app: Express) {
  // Signup with email/password
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const input = signupSchema.parse(req.body);
      
      // Check if email already exists
      const existingEmail = await getUserByEmail(input.email);
      if (existingEmail) {
        return res.status(400).json({ message: "Email already registered" });
      }
      
      // Check if username already exists
      const existingUsername = await getUserByUsername(input.username);
      if (existingUsername) {
        return res.status(400).json({ message: "Username already taken" });
      }
      
      // Create user
      const user = await createUser(input);
      
      // Generate verification token
      const token = await createVerificationToken(user.id);
      
      // Send verification email
      const baseUrl = `${req.protocol}://${req.get("host")}`;
      try {
        await sendVerificationEmail(input.email, token, baseUrl);
      } catch (emailError) {
        console.error("Failed to send verification email:", emailError);
      }
      
      // Log user in (set session)
      (req as any).session.userId = user.id;
      
      res.status(201).json({
        message: "Account created! Please check your email to verify your account.",
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
          profileImageUrl: user.profileImageUrl,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Signup error:", err);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  // Login with email/password
  app.post("/api/auth/login", async (req, res) => {
    try {
      const input = loginSchema.parse(req.body);
      
      // Find user by email or username
      let user = await getUserByEmail(input.emailOrUsername);
      if (!user) {
        user = await getUserByUsername(input.emailOrUsername);
      }
      
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email/username or password" });
      }
      
      // Verify password
      const validPassword = await verifyPassword(input.password, user.passwordHash);
      if (!validPassword) {
        return res.status(401).json({ message: "Invalid email/username or password" });
      }
      
      // Set session
      (req as any).session.userId = user.id;
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
          profileImageUrl: user.profileImageUrl,
        },
      });
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("Login error:", err);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  // Verify email
  app.get("/api/auth/verify-email", async (req, res) => {
    const token = req.query.token as string;
    
    if (!token) {
      return res.status(400).json({ message: "Verification token required" });
    }
    
    const result = await verifyEmailToken(token);
    
    if (!result.success) {
      return res.status(400).json({ message: "Invalid or expired verification token" });
    }
    
    res.json({ message: "Email verified successfully!" });
  });

  // Resend verification email
  app.post("/api/auth/resend-verification", async (req, res) => {
    const userId = (req as any).session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await getUserById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    if (user.emailVerified) {
      return res.status(400).json({ message: "Email already verified" });
    }
    
    const token = await createVerificationToken(user.id);
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    
    try {
      await sendVerificationEmail(user.email!, token, baseUrl);
      res.json({ message: "Verification email sent!" });
    } catch (err) {
      console.error("Failed to send verification email:", err);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });

  // Google Sign-In
  app.post("/api/auth/google", async (req, res) => {
    try {
      const { credential } = googleAuthSchema.parse(req.body);
      
      const clientId = process.env.GOOGLE_CLIENT_ID;
      if (!clientId) {
        return res.status(500).json({ message: "Google Sign-In not configured" });
      }
      
      const client = new OAuth2Client(clientId);
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      
      const payload = ticket.getPayload();
      if (!payload) {
        return res.status(400).json({ message: "Invalid Google token" });
      }
      
      const user = await createOrUpdateGoogleUser({
        googleId: payload.sub,
        email: payload.email!,
        firstName: payload.given_name,
        lastName: payload.family_name,
        profileImageUrl: payload.picture,
      });
      
      // Set session
      (req as any).session.userId = user.id;
      
      res.json({
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          emailVerified: user.emailVerified,
          profileImageUrl: user.profileImageUrl,
        },
      });
    } catch (err) {
      console.error("Google auth error:", err);
      res.status(500).json({ message: "Google Sign-In failed" });
    }
  });

  // Get current user (custom session-based)
  app.get("/api/auth/me", async (req, res) => {
    const userId = (req as any).session?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    const user = await getUserById(userId);
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    
    res.json({
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      emailVerified: user.emailVerified,
      profileImageUrl: user.profileImageUrl,
    });
  });

  // Logout
  app.post("/api/auth/custom-logout", (req, res) => {
    (req as any).session?.destroy?.(() => {});
    res.json({ message: "Logged out" });
  });
}

// Custom auth middleware
export const isCustomAuthenticated: RequestHandler = async (req, res, next) => {
  const userId = (req as any).session?.userId;
  
  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  const user = await getUserById(userId);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  
  // Attach user to request
  (req as any).user = { claims: { sub: user.id }, ...user };
  next();
};
