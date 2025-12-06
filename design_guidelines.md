# SEO Keyword Ranking Tracker - Design Guidelines

## Design Approach

**System:** Inspired by Linear and Stripe Dashboard for clean, data-focused interfaces
**Philosophy:** Clarity, efficiency, and scannable data presentation. Every element serves a functional purpose.

## Typography System

**Primary Font:** Inter (Google Fonts)
**Hierarchy:**
- Page Headers: text-3xl font-semibold
- Section Titles: text-xl font-medium
- Table Headers: text-sm font-semibold uppercase tracking-wide
- Body Text: text-base
- Data Metrics: text-2xl font-bold (for position numbers)
- Labels/Meta: text-sm
- Small Text: text-xs

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, 8, 12, and 16 for consistent rhythm
**Container:** max-w-7xl mx-auto px-6
**Vertical Spacing:** py-8 for main sections, py-6 for subsections

**Page Structure:**
- Header: Fixed top navigation (h-16) with logo, main nav, user menu
- Main Content: pt-24 to account for fixed header
- Content Grid: Single column layout with max-w-5xl for forms, full-width for tables

## Core Components

### Input Form Section
- Card-based container with rounded-lg border
- Two-column grid on desktop (grid-cols-2 gap-6), single column on mobile
- Input fields: h-11 with consistent padding (px-4)
- Labels: mb-2 block
- Primary CTA button: h-11 px-8 rounded-md font-medium
- Secondary actions: h-11 px-6 rounded-md font-medium (outlined variant)

### Comparison Toggle
- Switch component (w-11 h-6 rounded-full) with smooth transition
- Label positioned to the left with text-sm font-medium
- Date range selector appears below when enabled (slide-down transition)

### Results Dashboard

**Stats Cards Row:**
- Grid of 3-4 cards (grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6)
- Each card: p-6 rounded-lg border
- Metric label: text-sm above
- Large number: text-3xl font-bold
- Trend indicator: text-sm with arrow icon (↑/↓)

**Rankings Table:**
- Full-width responsive table with striped rows
- Header: sticky top-16 with backdrop-blur
- Columns: Keyword (w-1/4) | Website URL (w-1/4) | Current Position (w-1/6) | Previous Position (w-1/6) | Change (w-1/6)
- Cell padding: px-6 py-4
- Position badges: inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
- Change indicators: 
  - Positive changes: "↑ +2" with success styling
  - Negative changes: "↓ -3" with error styling
  - No change: "—" neutral styling

### Empty States
- Centered content (py-16)
- Icon (h-16 w-16) above message
- Heading: text-lg font-medium
- Description: text-sm max-w-sm mx-auto
- CTA button below

### Loading States
- Skeleton loaders for table rows (h-12 rounded animate-pulse)
- Spinner for button states (h-5 w-5 animate-spin)

## Navigation

**Top Bar:**
- Logo/Brand (left): text-xl font-bold
- Main nav (center): flex gap-8 with text-sm font-medium links
- Actions (right): "Add Keyword" button + user avatar dropdown

## Icons
**Library:** Heroicons via CDN
**Usage:**
- Search icon for keyword input
- Calendar icon for date selectors
- TrendingUp/TrendingDown for ranking changes
- Plus icon for "Add Keyword" action
- ChevronDown for dropdowns
- ExternalLink for website URLs

## Data Visualization Patterns

**Position Numbers:**
- Display in circular badges (h-10 w-10 rounded-full flex items-center justify-center)
- Top 3 positions: distinct styling
- Positions 4-10: standard styling
- Beyond 10: muted styling

**Change Indicators:**
- Always prefix with arrow (↑↓)
- Include +/- and number
- Group visually with pill shape

## Responsive Behavior

**Desktop (lg:):** Full table view with all columns
**Tablet (md:):** Compress URL column, stack stats in 2 columns
**Mobile (base:):** 
- Stack all stats vertically
- Convert table to card-based list
- Each ranking as individual card with all info stacked

## Form Interactions

**Date Range Selector:**
- Segmented control pattern (3 options: Current, Past Week, Past Month)
- Active state clearly distinguished
- Full width on mobile, auto-width on desktop

**Batch Keyword Entry:**
- Textarea with h-32 minimum height
- Placeholder: "Enter keywords (one per line)"
- Character/line count below: text-xs

## Information Density

**Comfortable Spacing:** Prioritize scanability over density
**Visual Hierarchy:** Clear distinction between primary metrics and supporting data
**Progressive Disclosure:** Show summary first, expand for details on demand

This design creates a professional, efficient SEO tool that makes ranking data immediately actionable while maintaining visual clarity and ease of use.