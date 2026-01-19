import { db } from "./db";
import { eq, like, or, desc } from "drizzle-orm";
import {
  profiles,
  inquiries,
  tourInquiries,
  profileComments,
  userRoles,
  products,
  orders,
  orderItems,
  subscriptionRequests,
  type InsertProfile,
  type InsertInquiry,
  type InsertTourInquiry,
  type InsertProfileComment,
  type InsertProduct,
  type InsertOrder,
  type InsertOrderItem,
  type Profile,
  type Inquiry,
  type TourInquiry,
  type ProfileComment,
  type UserRoleRecord,
  type Product,
  type Order,
  type OrderItem,
  type SubscriptionRequest,
} from "@shared/schema";
import type { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // Profiles
  async getProfiles(search?: string, district?: string): Promise<Profile[]> {
    let query = db.select().from(profiles).orderBy(desc(profiles.createdAt));
    
    if (search || district) {
      const conditions = [];
      if (search) {
        conditions.push(
          or(
            like(profiles.fullName, `%${search}%`),
            like(profiles.villageName, `%${search}%`),
            like(profiles.story, `%${search}%`)
          )
        );
      }
      if (district) {
        conditions.push(eq(profiles.district, district));
      }
      if (conditions.length > 0) {
        query = query.where(conditions.length === 1 ? conditions[0] : or(...conditions)) as any;
      }
    }
    
    return await query;
  }

  async getProfile(id: number): Promise<Profile | undefined> {
    const result = await db.select().from(profiles).where(eq(profiles.id, id));
    return result[0];
  }

  async getProfilesByUserId(userId: string): Promise<Profile[]> {
    return await db.select().from(profiles).where(eq(profiles.userId, userId)).orderBy(desc(profiles.createdAt));
  }

  async createProfile(profile: InsertProfile & { userId?: string }): Promise<Profile> {
    const result = await db.insert(profiles).values(profile).returning();
    return result[0];
  }

  async updateProfile(id: number, userId: string, profile: Partial<InsertProfile>): Promise<Profile | null> {
    const existing = await this.getProfile(id);
    if (!existing || existing.userId !== userId) {
      return null;
    }
    const result = await db.update(profiles).set(profile).where(eq(profiles.id, id)).returning();
    return result[0] || null;
  }

  async deleteProfile(id: number, userId: string): Promise<boolean> {
    const existing = await this.getProfile(id);
    if (!existing || existing.userId !== userId) {
      return false;
    }
    await db.delete(profiles).where(eq(profiles.id, id));
    return true;
  }

  // Inquiries
  async createInquiry(inquiry: InsertInquiry): Promise<Inquiry> {
    const result = await db.insert(inquiries).values(inquiry).returning();
    return result[0];
  }

  async createTourInquiry(tourInquiry: InsertTourInquiry): Promise<TourInquiry> {
    const result = await db.insert(tourInquiries).values(tourInquiry).returning();
    return result[0];
  }

  // Comments
  async getProfileComments(profileId: number): Promise<ProfileComment[]> {
    return await db.select().from(profileComments).where(eq(profileComments.profileId, profileId)).orderBy(desc(profileComments.createdAt));
  }

  async getProfileComment(id: number): Promise<ProfileComment | undefined> {
    const result = await db.select().from(profileComments).where(eq(profileComments.id, id));
    return result[0];
  }

  async createProfileComment(comment: InsertProfileComment & { userId?: string }): Promise<ProfileComment> {
    const result = await db.insert(profileComments).values(comment).returning();
    return result[0];
  }

  async updateProfileComment(id: number, userId: string, content: string): Promise<ProfileComment | null> {
    const existing = await this.getProfileComment(id);
    if (!existing || existing.userId !== userId) {
      return null;
    }
    const result = await db.update(profileComments).set({ content }).where(eq(profileComments.id, id)).returning();
    return result[0] || null;
  }

  async deleteProfileComment(id: number, userId: string): Promise<boolean> {
    const existing = await this.getProfileComment(id);
    if (!existing || existing.userId !== userId) {
      return false;
    }
    await db.delete(profileComments).where(eq(profileComments.id, id));
    return true;
  }

  // User Roles
  async getUserRole(userId: string): Promise<UserRoleRecord | undefined> {
    const result = await db.select().from(userRoles).where(eq(userRoles.userId, userId));
    return result[0];
  }

  async setUserRole(userId: string, role: string, canSubmitProfiles: boolean, canManageProducts: boolean): Promise<UserRoleRecord> {
    const existing = await this.getUserRole(userId);
    
    if (existing) {
      const result = await db.update(userRoles)
        .set({ role, canSubmitProfiles, canManageProducts, updatedAt: new Date() })
        .where(eq(userRoles.userId, userId))
        .returning();
      return result[0];
    } else {
      const result = await db.insert(userRoles)
        .values({ userId, role, canSubmitProfiles, canManageProducts })
        .returning();
      return result[0];
    }
  }

  async getAllUserRoles(): Promise<UserRoleRecord[]> {
    return await db.select().from(userRoles).orderBy(desc(userRoles.createdAt));
  }

  // Products
  async getProducts(status?: string, category?: string): Promise<Product[]> {
    let query = db.select().from(products).orderBy(desc(products.createdAt));
    
    const conditions = [];
    if (status) conditions.push(eq(products.status, status));
    if (category) conditions.push(eq(products.category, category));
    
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : or(...conditions)) as any;
    }
    
    return await query;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.select().from(products).where(eq(products.id, id));
    return result[0];
  }

  async createProduct(product: InsertProduct & { adminId: string }): Promise<Product> {
    const result = await db.insert(products).values(product).returning();
    return result[0];
  }

  async updateProduct(id: number, adminId: string, product: Partial<InsertProduct>): Promise<Product | null> {
    const existing = await this.getProduct(id);
    if (!existing) return null;
    
    const result = await db.update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(eq(products.id, id))
      .returning();
    return result[0] || null;
  }

  async deleteProduct(id: number, adminId: string): Promise<boolean> {
    const existing = await this.getProduct(id);
    if (!existing) return false;
    
    await db.delete(products).where(eq(products.id, id));
    return true;
  }

  // Orders
  async getOrders(userId?: string): Promise<Order[]> {
    if (userId) {
      return await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt));
    }
    return await db.select().from(orders).orderBy(desc(orders.createdAt));
  }

  async getOrder(id: number): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id));
    return result[0];
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(order).returning();
    return result[0];
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | null> {
    const result = await db.update(orders)
      .set({ status, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning();
    return result[0] || null;
  }

  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(item: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(item).returning();
    return result[0];
  }

  // Subscription Requests
  async getSubscriptionRequests(): Promise<SubscriptionRequest[]> {
    return await db.select().from(subscriptionRequests).orderBy(desc(subscriptionRequests.createdAt));
  }

  async getSubscriptionRequest(id: number): Promise<SubscriptionRequest | undefined> {
    const result = await db.select().from(subscriptionRequests).where(eq(subscriptionRequests.id, id));
    return result[0];
  }

  async createSubscriptionRequest(request: any): Promise<SubscriptionRequest> {
    const result = await db.insert(subscriptionRequests).values(request).returning();
    return result[0];
  }

  async updateSubscriptionRequestStatus(id: number, status: string): Promise<SubscriptionRequest | null> {
    const result = await db.update(subscriptionRequests)
      .set({ status, updatedAt: new Date() })
      .where(eq(subscriptionRequests.id, id))
      .returning();
    return result[0] || null;
  }
}
