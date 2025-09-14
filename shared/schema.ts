import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  mobileNumber: text("mobile_number").notNull().unique(),
  ageGroup: text("age_group").notNull(),
  language: text("language").notNull().default("hi"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const farms = pgTable("farms", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  state: text("state").notNull(),
  district: text("district").notNull(),
  taluk: text("taluk").notNull(),
  gramPanchayat: text("gram_panchayat").notNull(),
  village: text("village").notNull(),
  farmSize: text("farm_size").notNull(),
  soilType: text("soil_type").notNull(),
  primaryCrops: jsonb("primary_crops").$type<string[]>().notNull(),
  waterSource: text("water_source").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quests = pgTable("quests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(),
  coinReward: integer("coin_reward").notNull(),
  xpReward: integer("xp_reward").notNull(),
  badgeReward: text("badge_reward"),
  steps: jsonb("steps").$type<string[]>().notNull(),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userQuests = pgTable("user_quests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  questId: varchar("quest_id").references(() => quests.id).notNull(),
  status: text("status").notNull().default("not_started"), // not_started, in_progress, completed
  progress: jsonb("progress").$type<boolean[]>().notNull().default([]),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const userProgress = pgTable("user_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull().unique(),
  level: integer("level").notNull().default(1),
  totalXp: integer("total_xp").notNull().default(0),
  totalCoins: integer("total_coins").notNull().default(0),
  sustainabilityScore: integer("sustainability_score").notNull().default(0),
  badges: jsonb("badges").$type<string[]>().notNull().default([]),
  completedQuests: integer("completed_quests").notNull().default(0),
});

export const schemes = pgTable("schemes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  eligibilityCriteria: jsonb("eligibility_criteria").$type<string[]>().notNull(),
  benefits: text("benefits").notNull(),
  applicationSteps: jsonb("application_steps").$type<string[]>().notNull(),
  documentsRequired: jsonb("documents_required").$type<string[]>().notNull(),
  isActive: boolean("is_active").default(true),
});

export const userSchemes = pgTable("user_schemes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  schemeId: varchar("scheme_id").references(() => schemes.id).notNull(),
  status: text("status").notNull().default("not_started"), // not_started, in_progress, approved, rejected
  applicationData: jsonb("application_data").$type<Record<string, any>>().default({}),
  appliedAt: timestamp("applied_at"),
  approvedAt: timestamp("approved_at"),
});

export const marketPrices = pgTable("market_prices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  crop: text("crop").notNull(),
  variety: text("variety"),
  price: integer("price").notNull(),
  unit: text("unit").notNull().default("quintal"),
  mandi: text("mandi").notNull(),
  district: text("district").notNull(),
  state: text("state").notNull(),
  date: timestamp("date").notNull(),
  trend: text("trend"), // up, down, stable
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertFarmSchema = createInsertSchema(farms).omit({
  id: true,
  createdAt: true,
});

export const insertQuestSchema = createInsertSchema(quests).omit({
  id: true,
  createdAt: true,
});

export const insertUserQuestSchema = createInsertSchema(userQuests).omit({
  id: true,
  createdAt: true,
});

export const insertUserProgressSchema = createInsertSchema(userProgress).omit({
  id: true,
});

export const insertSchemeSchema = createInsertSchema(schemes).omit({
  id: true,
});

export const insertUserSchemeSchema = createInsertSchema(userSchemes).omit({
  id: true,
});

export const insertMarketPriceSchema = createInsertSchema(marketPrices).omit({
  id: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Farm = typeof farms.$inferSelect;
export type InsertFarm = z.infer<typeof insertFarmSchema>;

export type Quest = typeof quests.$inferSelect;
export type InsertQuest = z.infer<typeof insertQuestSchema>;

export type UserQuest = typeof userQuests.$inferSelect;
export type InsertUserQuest = z.infer<typeof insertUserQuestSchema>;

export type UserProgress = typeof userProgress.$inferSelect;
export type InsertUserProgress = z.infer<typeof insertUserProgressSchema>;

export type Scheme = typeof schemes.$inferSelect;
export type InsertScheme = z.infer<typeof insertSchemeSchema>;

export type UserScheme = typeof userSchemes.$inferSelect;
export type InsertUserScheme = z.infer<typeof insertUserSchemeSchema>;

export type MarketPrice = typeof marketPrices.$inferSelect;
export type InsertMarketPrice = z.infer<typeof insertMarketPriceSchema>;
