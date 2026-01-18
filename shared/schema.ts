import { pgTable, text, serial, integer, timestamp, varchar, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Re-export auth models
export * from "./models/auth";
export * from "./models/chat";

// === ROLE TYPES ===
export const userRoleEnum = ["admin", "contributor", "member"] as const;
export type UserRole = typeof userRoleEnum[number];

// === TABLE DEFINITIONS ===

// User roles table for permission management
export const userRoles = pgTable("user_roles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique(), // Links to Supabase auth user
  role: varchar("role").notNull().default("member"), // admin, contributor, member
  canSubmitProfiles: boolean("can_submit_profiles").default(false),
  canManageProducts: boolean("can_manage_products").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Products table for shop
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  adminId: varchar("admin_id").notNull(), // User who created this product
  title: text("title").notNull(),
  description: text("description").notNull(),
  price: integer("price").notNull(), // Price in cents
  currency: varchar("currency").notNull().default("PKR"),
  category: text("category"),
  imageUrl: text("image_url"),
  status: varchar("status").notNull().default("draft"), // draft, published, archived
  inventoryCount: integer("inventory_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Orders table
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Customer who placed the order
  status: varchar("status").notNull().default("pending"), // pending, confirmed, processing, shipped, delivered, cancelled
  totalAmount: integer("total_amount").notNull(), // Total in cents
  currency: varchar("currency").notNull().default("PKR"),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone"),
  customerPhone2: text("customer_phone_2"), // Optional second phone number
  country: text("country"),
  province: text("province"),
  city: text("city"),
  streetAddress: text("street_address"), // Home address
  shippingAddress: text("shipping_address"), // Legacy field (combined address)
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order items table
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(), // Links to orders table
  productId: integer("product_id").notNull(), // Links to products table
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull(), // Price at time of order (in cents)
  productTitle: text("product_title").notNull(), // Snapshot of product title
  createdAt: timestamp("created_at").defaultNow(),
});
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id"), // Owner of this profile (links to users table)
  fullName: text("full_name").notNull(),
  villageName: text("village_name").notNull(),
  district: text("district").notNull(),
  yearLeft: integer("year_left"),
  currentLocation: text("current_location"),
  story: text("story").notNull(),
  photoUrl: text("photo_url"),
  email: text("email"),
  phone: text("phone"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const profileComments = pgTable("profile_comments", {
  id: serial("id").primaryKey(),
  profileId: integer("profile_id").notNull(),
  userId: varchar("user_id"), // Owner of this comment (for edit/delete permissions)
  authorName: text("author_name").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  message: text("message").notNull(),
  profileId: integer("profile_id"), // Optional link to a profile
  createdAt: timestamp("created_at").defaultNow(),
});

export const tourInquiries = pgTable("tour_inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  travelDates: text("travel_dates"),
  groupSize: integer("group_size"),
  interestAreas: text("interest_areas").notNull(), // e.g. "Gurdwaras, Historical Places, Villages"
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Subscription requests for users wanting to become contributors
export const subscriptionRequests = pgTable("subscription_requests", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull(), // Links to Supabase auth user
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  country: text("country").notNull(),
  city: text("city").notNull(),
  reason: text("reason").notNull(),
  status: varchar("status").notNull().default("pending"), // pending, approved, rejected
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true }).extend({
  email: z.string().email().optional(),
  phone: z.string().optional(),
});
export const insertInquirySchema = createInsertSchema(inquiries).omit({ id: true, createdAt: true }).extend({
  phone: z.string().optional(),
  profileId: z.number().optional(),
});
export const insertTourInquirySchema = createInsertSchema(tourInquiries).omit({ id: true, createdAt: true }).extend({
  travelDates: z.string().optional(),
  groupSize: z.number().optional(),
  message: z.string().optional(),
});
export const insertProfileCommentSchema = createInsertSchema(profileComments).omit({ id: true, createdAt: true });

// Subscription request schema
export const insertSubscriptionRequestSchema = createInsertSchema(subscriptionRequests).omit({ id: true, createdAt: true, updatedAt: true, status: true });

// User roles schemas
export const insertUserRoleSchema = createInsertSchema(userRoles).omit({ id: true, createdAt: true, updatedAt: true });

// Product schemas
export const insertProductSchema = createInsertSchema(products).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  price: z.number().min(0),
  category: z.string().optional(),
  imageUrl: z.string().optional(),
  inventoryCount: z.number().min(0).optional(),
});

// Order schemas
export const insertOrderSchema = createInsertSchema(orders).omit({ id: true, createdAt: true, updatedAt: true }).extend({
  customerPhone: z.string().optional(),
  shippingAddress: z.string().optional(),
  notes: z.string().optional(),
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type TourInquiry = typeof tourInquiries.$inferSelect;
export type InsertTourInquiry = z.infer<typeof insertTourInquirySchema>;
export type ProfileComment = typeof profileComments.$inferSelect;
export type InsertProfileComment = z.infer<typeof insertProfileCommentSchema>;

// New types for roles, products, orders
export type UserRoleRecord = typeof userRoles.$inferSelect;
export type InsertUserRole = z.infer<typeof insertUserRoleSchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type SubscriptionRequest = typeof subscriptionRequests.$inferSelect;
export type InsertSubscriptionRequest = z.infer<typeof insertSubscriptionRequestSchema>;

export type CreateProfileRequest = InsertProfile;
export type CreateInquiryRequest = InsertInquiry;
export type CreateTourInquiryRequest = InsertTourInquiry;
export type CreateProfileCommentRequest = InsertProfileComment;
export type CreateProductRequest = InsertProduct;
export type CreateOrderRequest = InsertOrder;

export type ProfileResponse = Profile;
export type ProfilesListResponse = Profile[];
export type ProfileCommentsListResponse = ProfileComment[];
export type ProductResponse = Product;
export type ProductsListResponse = Product[];
export type OrderResponse = Order;
export type OrdersListResponse = Order[];
