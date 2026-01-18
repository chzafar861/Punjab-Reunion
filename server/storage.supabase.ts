import { supabaseAdmin } from "./lib/supabase";
import type {
  InsertProfile,
  InsertInquiry,
  InsertTourInquiry,
  InsertProfileComment,
  InsertProduct,
  InsertOrder,
  InsertOrderItem,
  Profile,
  Inquiry,
  TourInquiry,
  ProfileComment,
  UserRoleRecord,
  Product,
  Order,
  OrderItem,
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

  // User Roles
  async getUserRole(userId: string): Promise<UserRoleRecord | undefined> {
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error || !data) return undefined;
    return snakeToCamel(data) as UserRoleRecord;
  }

  async setUserRole(
    userId: string,
    role: string,
    canSubmitProfiles: boolean,
    canManageProducts: boolean
  ): Promise<UserRoleRecord> {
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .upsert({
        user_id: userId,
        role,
        can_submit_profiles: canSubmitProfiles,
        can_manage_products: canManageProducts,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("Error setting user role:", error);
      throw new Error(error.message);
    }
    return snakeToCamel(data) as UserRoleRecord;
  }

  async getAllUserRoles(): Promise<UserRoleRecord[]> {
    const { data, error } = await supabaseAdmin
      .from("user_roles")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching user roles:", error);
      return [];
    }
    return (data || []).map(snakeToCamel) as UserRoleRecord[];
  }

  // Products
  async getProducts(status?: string, category?: string): Promise<Product[]> {
    let query = supabaseAdmin
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (status) {
      query = query.eq("status", status);
    }
    if (category) {
      query = query.eq("category", category);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching products:", error);
      return [];
    }
    return (data || []).map(snakeToCamel) as Product[];
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return undefined;
    return snakeToCamel(data) as Product;
  }

  async createProduct(product: InsertProduct & { adminId: string }): Promise<Product> {
    const snakeProduct = camelToSnake(product);
    const { data, error } = await supabaseAdmin
      .from("products")
      .insert(snakeProduct)
      .select()
      .single();

    if (error) {
      console.error("Error creating product:", error);
      throw new Error(error.message);
    }
    return snakeToCamel(data) as Product;
  }

  async updateProduct(
    id: number,
    adminId: string,
    updateData: Partial<InsertProduct>
  ): Promise<Product | null> {
    const existing = await this.getProduct(id);
    if (!existing) {
      return null;
    }

    const { adminId: _, ...rest } = updateData as any;
    const snakeData = camelToSnake(rest);
    snakeData.updated_at = new Date().toISOString();

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(snakeData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating product:", error);
      return null;
    }
    return snakeToCamel(data) as Product;
  }

  async deleteProduct(id: number, adminId: string): Promise<boolean> {
    const { error } = await supabaseAdmin
      .from("products")
      .delete()
      .eq("id", id);
    return !error;
  }

  // Orders
  async getOrders(userId?: string): Promise<Order[]> {
    let query = supabaseAdmin
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    if (error) {
      console.error("Error fetching orders:", error);
      return [];
    }
    return (data || []).map(snakeToCamel) as Order[];
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) return undefined;
    return snakeToCamel(data) as Order;
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const snakeOrder = camelToSnake(order);
    const { data, error } = await supabaseAdmin
      .from("orders")
      .insert(snakeOrder)
      .select()
      .single();

    if (error) {
      console.error("Error creating order:", error);
      throw new Error(error.message);
    }
    return snakeToCamel(data) as Order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | null> {
    const { data, error } = await supabaseAdmin
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating order status:", error);
      return null;
    }
    return snakeToCamel(data) as Order;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    const { data, error } = await supabaseAdmin
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    if (error) {
      console.error("Error fetching order items:", error);
      return [];
    }
    return (data || []).map(snakeToCamel) as OrderItem[];
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const snakeItem = camelToSnake(item);
    const { data, error } = await supabaseAdmin
      .from("order_items")
      .insert(snakeItem)
      .select()
      .single();

    if (error) {
      console.error("Error creating order item:", error);
      throw new Error(error.message);
    }
    return snakeToCamel(data) as OrderItem;
  }
}
