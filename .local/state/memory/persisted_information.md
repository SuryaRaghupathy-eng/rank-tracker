# SEO Keyword Ranking Tracker - Session State

## Project Overview
Building an SEO keyword ranking tracker that monitors website positions in Google search results using the Serper API.

## Current Task: Task 4 - Persistent Storage
Status: IN_PROGRESS

### What needs to be done:
1. Create PostgreSQL database using create_postgresql_database_tool
2. Add database tables to shared/schema.ts:
   - savedKeywords: id, keyword, websiteUrl, createdAt
   - rankingHistory: id, keywordId, position, title, snippet, foundUrl, checkedAt
3. Update server/storage.ts with CRUD operations for keywords and history
4. Add new API endpoints in server/routes.ts:
   - GET /api/keywords - list saved keywords
   - POST /api/keywords - save a keyword
   - DELETE /api/keywords/:id - remove keyword
   - GET /api/keywords/:id/history - get ranking history
   - POST /api/rankings/check should also save results to history
5. Update frontend to display saved keywords and allow management

## Completed Tasks (MVP)
1. **Schema & Frontend** - COMPLETED
2. **Backend with Serper API** - COMPLETED
3. **Integration & Testing** - COMPLETED

## Key Files
- shared/schema.ts - Data models (add new tables here)
- server/routes.ts - API routes (add CRUD endpoints)
- server/storage.ts - Storage interface (add DB operations)
- client/src/pages/home.tsx - Main page
- client/src/components/keyword-form.tsx - Form component
- client/src/components/ranking-results.tsx - Results table

## Environment
- SERPER_API_KEY is configured as a secret
- Workflow "Start application" is running
- Using Inter font, blue primary color theme

## Technical Notes
- apiRequest returns Response object, must call .json() to get data
- Use drizzle-orm for database operations
- Schema types should use createInsertSchema from drizzle-zod
