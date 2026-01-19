import {
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
import { DatabaseStorage } from "./storage.database";

export interface IStorage {
  // Profiles
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
  
  // Inquiries
  createInquiry(inquiry: InsertInquiry): Promise<Inquiry>;
  createTourInquiry(tourInquiry: InsertTourInquiry): Promise<TourInquiry>;
  
  // Comments
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
  
  // User Roles
  getUserRole(userId: string): Promise<UserRoleRecord | undefined>;
  setUserRole(userId: string, role: string, canSubmitProfiles: boolean, canManageProducts: boolean): Promise<UserRoleRecord>;
  getAllUserRoles(): Promise<UserRoleRecord[]>;
  
  // Products
  getProducts(status?: string, category?: string): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct & { adminId: string }): Promise<Product>;
  updateProduct(id: number, adminId: string, product: Partial<InsertProduct>): Promise<Product | null>;
  deleteProduct(id: number, adminId: string): Promise<boolean>;
  
  // Orders
  getOrders(userId?: string): Promise<Order[]>;
  getOrder(id: number): Promise<Order | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | null>;
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // Subscription Requests
  getSubscriptionRequests(): Promise<SubscriptionRequest[]>;
  getSubscriptionRequest(id: number): Promise<SubscriptionRequest | undefined>;
  createSubscriptionRequest(request: any): Promise<SubscriptionRequest>;
  updateSubscriptionRequestStatus(id: number, status: string): Promise<SubscriptionRequest | null>;
}

export const storage: IStorage = new DatabaseStorage();
