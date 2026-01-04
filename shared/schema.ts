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
  phone: text("phone").notNull(),
  travelDates: text("travel_dates"),
  groupSize: integer("group_size"),
  interestAreas: text("interest_areas").notNull(), // e.g. "Gurdwaras, Historical Places, Villages"
  message: text("message"),
  createdAt: timestamp("created_at").defaultNow(),
});

// === BASE SCHEMAS ===
export const insertProfileSchema = createInsertSchema(profiles).omit({ id: true, createdAt: true });
export const insertInquirySchema = createInsertSchema(inquiries).omit({ id: true, createdAt: true }).extend({
  phone: z.string().optional(),
  profileId: z.number().optional(),
});
export const insertTourInquirySchema = createInsertSchema(tourInquiries).omit({ id: true, createdAt: true }).extend({
  travelDates: z.string().optional(),
  groupSize: z.number().optional(),
  message: z.string().optional(),
});

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
