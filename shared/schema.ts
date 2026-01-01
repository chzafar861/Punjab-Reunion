import { pgTable, text, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// === TABLE DEFINITIONS ===
export const profiles = pgTable("profiles", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  villageName: text("village_name").notNull(),
  district: text("district").notNull(),
  yearLeft: integer("year_left"),
  currentLocation: text("current_location"),
  story: text("story").notNull(),
  photoUrl: text("photo_url"),
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
  phone: text("phone"),
  interests: text("interests").notNull(), // Places they want to visit
  travelDate: text("travel_date"),
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true });
export const insertInquirySchema = createInsertSchema(inquiries).omit({ id: true, createdAt: true });
export const insertTourInquirySchema = createInsertSchema(tourInquiries).omit({ id: true, createdAt: true });

// === EXPLICIT API CONTRACT TYPES ===
export type Profile = typeof profiles.$inferSelect;
export type InsertProfile = z.infer<typeof insertProfileSchema>;
export type Inquiry = typeof inquiries.$inferSelect;
export type InsertInquiry = z.infer<typeof insertInquirySchema>;
export type TourInquiry = typeof tourInquiries.$inferSelect;
export type InsertTourInquiry = z.infer<typeof insertTourInquirySchema>;

export type CreateProfileRequest = InsertProfile;
export type CreateInquiryRequest = InsertInquiry;
export type CreateTourInquiryRequest = InsertTourInquiry;

export type ProfileResponse = Profile;
export type ProfilesListResponse = Profile[];
