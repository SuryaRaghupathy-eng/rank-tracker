import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Saved keywords table for persistent tracking
export const savedKeywords = pgTable("saved_keywords", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  websiteUrl: text("website_url").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const savedKeywordsRelations = relations(savedKeywords, ({ many }) => ({
  rankingHistory: many(rankingHistory),
}));

export const insertSavedKeywordSchema = createInsertSchema(savedKeywords).omit({
  id: true,
  createdAt: true,
});

export type InsertSavedKeyword = z.infer<typeof insertSavedKeywordSchema>;
export type SavedKeyword = typeof savedKeywords.$inferSelect;

// Ranking history table for tracking position changes over time
export const rankingHistory = pgTable("ranking_history", {
  id: serial("id").primaryKey(),
  keywordId: integer("keyword_id").notNull().references(() => savedKeywords.id, { onDelete: "cascade" }),
  position: integer("position"),
  title: text("title"),
  snippet: text("snippet"),
  foundUrl: text("found_url"),
  checkedAt: timestamp("checked_at").defaultNow().notNull(),
});

export const rankingHistoryRelations = relations(rankingHistory, ({ one }) => ({
  keyword: one(savedKeywords, {
    fields: [rankingHistory.keywordId],
    references: [savedKeywords.id],
  }),
}));

export const insertRankingHistorySchema = createInsertSchema(rankingHistory).omit({
  id: true,
  checkedAt: true,
});

export type InsertRankingHistory = z.infer<typeof insertRankingHistorySchema>;
export type RankingHistory = typeof rankingHistory.$inferSelect;

// Keyword tracking types
export const timeRangeSchema = z.enum(["current", "week", "month"]);
export type TimeRange = z.infer<typeof timeRangeSchema>;

export const keywordTrackingSchema = z.object({
  keyword: z.string().min(1, "Keyword is required"),
  websiteUrl: z.string().url("Please enter a valid URL"),
  timeRange: timeRangeSchema.optional().default("current"),
  compareEnabled: z.boolean().optional().default(false),
  compareTimeRange: timeRangeSchema.optional(),
});

export type KeywordTracking = z.infer<typeof keywordTrackingSchema>;

export const rankingResultSchema = z.object({
  keyword: z.string(),
  websiteUrl: z.string(),
  currentPosition: z.number().nullable(),
  previousPosition: z.number().nullable(),
  change: z.number().nullable(),
  title: z.string().nullable(),
  snippet: z.string().nullable(),
  foundUrl: z.string().nullable(),
  timeRange: timeRangeSchema,
  compareTimeRange: timeRangeSchema.nullable(),
  checkedAt: z.string(),
});

export type RankingResult = z.infer<typeof rankingResultSchema>;

export const batchKeywordSchema = z.object({
  keywords: z.string().min(1, "At least one keyword is required"),
  websiteUrl: z.string().url("Please enter a valid URL"),
  compareEnabled: z.boolean().optional().default(false),
  compareTimeRange: timeRangeSchema.optional(),
});

export type BatchKeywordInput = z.infer<typeof batchKeywordSchema>;

// Serper API response types
export interface SerperOrganicResult {
  title: string;
  link: string;
  snippet: string;
  date?: string;
  position: number;
}

export interface SerperSearchResponse {
  searchParameters: {
    q: string;
    type: string;
    tbs?: string;
    engine: string;
  };
  organic: SerperOrganicResult[];
  credits: number;
}
