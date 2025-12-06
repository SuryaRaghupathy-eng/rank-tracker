# SEO Keyword Ranking Tracker

## Overview

An SEO keyword ranking tracker that allows users to check where their website ranks on Google for specific keywords. The application supports batch keyword tracking, historical comparisons across different time ranges, and provides visual analytics of ranking performance. Built with a modern React frontend powered by shadcn/ui components and an Express backend that integrates with the Serper API for Google search data.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Technology Stack**: React 18 with TypeScript, using Vite as the build tool and development server.

**UI Framework**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling. The design follows a "New York" style inspired by Linear and Stripe dashboards, emphasizing clean, data-focused interfaces with minimal visual noise.

**State Management**: TanStack Query (React Query) for server state management with custom query client configuration. No global state management library is used - component state and React Query handle all state needs.

**Routing**: Wouter for lightweight client-side routing (currently implements only home route and 404 page).

**Form Handling**: React Hook Form with Zod resolver for validation, leveraging the shared schema definitions.

**Design System**:
- Typography: Inter font family from Google Fonts
- Spacing: Consistent Tailwind units (2, 4, 6, 8, 12, 16)
- Color scheme: CSS custom properties with automatic dark mode support
- Component patterns: Card-based layouts, data tables, stat cards, form sections

**Key Architectural Decisions**:
- Single-page application with minimal routing to keep focus on core ranking functionality
- Form-first design where users input keywords and website URL, then see results
- Modular component structure with separation between presentational (UI) and functional (forms, data display) components
- TypeScript path aliases (@/, @shared/, @assets/) for clean imports

### Backend Architecture

**Technology Stack**: Node.js with Express, TypeScript, ESM modules.

**API Design**: RESTful API with primary endpoint `/api/rankings/check` for batch keyword checking. The backend acts as a proxy layer between the frontend and Serper API.

**Data Flow**:
1. Frontend sends batch keyword request with website URL and time range options
2. Backend validates input using shared Zod schemas
3. For each keyword, backend makes parallel requests to Serper API
4. Results are normalized (URL comparison, position extraction) and returned to frontend
5. No persistent storage - all data is ephemeral for MVP

**Key Architectural Decisions**:
- Stateless backend design for simplicity and scalability
- In-memory storage pattern (MemStorage class) allowing future database integration
- Shared schema definitions between client and server prevent type drift
- Build process bundles specific dependencies (allowlist) to reduce cold start times
- Request logging middleware for debugging and monitoring

**Build System**: Custom esbuild configuration that:
- Bundles server code with selected dependencies
- Builds client separately using Vite
- Outputs to single dist directory for production deployment

### Data Storage Solutions

**Current Implementation**: In-memory storage using Map-based MemStorage class for user data (authentication scaffold).

**Schema Definition**: Drizzle ORM with PostgreSQL dialect configured, though database is not currently provisioned. Schema includes:
- Users table with UUID primary keys, username, password
- TypeScript types generated from schema for type safety

**Future Database Integration**: Architecture supports adding PostgreSQL via Drizzle ORM:
- Schema already defined in shared/schema.ts
- Connection configuration in drizzle.config.ts
- Migration system ready via drizzle-kit
- Storage interface (IStorage) abstracts database operations

**Key Architectural Decisions**:
- Schema-first approach using Drizzle with Zod validation
- Separation of insert vs select types for data operations
- Interface-based storage pattern allows swapping implementations
- Currently stateless to minimize complexity, with clear path to persistence

### External Dependencies

**Serper API**: Primary external service for Google search data.
- Purpose: Fetch organic search results for keyword ranking analysis
- Authentication: API key via SERPER_API_KEY environment variable
- Features used: Standard search with optional time range filtering (week, month)
- Data transformation: Raw search results parsed to extract position, title, snippet, URL

**shadcn/ui Component Library**: Extensive use of pre-built accessible components:
- Radix UI primitives for complex interactions (dialogs, dropdowns, tooltips, etc.)
- Tailwind CSS for styling with CSS custom properties for theming
- Lucide React for consistent iconography

**Development Tools**:
- Vite with HMR for development experience
- Replit-specific plugins: cartographer, dev-banner, runtime error overlay
- TypeScript for type safety across full stack

**Key Integration Decisions**:
- Serper API chosen for cost-effective Google search access without direct Google API
- Time range filtering implemented via Serper's `tbs` parameter
- URL normalization (lowercase, protocol stripping) for reliable matching
- Error handling with user-friendly toast notifications
- No caching layer currently - each request hits Serper API fresh