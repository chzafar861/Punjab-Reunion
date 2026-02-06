import type { Express, RequestHandler } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { registerTranslateRoutes } from "./replit_integrations/translate";
import { isAuthenticated, setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { authStorage } from "./replit_integrations/auth/storage";

// Helper to get user ID from session (supports both OIDC and local auth)
const getUserId = (req: any): string | undefined => {
  return req.user?.claims?.sub || req.user?.id;
};

// Middleware to require authentication and attach user info
const requireUser: RequestHandler = (req: any, res, next) => {
  if (!req.isAuthenticated || !req.isAuthenticated()) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  next();
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup Replit Auth (must be first to register /api/login, /api/callback, /api/logout)
  await setupAuth(app);
  
  // Register auth routes for /api/auth/user endpoint
  registerAuthRoutes(app);
  
  // Register object storage routes for file uploads
  registerObjectStorageRoutes(app);
  
  // Register translation routes for AI-powered content translation
  registerTranslateRoutes(app);
  
  // Email/password registration
  app.post("/api/auth/register", async (req: any, res) => {
    try {
      const schema = z.object({
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email address"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      });
      const data = schema.parse(req.body);
      const { db } = await import("./db");
      const { users } = await import("@shared/models/auth");
      const { eq } = await import("drizzle-orm");
      const [existing] = await db.select().from(users).where(eq(users.email, data.email.toLowerCase()));
      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }
      const passwordHash = await bcrypt.hash(data.password, 10);
      const [newUser] = await db.insert(users).values({
        email: data.email.toLowerCase(),
        firstName: data.firstName,
        lastName: data.lastName,
        passwordHash,
        username: data.email.toLowerCase().split("@")[0],
        emailVerified: false,
      }).returning();
      req.login({ id: newUser.id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName, profileImageUrl: newUser.profileImageUrl }, (err: any) => {
        if (err) {
          console.error("[register] Session login error:", err);
          return res.status(500).json({ message: "Account created but login failed" });
        }
        console.log(`[register] User registered: ${newUser.email} (${newUser.id})`);
        res.json({ success: true, user: { id: newUser.id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName } });
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("[register] Error:", err);
      res.status(500).json({ message: "Registration failed" });
    }
  });

  // Email/password login
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const schema = z.object({
        email: z.string().email("Invalid email address"),
        password: z.string().min(1, "Password is required"),
      });
      const data = schema.parse(req.body);
      const { db } = await import("./db");
      const { users } = await import("@shared/models/auth");
      const { eq } = await import("drizzle-orm");
      const [user] = await db.select().from(users).where(eq(users.email, data.email.toLowerCase()));
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      const valid = await bcrypt.compare(data.password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      req.login({ id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, profileImageUrl: user.profileImageUrl }, (err: any) => {
        if (err) {
          console.error("[login] Session login error:", err);
          return res.status(500).json({ message: "Login failed" });
        }
        console.log(`[login] User logged in: ${user.email} (${user.id})`);
        res.json({ success: true, user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName } });
      });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("[login] Error:", err);
      res.status(500).json({ message: "Login failed" });
    }
  });

  // Forgot password - sends reset email
  app.post("/api/auth/forgot-password", async (req: any, res) => {
    try {
      const schema = z.object({
        email: z.string().email("Invalid email address"),
      });
      const data = schema.parse(req.body);
      const { db } = await import("./db");
      const { users, passwordResetTokens } = await import("@shared/models/auth");
      const { eq } = await import("drizzle-orm");
      const { randomBytes } = await import("crypto");
      const { sendPasswordResetEmail } = await import("./services/email");

      const [user] = await db.select().from(users).where(eq(users.email, data.email.toLowerCase()));
      if (!user) {
        return res.json({ success: true, message: "If an account with that email exists, a reset link has been sent." });
      }

      const token = randomBytes(32).toString("hex");
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      const baseUrl = `${req.protocol}://${req.get("host")}`;
      try {
        await sendPasswordResetEmail(user.email!, token, baseUrl);
      } catch (emailErr) {
        console.error("[forgot-password] Email send failed:", emailErr);
      }

      console.log(`[forgot-password] Reset requested for: ${data.email}`);
      res.json({ success: true, message: "If an account with that email exists, a reset link has been sent." });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("[forgot-password] Error:", err);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  // Reset password - validates token and sets new password
  app.post("/api/auth/reset-password", async (req: any, res) => {
    try {
      const schema = z.object({
        token: z.string().min(1, "Token is required"),
        password: z.string().min(6, "Password must be at least 6 characters"),
      });
      const data = schema.parse(req.body);
      const { db } = await import("./db");
      const { users, passwordResetTokens } = await import("@shared/models/auth");
      const { eq, and } = await import("drizzle-orm");

      const [resetToken] = await db.select().from(passwordResetTokens)
        .where(and(eq(passwordResetTokens.token, data.token), eq(passwordResetTokens.used, false)));

      if (!resetToken) {
        return res.status(400).json({ message: "Invalid or expired reset link. Please request a new one." });
      }

      if (new Date() > resetToken.expiresAt) {
        await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, resetToken.id));
        return res.status(400).json({ message: "This reset link has expired. Please request a new one." });
      }

      const passwordHash = await bcrypt.hash(data.password, 10);
      await db.update(users).set({ passwordHash }).where(eq(users.id, resetToken.userId));
      await db.update(passwordResetTokens).set({ used: true }).where(eq(passwordResetTokens.id, resetToken.id));

      console.log(`[reset-password] Password reset for user: ${resetToken.userId}`);
      res.json({ success: true, message: "Password has been reset successfully. You can now sign in." });
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      console.error("[reset-password] Error:", err);
      res.status(500).json({ message: "Something went wrong. Please try again." });
    }
  });

  // Logout for local auth
  app.post("/api/auth/local-logout", (req: any, res) => {
    req.logout((err: any) => {
      if (err) {
        return res.status(500).json({ message: "Logout failed" });
      }
      req.session.destroy((err2: any) => {
        res.json({ success: true });
      });
    });
  });

  // Auth endpoint to get current user info (with role)
  app.get("/api/auth/me", requireUser, async (req: any, res) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userRole = await storage.getUserRole(userId);
    const claims = req.user?.claims || {};
    const localUser = req.user || {};
    res.json({
      id: userId,
      email: claims.email || localUser.email || null,
      username: (claims.email || localUser.email)?.split('@')[0] || null,
      firstName: claims.first_name || localUser.firstName || null,
      lastName: claims.last_name || localUser.lastName || null,
      profileImageUrl: claims.profile_image_url || localUser.profileImageUrl || null,
      role: userRole?.role || "member",
      canSubmitProfiles: userRole?.canSubmitProfiles || false,
      canManageProducts: userRole?.canManageProducts || false,
    });
  });
  
  // Check if any admins exist (for showing/hiding setup button)
  app.get("/api/auth/has-admin", async (req, res) => {
    try {
      const allRoles = await storage.getAllUserRoles();
      const existingAdmins = allRoles.filter(r => r.role === "admin");
      res.json({ hasAdmin: existingAdmins.length > 0 });
    } catch (error) {
      res.json({ hasAdmin: true }); // Default to true to hide button on error
    }
  });

  // One-time setup: Make the current logged-in user an admin
  // This route is protected and only works if there are no admins yet OR if user is already admin
  app.post("/api/auth/setup-admin", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    
    try {
      // Check if user is already admin or if there are no admins
      const existingRole = await storage.getUserRole(userId);
      const allRoles = await storage.getAllUserRoles();
      const existingAdmins = allRoles.filter(r => r.role === "admin");
      
      // Allow if: no admins exist OR user is already admin
      if (existingAdmins.length === 0 || existingRole?.role === "admin") {
        const userRole = await storage.setUserRole(userId, "admin", true, true);
        console.log(`[setup-admin] User ${userId} set as admin`);
        res.json({ 
          success: true, 
          message: "You are now an admin",
          role: userRole 
        });
      } else {
        res.status(403).json({ 
          success: false, 
          message: "Admin already exists. Contact existing admin to grant permissions." 
        });
      }
    } catch (error: any) {
      console.error("[setup-admin] Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Check if username is available (for signup validation)
  // With Replit Auth, usernames are managed by Replit
  app.get("/api/auth/check-username/:username", async (req, res) => {
    const { username } = req.params;
    
    if (!username || username.length < 3) {
      return res.json({ available: false, message: "Username must be at least 3 characters" });
    }
    
    // With Replit Auth, username uniqueness is handled by Replit
    res.json({ available: true, message: "Username is available" });
  });
  
  // === PROFILES ===
  app.get(api.profiles.list.path, async (req, res) => {
    const { search, district } = req.query;
    const profiles = await storage.getProfiles(
      typeof search === 'string' ? search : undefined,
      typeof district === 'string' ? district : undefined
    );
    const publicProfiles = profiles.map((profile) => ({
      id: profile.id,
      fullName: profile.fullName,
      villageName: profile.villageName,
      district: profile.district,
      yearLeft: profile.yearLeft,
      currentLocation: profile.currentLocation,
      story: profile.story,
      photoUrl: profile.photoUrl,
      createdAt: profile.createdAt,
    }));
    res.json(publicProfiles);
  });

  app.get(api.profiles.get.path, async (req, res) => {
    const profile = await storage.getProfile(Number(req.params.id));
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    const publicProfile = {
      id: profile.id,
      userId: profile.userId, // Include for ownership check
      fullName: profile.fullName,
      villageName: profile.villageName,
      district: profile.district,
      yearLeft: profile.yearLeft,
      currentLocation: profile.currentLocation,
      story: profile.story,
      photoUrl: profile.photoUrl,
      createdAt: profile.createdAt,
    };
    res.json(publicProfile);
  });

  // Protected: Create profile (requires login and submission permission)
  app.post(api.profiles.create.path, isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      
      // Check if user has permission to submit profiles
      const userRole = await storage.getUserRole(userId);
      const canSubmit = userRole?.role === "admin" || userRole?.canSubmitProfiles === true;
      
      if (!canSubmit) {
        return res.status(403).json({ 
          message: "You don't have permission to submit profiles. Please contact an administrator." 
        });
      }
      
      const input = api.profiles.create.input.parse(req.body);
      const profile = await storage.createProfile({ ...input, userId });
      const publicProfile = {
        id: profile.id,
        fullName: profile.fullName,
        villageName: profile.villageName,
        district: profile.district,
        yearLeft: profile.yearLeft,
        currentLocation: profile.currentLocation,
        story: profile.story,
        photoUrl: profile.photoUrl,
        createdAt: profile.createdAt,
      };
      res.status(201).json(publicProfile);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Protected: Get current user's profiles (includes private fields since it's their own data)
  app.get("/api/my-profiles", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    console.log("[my-profiles] User ID from token:", userId);
    const userProfiles = await storage.getProfilesByUserId(userId);
    console.log("[my-profiles] Found profiles:", userProfiles.length);
    // Return profiles with all fields since it's the user's own data
    res.json(userProfiles);
  });

  // Protected: Update profile (only owner can update)
  app.put("/api/profiles/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const profileId = Number(req.params.id);
      const input = api.profiles.create.input.partial().parse(req.body);
      const updated = await storage.updateProfile(profileId, userId, input);
      if (!updated) {
        return res.status(403).json({ message: "Not authorized to update this profile" });
      }
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Protected: Delete profile (only owner can delete) - also deletes photo from storage
  app.delete("/api/profiles/:id", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const profileId = Number(req.params.id);
    
    // First get the profile to retrieve the photo URL for cleanup
    const profile = await storage.getProfile(profileId);
    
    const deleted = await storage.deleteProfile(profileId, userId);
    if (!deleted) {
      return res.status(403).json({ message: "Not authorized to delete this profile" });
    }
    
    // If profile had a photo, delete it from Supabase storage
    if (profile?.photoUrl) {
      try {
        const { supabaseAdmin } = await import("./lib/supabase");
        // Extract file path from the photo URL
        const bucket = "profile-photos";
        let filePath: string | null = null;
        
        try {
          const url = new URL(profile.photoUrl);
          const regex = new RegExp(`/${bucket}/(.+)$`);
          const match = url.pathname.match(regex);
          if (match) filePath = match[1];
          if (!filePath) {
            const storageMatch = profile.photoUrl.match(new RegExp(`${bucket}/([^?]+)`));
            filePath = storageMatch ? storageMatch[1] : null;
          }
        } catch {
          const match = profile.photoUrl.match(new RegExp(`${bucket}/([^?]+)`));
          filePath = match ? match[1] : null;
        }
        
        if (filePath) {
          await supabaseAdmin.storage.from(bucket).remove([filePath]);
          console.log(`Deleted photo ${filePath} for profile ${profileId}`);
        }
      } catch (err) {
        // Log but don't fail the request - profile is already deleted
        console.error(`Failed to delete photo for profile ${profileId}:`, err);
      }
    }
    
    res.json({ success: true });
  });

  // === INQUIRIES ===
  app.post(api.inquiries.create.path, async (req, res) => {
    try {
      console.log("Received inquiry request:", JSON.stringify(req.body));
      const input = api.inquiries.create.input.parse(req.body);
      console.log("Parsed input:", JSON.stringify(input));
      const inquiry = await storage.createInquiry(input);
      console.log("Inquiry saved successfully:", inquiry.id);
      res.status(201).json(inquiry);
    } catch (err: any) {
      console.error("Inquiry creation error:", err?.message || err);
      console.error("Error stack:", err?.stack);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to save inquiry. Please try again.", error: err?.message });
    }
  });

  // === TOURS ===
  app.post(api.tours.create.path, async (req, res) => {
    try {
      const input = api.tours.create.input.parse(req.body);
      const inquiry = await storage.createTourInquiry(input);
      res.status(201).json(inquiry);
    } catch (err) {
      console.error("Tour inquiry creation error:", err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Failed to save tour inquiry. Please try again." });
    }
  });

  // === PROFILE COMMENTS ===
  app.get("/api/profiles/:profileId/comments", async (req, res) => {
    const profileId = Number(req.params.profileId);
    const comments = await storage.getProfileComments(profileId);
    res.json(comments);
  });

  // Create comment - optionally authenticated (stores userId if logged in)
  app.post("/api/profiles/:profileId/comments", async (req: any, res) => {
    try {
      const profileId = Number(req.params.profileId);
      const input = api.comments.create.input.parse({ ...req.body, profileId });
      
      // Use user ID if authenticated
      const userId = getUserId(req);
      
      const comment = await storage.createProfileComment({ ...input, userId });
      res.status(201).json(comment);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  // Protected: Update comment (only owner can update)
  app.put("/api/comments/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const commentId = Number(req.params.id);
      const { content } = req.body;
      
      if (!content || typeof content !== 'string') {
        return res.status(400).json({ message: "Content is required" });
      }
      
      const updated = await storage.updateProfileComment(commentId, userId, content);
      if (!updated) {
        return res.status(403).json({ message: "Not authorized to update this comment" });
      }
      res.json(updated);
    } catch (err) {
      throw err;
    }
  });

  // Protected: Delete comment (only owner can delete)
  app.delete("/api/comments/:id", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const commentId = Number(req.params.id);
    const deleted = await storage.deleteProfileComment(commentId, userId);
    if (!deleted) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }
    res.json({ success: true });
  });

  // ========== ADMIN ROUTES ==========

  // Admin middleware helper
  const requireAdmin = async (req: any, res: any, next: any) => {
    const userId = getUserId(req);
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const userRole = await storage.getUserRole(userId);
    if (!userRole || userRole.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    req.userRole = userRole;
    next();
  };

  // Admin: Get all user roles
  app.get("/api/admin/users", isAuthenticated, requireAdmin, async (req: any, res) => {
    const roles = await storage.getAllUserRoles();
    res.json(roles);
  });

  // Admin: Set user role
  app.post("/api/admin/users/:userId/role", isAuthenticated, requireAdmin, async (req: any, res) => {
    const { userId } = req.params;
    const { role, canSubmitProfiles, canManageProducts } = req.body;
    
    if (!["admin", "contributor", "member"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    
    const updated = await storage.setUserRole(
      userId,
      role,
      canSubmitProfiles ?? false,
      canManageProducts ?? false
    );
    res.json(updated);
  });

  // ========== SUBSCRIPTION REQUESTS ==========
  
  // Protected: Create subscription request
  app.post("/api/subscription-requests", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { fullName, email, phone, country, city, reason, plan } = req.body;
      
      if (!fullName || !email || !phone || !country || !city || !reason) {
        return res.status(400).json({ message: "All fields are required" });
      }
      
      // Validate plan type
      const validPlan = ["contributor", "seller"].includes(plan) ? plan : "contributor";
      
      const request = await storage.createSubscriptionRequest({
        userId,
        fullName,
        email,
        phone,
        country,
        city,
        reason,
        plan: validPlan,
      });
      
      res.status(201).json(request);
    } catch (err: any) {
      console.error("Subscription request error:", err);
      res.status(500).json({ message: err.message || "Failed to submit request" });
    }
  });

  // Admin: Get all subscription requests
  app.get("/api/admin/subscription-requests", isAuthenticated, requireAdmin, async (req: any, res) => {
    const requests = await storage.getSubscriptionRequests();
    res.json(requests);
  });

  // Admin: Update subscription request status and grant permission
  app.put("/api/admin/subscription-requests/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const requestId = Number(req.params.id);
      const { status } = req.body;
      
      if (!["approved", "rejected"].includes(status)) {
        return res.status(400).json({ message: "Invalid status" });
      }
      
      const request = await storage.updateSubscriptionRequestStatus(requestId, status);
      
      if (!request) {
        return res.status(404).json({ message: "Request not found" });
      }
      
      // If approved, grant the user appropriate permissions based on plan
      if (status === "approved") {
        const canSubmitProfiles = true; // Both plans get this
        const canManageProducts = request.plan === "seller"; // Only seller plan gets shop access
        await storage.setUserRole(request.userId, "contributor", canSubmitProfiles, canManageProducts);
      }
      
      res.json(request);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ========== PRODUCT ROUTES ==========

  // Public: Get all published products
  app.get("/api/products", async (req, res) => {
    const { status, category } = req.query;
    // Non-admin users can only see published products
    const products = await storage.getProducts(
      status as string || "published",
      category as string
    );
    res.json(products);
  });

  // Public: Get single product
  app.get("/api/products/:id", async (req, res) => {
    const product = await storage.getProduct(Number(req.params.id));
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  // Admin: Get all products (including drafts)
  app.get("/api/admin/products", isAuthenticated, requireAdmin, async (req: any, res) => {
    const { status, category } = req.query;
    const products = await storage.getProducts(
      status as string,
      category as string
    );
    res.json(products);
  });

  // Admin: Create product
  app.post("/api/admin/products", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { title, description, price, currency, category, imageUrl, status, inventoryCount } = req.body;
      
      if (!title || !description || price === undefined) {
        return res.status(400).json({ message: "Title, description, and price are required" });
      }
      
      const product = await storage.createProduct({
        adminId: userId,
        title,
        description,
        price: Math.round(Number(price)),
        currency: currency || "PKR",
        category,
        imageUrl,
        status: status || "draft",
        inventoryCount: inventoryCount || 0,
      });
      res.status(201).json(product);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Admin: Update product
  app.put("/api/admin/products/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const productId = Number(req.params.id);
      const updateData = req.body;
      
      if (updateData.price !== undefined) {
        updateData.price = Math.round(Number(updateData.price));
      }
      
      const updated = await storage.updateProduct(productId, userId, updateData);
      if (!updated) {
        return res.status(404).json({ message: "Product not found" });
      }
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Admin: Delete product
  app.delete("/api/admin/products/:id", isAuthenticated, requireAdmin, async (req: any, res) => {
    const userId = getUserId(req);
    const productId = Number(req.params.id);
    const deleted = await storage.deleteProduct(productId, userId);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ success: true });
  });

  // ========== ORDER ROUTES ==========

  // Protected: Get user's orders
  app.get("/api/my-orders", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const orders = await storage.getOrders(userId);
    res.json(orders);
  });

  // Protected: Get single order (user can only see their own)
  app.get("/api/orders/:id", isAuthenticated, async (req: any, res) => {
    const userId = getUserId(req);
    const order = await storage.getOrder(Number(req.params.id));
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    // Check if admin or order owner
    const userRole = await storage.getUserRole(userId);
    if (order.userId !== userId && userRole?.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" });
    }
    
    const items = await storage.getOrderItems(order.id);
    res.json({ ...order, items });
  });

  // Protected: Create order
  app.post("/api/orders", isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { 
        customerName, customerEmail, customerPhone, customerPhone2,
        country, province, city, streetAddress, notes, items 
      } = req.body;
      
      if (!customerName || !customerEmail || !items || !items.length) {
        return res.status(400).json({ message: "Customer name, email, and items are required" });
      }
      
      // Calculate total
      let totalAmount = 0;
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (!product) {
          return res.status(400).json({ message: `Product ${item.productId} not found` });
        }
        totalAmount += product.price * (item.quantity || 1);
      }
      
      // Create combined shipping address for display
      const shippingAddress = [streetAddress, city, province, country].filter(Boolean).join(", ");
      
      // Create order
      const order = await storage.createOrder({
        userId,
        status: "pending",
        totalAmount,
        currency: "PKR",
        customerName,
        customerEmail,
        customerPhone,
        customerPhone2,
        country,
        province,
        city,
        streetAddress,
        shippingAddress,
        notes,
      });
      
      // Create order items
      for (const item of items) {
        const product = await storage.getProduct(item.productId);
        if (product) {
          await storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity || 1,
            unitPrice: product.price,
            productTitle: product.title,
          });
        }
      }
      
      res.status(201).json(order);
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // Admin: Get all orders
  app.get("/api/admin/orders", isAuthenticated, requireAdmin, async (req: any, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  // Admin: Update order status
  app.put("/api/admin/orders/:id/status", isAuthenticated, requireAdmin, async (req: any, res) => {
    const orderId = Number(req.params.id);
    const { status } = req.body;
    
    const validStatuses = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }
    
    const updated = await storage.updateOrderStatus(orderId, status);
    if (!updated) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(updated);
  });

  // Seed data if empty (non-blocking)
  seedDatabase().catch((err) => {
    console.warn("Database seeding failed (database may still be initializing):", err.message);
  });

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getProfiles();
  if (existing.length === 0) {
    await storage.createProfile({
      fullName: "Sardar Gurbakhsh Singh",
      villageName: "Lyallpur",
      district: "Faisalabad",
      yearLeft: 1947,
      currentLocation: "Jalandhar, India",
      story: "My family left Lyallpur in August 1947. We had a large farm near the canal. I am looking for information about our neighbors, the Khan family, who helped us escape safely to the border.",
      photoUrl: "https://images.unsplash.com/photo-1544717297-fa95b6ee9643",
    });
    
    await storage.createProfile({
      fullName: "Bibi Harnam Kaur",
      villageName: "Rawalpindi",
      district: "Rawalpindi",
      yearLeft: 1947,
      currentLocation: "Ludhiana, India",
      story: "We lived in the main bazaar of Rawalpindi. My father owned a cloth shop. We left in a hurry and I lost contact with my childhood friend, Fatima. I wish to know if she is still there.",
      photoUrl: "https://images.unsplash.com/photo-1566753323558-f4e0952af115",
    });

    await storage.createProfile({
      fullName: "Sardar Kartar Singh Sarabha (Descendant)",
      villageName: "Sarabha",
      district: "Ludhiana",
      yearLeft: 1915, 
      currentLocation: "USA",
      story: "While my ancestor is famous, many of our extended family moved to Pakistan side before partition and we lost touch. We are from the lineage of freedom fighters.",
      photoUrl: "https://images.unsplash.com/photo-1595152772835-219674b2a8a6",
    });
  }
}
