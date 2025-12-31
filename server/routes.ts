import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // === PROFILES ===
  app.get(api.profiles.list.path, async (req, res) => {
    const { search, district } = req.query;
    // Basic validation of query params is good, though strict parsing isn't always needed for optional strings
    const profiles = await storage.getProfiles(
      typeof search === 'string' ? search : undefined,
      typeof district === 'string' ? district : undefined
    );
    res.json(profiles);
  });

  app.get(api.profiles.get.path, async (req, res) => {
    const profile = await storage.getProfile(Number(req.params.id));
    if (!profile) {
      return res.status(404).json({ message: 'Profile not found' });
    }
    res.json(profile);
  });

  app.post(api.profiles.create.path, async (req, res) => {
    try {
      const input = api.profiles.create.input.parse(req.body);
      const profile = await storage.createProfile(input);
      res.status(201).json(profile);
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

  // === INQUIRIES ===
  app.post(api.inquiries.create.path, async (req, res) => {
    try {
      const input = api.inquiries.create.input.parse(req.body);
      const inquiry = await storage.createInquiry(input);
      res.status(201).json(inquiry);
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

  // Seed data if empty
  await seedDatabase();

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
