import {
  type InsertProfile,
  type InsertInquiry,
  type InsertTourInquiry,
  type InsertProfileComment,
  type Profile,
  type Inquiry,
  type TourInquiry,
  type ProfileComment,
} from "@shared/schema";
import { SupabaseStorage } from "./storage.supabase";

export interface IStorage {
  getProfiles(search?: string, district?: string): Promise<Profile[]>;
  getProfile(id: number): Promise<Profile | undefined>;
  getProfilesByUserId(userId: string): Promise<Profile[]>;
  createProfile(profile: InsertProfile & { userId?: string }): Promise<Profile>;
  updateProfile(
    id: number,
    userId: string,
    profile: Partial<InsertProfile>
  ): Promise<Profile | null>;
  deleteProfile(id: number, userId: string): Promise<boolean>;
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  createTourInquiry(tourInquiry: InsertTourInquiry): Promise<TourInquiry>;
  getProfileComments(profileId: number): Promise<ProfileComment[]>;
  getProfileComment(id: number): Promise<ProfileComment | undefined>;
  createProfileComment(
    comment: InsertProfileComment & { userId?: string }
  ): Promise<ProfileComment>;
  updateProfileComment(
    id: number,
    userId: string,
    content: string
  ): Promise<ProfileComment | null>;
  deleteProfileComment(id: number, userId: string): Promise<boolean>;
}

export const storage: IStorage = new SupabaseStorage();
