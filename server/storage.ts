import { db } from "./db";
import { profiles, inquiries, tourInquiries, type InsertProfile, type InsertInquiry, type InsertTourInquiry, type Profile, type Inquiry, type TourInquiry } from "@shared/schema";
import { eq, ilike, or, desc } from "drizzle-orm";

export interface IStorage {
  getProfiles(search?: string, district?: string): Promise<Profile[]>;
  getProfile(id: number): Promise<Profile | undefined>;
  createProfile(profile: InsertProfile): Promise<Profile>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  createTourInquiry(tourInquiry: InsertTourInquiry): Promise<TourInquiry>;
}

export class DatabaseStorage implements IStorage {
  async getProfiles(search?: string, district?: string): Promise<Profile[]> {
    let query = db.select().from(profiles).orderBy(desc(profiles.createdAt));
    
    const filters = [];
    if (search) {
      filters.push(or(
        ilike(profiles.fullName, `%${search}%`),
        ilike(profiles.villageName, `%${search}%`),
        ilike(profiles.district, `%${search}%`)
      ));
    }
    
    if (district) {
      filters.push(ilike(profiles.district, `%${district}%`));
    }

    if (filters.length > 0) {
       // @ts-ignore
       return await query.where(...filters);
    }
    
    return await query;
  }

  async getProfile(id: number): Promise<Profile | undefined> {
    const [profile] = await db.select().from(profiles).where(eq(profiles.id, id));
    return profile;
  }

  async createProfile(insertProfile: InsertProfile): Promise<Profile> {
    const [profile] = await db.insert(profiles).values(insertProfile).returning();
    return profile;
  }

  async createInquiry(insertInquiry: InsertInquiry): Promise<Inquiry> {
    const [inquiry] = await db.insert(inquiries).values(insertInquiry).returning();
    return inquiry;
  }

  async createTourInquiry(tourInquiry: InsertTourInquiry): Promise<TourInquiry> {
    const [inquiry] = await db.insert(tourInquiries).values(tourInquiry).returning();
    return inquiry;
  }
}

export const storage = new DatabaseStorage();
