import type { Express } from "express";
import { createServer, type Server } from "http";
import { batchKeywordSchema, insertSavedKeywordSchema, type RankingResult, type TimeRange, type SerperSearchResponse } from "@shared/schema";
import { storage } from "./storage";

const SERPER_API_KEY = process.env.SERPER_API_KEY;

function getTimeRangeParam(timeRange: TimeRange): string | undefined {
  switch (timeRange) {
    case "week":
      return "qdr:w";
    case "month":
      return "qdr:m";
    case "current":
    default:
      return undefined;
  }
}

async function searchSerper(keyword: string, timeRange?: TimeRange, country?: string): Promise<SerperSearchResponse> {
  const payload: Record<string, string> = {
    q: keyword,
  };

  const tbs = timeRange ? getTimeRangeParam(timeRange) : undefined;
  if (tbs) {
    payload.tbs = tbs;
  }

  if (country) {
    payload.gl = country;
  }

  console.log(`Serper API Request - Keyword: "${keyword}", TimeRange: ${timeRange}, Country: ${country}, TBS: ${tbs}`);
  console.log(`Payload: ${JSON.stringify(payload)}`);

  const response = await fetch("https://google.serper.dev/search", {
    method: "POST",
    headers: {
      "X-API-KEY": SERPER_API_KEY || "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Serper API error: ${response.status} ${response.statusText}`);
  }

  const result = await response.json();
  console.log(`Serper API Response - Results count: ${result.organic?.length || 0}`);
  if (result.organic && result.organic.length > 0) {
    console.log(`First 3 results: ${result.organic.slice(0, 3).map((r: any) => r.link).join(', ')}`);
  }
  
  return result;
}

function normalizeUrl(url: string): string {
  return url.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function extractBaseDomain(url: string): string {
  const normalized = normalizeUrl(url);
  const domain = normalized.split("/")[0];
  // Remove www. prefix for comparison
  return domain.replace(/^www\./, "");
}

function findWebsitePosition(
  searchResults: SerperSearchResponse,
  websiteUrl: string
): { position: number | null; title: string | null; snippet: string | null; foundUrl: string | null } {
  const targetBaseDomain = extractBaseDomain(websiteUrl);
  const organicResults = searchResults.organic || [];
  
  console.log(`Searching for domain: ${targetBaseDomain} in ${organicResults.length} results`);

  for (let i = 0; i < organicResults.length; i++) {
    const result = organicResults[i];
    const resultBaseDomain = extractBaseDomain(result.link);
    
    // Match by base domain (e.g., forbes.com matches www.forbes.com)
    if (
      resultBaseDomain === targetBaseDomain ||
      resultBaseDomain.endsWith("." + targetBaseDomain) ||
      targetBaseDomain.endsWith("." + resultBaseDomain)
    ) {
      // Use result.position if available, otherwise use array index + 1
      const position = result.position ?? (i + 1);
      console.log(`Found match at position ${position}: ${result.link}`);
      return {
        position,
        title: result.title,
        snippet: result.snippet,
        foundUrl: result.link,
      };
    }
  }

  console.log(`No match found for ${targetBaseDomain}`);
  return { position: null, title: null, snippet: null, foundUrl: null };
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // Check rankings for multiple keywords
  app.post("/api/rankings/check", async (req, res) => {
    try {
      const validationResult = batchKeywordSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validationResult.error.errors,
        });
      }

      const { keywords, websiteUrl, country, compareEnabled, compareTimeRange } = validationResult.data;

      if (!SERPER_API_KEY) {
        return res.status(500).json({
          error: "Serper API key not configured",
        });
      }

      // Parse keywords (one per line)
      const keywordList = keywords
        .split("\n")
        .map((k) => k.trim())
        .filter((k) => k.length > 0);

      if (keywordList.length === 0) {
        return res.status(400).json({
          error: "No valid keywords provided",
        });
      }

      const results: RankingResult[] = [];

      for (const keyword of keywordList) {
        try {
          // Get current rankings
          const currentSearch = await searchSerper(keyword, "current", country);
          const currentResult = findWebsitePosition(currentSearch, websiteUrl);

          let previousPosition: number | null = null;
          let change: number | null = null;

          // If comparison is enabled, get previous period rankings
          if (compareEnabled && compareTimeRange) {
            try {
              const previousSearch = await searchSerper(keyword, compareTimeRange, country);
              const previousResult = findWebsitePosition(previousSearch, websiteUrl);
              previousPosition = previousResult.position;

              // Calculate change (positive = improvement, negative = decline)
              if (currentResult.position !== null && previousPosition !== null) {
                change = previousPosition - currentResult.position;
              }
            } catch (error) {
              console.error(`Error fetching previous rankings for "${keyword}":`, error);
            }
          }

          results.push({
            keyword,
            websiteUrl,
            currentPosition: currentResult.position,
            previousPosition,
            change,
            title: currentResult.title,
            snippet: currentResult.snippet,
            foundUrl: currentResult.foundUrl,
            timeRange: "current",
            compareTimeRange: compareEnabled ? compareTimeRange || null : null,
            checkedAt: new Date().toISOString(),
          });

          // Small delay to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, 200));
        } catch (error) {
          console.error(`Error processing keyword "${keyword}":`, error);
          results.push({
            keyword,
            websiteUrl,
            currentPosition: null,
            previousPosition: null,
            change: null,
            title: null,
            snippet: null,
            foundUrl: null,
            timeRange: "current",
            compareTimeRange: compareEnabled ? compareTimeRange || null : null,
            checkedAt: new Date().toISOString(),
          });
        }
      }

      return res.json(results);
    } catch (error) {
      console.error("Error checking rankings:", error);
      return res.status(500).json({
        error: "Failed to check rankings",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Get all saved keywords
  app.get("/api/keywords", async (_req, res) => {
    try {
      const keywords = await storage.getSavedKeywords();
      return res.json(keywords);
    } catch (error) {
      console.error("Error fetching keywords:", error);
      return res.status(500).json({
        error: "Failed to fetch keywords",
      });
    }
  });

  // Save a new keyword
  app.post("/api/keywords", async (req, res) => {
    try {
      const validationResult = insertSavedKeywordSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Validation failed",
          details: validationResult.error.errors,
        });
      }

      const saved = await storage.createSavedKeyword(validationResult.data);
      return res.status(201).json(saved);
    } catch (error) {
      console.error("Error saving keyword:", error);
      return res.status(500).json({
        error: "Failed to save keyword",
      });
    }
  });

  // Delete a saved keyword
  app.delete("/api/keywords/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid keyword ID" });
      }

      const deleted = await storage.deleteSavedKeyword(id);
      if (!deleted) {
        return res.status(404).json({ error: "Keyword not found" });
      }

      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting keyword:", error);
      return res.status(500).json({
        error: "Failed to delete keyword",
      });
    }
  });

  // Get ranking history for a keyword
  app.get("/api/keywords/:id/history", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid keyword ID" });
      }

      const keyword = await storage.getSavedKeyword(id);
      if (!keyword) {
        return res.status(404).json({ error: "Keyword not found" });
      }

      const history = await storage.getRankingHistory(id);
      return res.json({ keyword, history });
    } catch (error) {
      console.error("Error fetching history:", error);
      return res.status(500).json({
        error: "Failed to fetch history",
      });
    }
  });

  // Check ranking for a saved keyword and save to history
  app.post("/api/keywords/:id/check", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ error: "Invalid keyword ID" });
      }

      const keyword = await storage.getSavedKeyword(id);
      if (!keyword) {
        return res.status(404).json({ error: "Keyword not found" });
      }

      if (!SERPER_API_KEY) {
        return res.status(500).json({
          error: "Serper API key not configured",
        });
      }

      const searchResult = await searchSerper(keyword.keyword, "current");
      const result = findWebsitePosition(searchResult, keyword.websiteUrl);

      // Save to history
      const historyRecord = await storage.createRankingHistory({
        keywordId: id,
        position: result.position,
        title: result.title,
        snippet: result.snippet,
        foundUrl: result.foundUrl,
      });

      return res.json({
        keyword,
        result: {
          ...result,
          checkedAt: historyRecord.checkedAt,
        },
      });
    } catch (error) {
      console.error("Error checking keyword:", error);
      return res.status(500).json({
        error: "Failed to check keyword",
      });
    }
  });

  return httpServer;
}
