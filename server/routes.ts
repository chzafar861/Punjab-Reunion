import type { Express, RequestHandler } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { registerTranslateRoutes } from "./replit_integrations/translate";
import { requireSupabaseUser, optionalSupabaseUser } from "./middleware/supabaseAuth";

// Auth middleware that uses Supabase JWT tokens
const isAuthenticatedCombined: RequestHandler = async (req: any, res, next) => {
  return requireSupabaseUser(req, res, next);
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Register object storage routes for file uploads
  registerObjectStorageRoutes(app);
  
  // Register translation routes for AI-powered content translation
  registerTranslateRoutes(app);
  
  // Supabase auth endpoint to get current user info (with role)
  app.get("/api/auth/me", requireSupabaseUser, async (req: any, res) => {
    const userId = req.supabaseUser?.id;
    const userRole = await storage.getUserRole(userId);
    res.json({
      ...req.supabaseUser,
      role: userRole?.role || "member",
      canSubmitProfiles: userRole?.canSubmitProfiles || false,
      canManageProducts: userRole?.canManageProducts || false,
    });
  });
  
  // One-time setup: Make the current logged-in user an admin
  // This route is protected and only works if there are no admins yet OR if user is already admin
  app.post("/api/auth/setup-admin", requireSupabaseUser, async (req: any, res) => {
    const userId = req.supabaseUser?.id;
    
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
  app.get("/api/auth/check-username/:username", async (req, res) => {
    const { username } = req.params;
    
    if (!username || username.length < 3) {
      return res.json({ available: false, message: "Username must be at least 3 characters" });
    }
    
    try {
      // Query Supabase admin API to find users with this username in metadata
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        // Can't verify - return error to prevent potential duplicates
        return res.status(503).json({ 
          available: false, 
          error: true,
          message: "Username validation temporarily unavailable" 
        });
      }
      
      // Fetch users with pagination to handle larger user bases
      let allUsers: any[] = [];
      let page = 1;
      const perPage = 1000;
      let hasMore = true;
      
      while (hasMore) {
        const response = await fetch(`${supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=${perPage}`, {
          headers: {
            'Authorization': `Bearer ${supabaseServiceKey}`,
            'apikey': supabaseServiceKey,
          },
        });
        
        if (!response.ok) {
          console.error("Failed to fetch users for username check");
          return res.status(503).json({ 
            available: false, 
            error: true,
            message: "Username validation temporarily unavailable" 
          });
        }
        
        const data = await response.json();
        const users = data.users || [];
        allUsers = allUsers.concat(users);
        
        // Check if we got fewer users than requested, meaning no more pages
        hasMore = users.length === perPage;
        page++;
        
        // Safety limit to prevent infinite loops
        if (page > 100) break;
      }
      
      // Check if any user has this username in their metadata (case-insensitive)
      const usernameExists = allUsers.some((user: any) => 
        user.user_metadata?.username?.toLowerCase() === username.toLowerCase()
      );
      
      res.json({ 
        available: !usernameExists,
        message: usernameExists ? "Username is already taken" : "Username is available"
      });
    } catch (err) {
      console.error("Username check error:", err);
      return res.status(503).json({ 
        available: false, 
        error: true,
        message: "Username validation temporarily unavailable" 
      });
    }
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
  app.post(api.profiles.create.path, requireSupabaseUser, async (req: any, res) => {
    try {
      const userId = req.supabaseUser?.id;
      
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
  app.get("/api/my-profiles", requireSupabaseUser, async (req: any, res) => {
    const userId = req.supabaseUser?.id;
    console.log("[my-profiles] User ID from token:", userId);
    const userProfiles = await storage.getProfilesByUserId(userId);
    console.log("[my-profiles] Found profiles:", userProfiles.length);
    // Return profiles with all fields since it's the user's own data
    res.json(userProfiles);
  });

  // Protected: Update profile (only owner can update)
  app.put("/api/profiles/:id", requireSupabaseUser, async (req: any, res) => {
    try {
      const userId = req.supabaseUser?.id;
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
  app.delete("/api/profiles/:id", requireSupabaseUser, async (req: any, res) => {
    const userId = req.supabaseUser?.id;
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
  app.post("/api/profiles/:profileId/comments", optionalSupabaseUser, async (req: any, res) => {
    try {
      const profileId = Number(req.params.profileId);
      const input = api.comments.create.input.parse({ ...req.body, profileId });
      
      // Use Supabase user ID if authenticated
      const userId = req.supabaseUser?.id;
      
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
  app.put("/api/comments/:id", requireSupabaseUser, async (req: any, res) => {
    try {
      const userId = req.supabaseUser?.id;
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
  app.delete("/api/comments/:id", requireSupabaseUser, async (req: any, res) => {
    const userId = req.supabaseUser?.id;
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
    const userId = req.supabaseUser?.id;
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
  app.get("/api/admin/users", requireSupabaseUser, requireAdmin, async (req: any, res) => {
    const roles = await storage.getAllUserRoles();
    res.json(roles);
  });

  // Admin: Set user role
  app.post("/api/admin/users/:userId/role", requireSupabaseUser, requireAdmin, async (req: any, res) => {
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
  app.get("/api/admin/products", requireSupabaseUser, requireAdmin, async (req: any, res) => {
    const { status, category } = req.query;
    const products = await storage.getProducts(
      status as string,
      category as string
    );
    res.json(products);
  });

  // Admin: Create product
  app.post("/api/admin/products", requireSupabaseUser, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.supabaseUser?.id;
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
  app.put("/api/admin/products/:id", requireSupabaseUser, requireAdmin, async (req: any, res) => {
    try {
      const userId = req.supabaseUser?.id;
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
  app.delete("/api/admin/products/:id", requireSupabaseUser, requireAdmin, async (req: any, res) => {
    const userId = req.supabaseUser?.id;
    const productId = Number(req.params.id);
    const deleted = await storage.deleteProduct(productId, userId);
    if (!deleted) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json({ success: true });
  });

  // ========== ORDER ROUTES ==========

  // Protected: Get user's orders
  app.get("/api/my-orders", requireSupabaseUser, async (req: any, res) => {
    const userId = req.supabaseUser?.id;
    const orders = await storage.getOrders(userId);
    res.json(orders);
  });

  // Protected: Get single order (user can only see their own)
  app.get("/api/orders/:id", requireSupabaseUser, async (req: any, res) => {
    const userId = req.supabaseUser?.id;
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
  app.post("/api/orders", requireSupabaseUser, async (req: any, res) => {
    try {
      const userId = req.supabaseUser?.id;
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
  app.get("/api/admin/orders", requireSupabaseUser, requireAdmin, async (req: any, res) => {
    const orders = await storage.getOrders();
    res.json(orders);
  });

  // Admin: Update order status
  app.put("/api/admin/orders/:id/status", requireSupabaseUser, requireAdmin, async (req: any, res) => {
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
