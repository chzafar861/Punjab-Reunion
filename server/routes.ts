import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { registerObjectStorageRoutes } from "./replit_integrations/object_storage";
import { setupAuth, isAuthenticated, registerAuthRoutes } from "./replit_integrations/auth";
import { registerCustomAuthRoutes, isCustomAuthenticated } from "./routes/customAuth";

// Combined auth middleware - checks both Replit Auth and custom auth
const isAuthenticatedCombined = async (req: any, res: any, next: any) => {
  // First check custom session auth
  const userId = req.session?.userId;
  if (userId) {
    const { getUserById } = await import("./services/auth");
    const user = await getUserById(userId);
    if (user) {
      req.user = { claims: { sub: user.id }, ...user };
      return next();
    }
  }
  
  // Fall back to Replit Auth
  return isAuthenticated(req, res, next);
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Setup authentication BEFORE other routes
  await setupAuth(app);
  registerAuthRoutes(app);
  
  // Register custom auth routes (email/password, Google)
  registerCustomAuthRoutes(app);
  
  // Register object storage routes for file uploads
  registerObjectStorageRoutes(app);
  
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

  // Protected: Create profile (requires login)
  app.post(api.profiles.create.path, isAuthenticatedCombined, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
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
  app.get("/api/my-profiles", isAuthenticatedCombined, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const userProfiles = await storage.getProfilesByUserId(userId);
    // Return profiles with all fields since it's the user's own data
    res.json(userProfiles);
  });

  // Protected: Update profile (only owner can update)
  app.put("/api/profiles/:id", isAuthenticatedCombined, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
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

  // Protected: Delete profile (only owner can delete)
  app.delete("/api/profiles/:id", isAuthenticatedCombined, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const profileId = Number(req.params.id);
    const deleted = await storage.deleteProfile(profileId, userId);
    if (!deleted) {
      return res.status(403).json({ message: "Not authorized to delete this profile" });
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
      
      // Check if user is authenticated (either custom or Replit auth)
      let userId: string | undefined;
      if (req.session?.userId) {
        const { getUserById } = await import("./services/auth");
        const user = await getUserById(req.session.userId);
        if (user) {
          userId = user.id;
        }
      } else if (req.user?.claims?.sub) {
        userId = req.user.claims.sub;
      }
      
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
  app.put("/api/comments/:id", isAuthenticatedCombined, async (req: any, res) => {
    try {
      const userId = req.user?.claims?.sub;
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
  app.delete("/api/comments/:id", isAuthenticatedCombined, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const commentId = Number(req.params.id);
    const deleted = await storage.deleteProfileComment(commentId, userId);
    if (!deleted) {
      return res.status(403).json({ message: "Not authorized to delete this comment" });
    }
    res.json({ success: true });
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
