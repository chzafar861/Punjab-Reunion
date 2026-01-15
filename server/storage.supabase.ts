import { supabaseAdmin } from "./lib/supabase";
import type {
  InsertProfile,
  InsertInquiry,
  InsertTourInquiry,
  InsertProfileComment,
  Profile,
  Inquiry,
  TourInquiry,
  ProfileComment,
} from "@shared/schema";
import type { IStorage } from "./storage";

function snakeToCamel(obj: Record<string, any>): any {
  const result: Record<string, any> = {};
  for (const key in obj) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = obj[key];
  }
  return result;
}

function camelToSnake(obj: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
      result[snakeKey] = obj[key];
    }
  }
  return result;
}

export class SupabaseStorage implements IStorage {
  async getProfiles(search?: string, district?: string): Promise<Profile[]> {
    let query = supabaseAdmin
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(
        `full_name.ilike.%${search}%,village_name.ilike.%${search}%,district.ilike.%${search}%`
      );
    }

    if (district) {
      query = query.ilike("district", `%${district}%`);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching profiles:", error);
      return [];
    }
    return (data || []).map(snakeToCamel) as Profile[];
  }

  async getProfile(id: number): Promise<Profile | undefined> {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return undefined;
    return snakeToCamel(data) as Profile;
  }

  async getProfilesByUserId(userId: string): Promise<Profile[]> {
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user profiles:", error);
      return [];
    }
    return (data || []).map(snakeToCamel) as Profile[];
  }

  async createProfile(profile: InsertProfile & { userId?: string }): Promise<Profile> {
    const snakeProfile = camelToSnake(profile);
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .insert(snakeProfile)
      .select()
      .single();

    if (error) {
      console.error("Error creating profile:", error);
      throw new Error(error.message);
    }
    return snakeToCamel(data) as Profile;
  }

  async updateProfile(
    id: number,
    userId: string,
    updateData: Partial<InsertProfile>
  ): Promise<Profile | null> {
    const existing = await this.getProfile(id);
    if (!existing || existing.userId !== userId) {
      return null;
    }

    const { userId: _, ...rest } = updateData as any;
    const snakeData = camelToSnake(rest);

    const { data, error } = await supabaseAdmin
      .from("profiles")
      .update(snakeData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating profile:", error);
      return null;
    }
    return snakeToCamel(data) as Profile;
  }

  async deleteProfile(id: number, userId: string): Promise<boolean> {
    const existing = await this.getProfile(id);
    if (!existing || existing.userId !== userId) {
      return false;
    }

    const { error } = await supabaseAdmin.from("profiles").delete().eq("id", id);
    return !error;
  }

  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const snakeInquiry = camelToSnake(inquiry);
    const { data, error } = await supabaseAdmin
      .from("inquiries")
      .insert(snakeInquiry)
      .select()
      .single();

    if (error) {
      console.error("Error creating inquiry:", error);
      throw new Error(error.message);
    }
    return snakeToCamel(data) as Inquiry;
  }

  async createTourInquiry(tourInquiry: InsertTourInquiry): Promise<TourInquiry> {
    const snakeData = camelToSnake(tourInquiry);
    const { data, error } = await supabaseAdmin
      .from("tour_inquiries")
      .insert(snakeData)
      .select()
      .single();

    if (error) {
      console.error("Error creating tour inquiry:", error);
      throw new Error(error.message);
    }
    return snakeToCamel(data) as TourInquiry;
  }

  async getProfileComments(profileId: number): Promise<ProfileComment[]> {
    const { data, error } = await supabaseAdmin
      .from("profile_comments")
      .select("*")
      .eq("profile_id", profileId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
    return (data || []).map(snakeToCamel) as ProfileComment[];
  }

  async getProfileComment(id: number): Promise<ProfileComment | undefined> {
    const { data, error } = await supabaseAdmin
      .from("profile_comments")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return undefined;
    return snakeToCamel(data) as ProfileComment;
  }

  async createProfileComment(
    comment: InsertProfileComment & { userId?: string }
  ): Promise<ProfileComment> {
    const snakeComment = camelToSnake(comment);
    const { data, error } = await supabaseAdmin
      .from("profile_comments")
      .insert(snakeComment)
      .select()
      .single();

    if (error) {
      console.error("Error creating comment:", error);
      throw new Error(error.message);
    }
    return snakeToCamel(data) as ProfileComment;
  }

  async updateProfileComment(
    id: number,
    userId: string,
    content: string
  ): Promise<ProfileComment | null> {
    const existing = await this.getProfileComment(id);
    if (!existing || existing.userId !== userId) {
      return null;
    }

    const { data, error } = await supabaseAdmin
      .from("profile_comments")
      .update({ content })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating comment:", error);
      return null;
    }
    return snakeToCamel(data) as ProfileComment;
  }

  async deleteProfileComment(id: number, userId: string): Promise<boolean> {
    const existing = await this.getProfileComment(id);
    if (!existing || existing.userId !== userId) {
      return false;
    }

    const { error } = await supabaseAdmin
      .from("profile_comments")
      .delete()
      .eq("id", id);
    return !error;
  }
}
