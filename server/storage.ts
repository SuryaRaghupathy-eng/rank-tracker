import { 
  users, type User, type InsertUser,
  savedKeywords, type SavedKeyword, type InsertSavedKeyword,
  rankingHistory, type RankingHistory, type InsertRankingHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Saved keywords CRUD
  getSavedKeywords(): Promise<SavedKeyword[]>;
  getSavedKeyword(id: number): Promise<SavedKeyword | undefined>;
  createSavedKeyword(keyword: InsertSavedKeyword): Promise<SavedKeyword>;
  deleteSavedKeyword(id: number): Promise<boolean>;
  
  // Ranking history CRUD
  getRankingHistory(keywordId: number): Promise<RankingHistory[]>;
  createRankingHistory(history: InsertRankingHistory): Promise<RankingHistory>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Saved keywords operations
  async getSavedKeywords(): Promise<SavedKeyword[]> {
    return await db.select().from(savedKeywords).orderBy(desc(savedKeywords.createdAt));
  }

  async getSavedKeyword(id: number): Promise<SavedKeyword | undefined> {
    const [keyword] = await db.select().from(savedKeywords).where(eq(savedKeywords.id, id));
    return keyword || undefined;
  }

  async createSavedKeyword(keyword: InsertSavedKeyword): Promise<SavedKeyword> {
    const [saved] = await db
      .insert(savedKeywords)
      .values(keyword)
      .returning();
    return saved;
  }

  async deleteSavedKeyword(id: number): Promise<boolean> {
    const result = await db.delete(savedKeywords).where(eq(savedKeywords.id, id)).returning();
    return result.length > 0;
  }

  // Ranking history operations
  async getRankingHistory(keywordId: number): Promise<RankingHistory[]> {
    return await db
      .select()
      .from(rankingHistory)
      .where(eq(rankingHistory.keywordId, keywordId))
      .orderBy(desc(rankingHistory.checkedAt));
  }

  async createRankingHistory(history: InsertRankingHistory): Promise<RankingHistory> {
    const [record] = await db
      .insert(rankingHistory)
      .values(history)
      .returning();
    return record;
  }
}

export const storage = new DatabaseStorage();
