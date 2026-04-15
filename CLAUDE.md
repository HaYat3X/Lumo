# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Luno** (internally "Aether") is an AI secretary application built with Next.js that helps users manage their personal information through:
- Schedule management (Google Calendar integration)
- Task management (Notion database integration)
- Note-taking and scraps (Notion integration)
- Daily planning with AI assistance
- Trend visualization
- AI chat interface with custom instructions

The app uses the Anthropic API for AI features and integrates with Google Calendar and Notion for data persistence.

## Technology Stack

- **Framework**: Next.js 16.2.1 (App Router) with React 19.2.4
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Auth**: NextAuth v5 (Google OAuth)
- **AI**: Anthropic SDK (`@anthropic-ai/sdk`)
- **External APIs**: 
  - Notion API (`@notionhq/client`)
  - Google Calendar API via googleapis
- **UI Components**: Lucide React icons
- **Markdown**: react-markdown with remark-gfm

## Getting Started

### Development

```bash
# Install dependencies
npm install

# Run development server (port 3000)
npm run dev

# Build for production
npm build

# Start production server
npm start

# Lint code
npm run lint
```

### Environment Configuration

Copy `env.example.txt` and create `.env.local` with:
- `BETTER_AUTH_SECRET` - NextAuth secret
- `ALLOWED_EMAILS` - Comma-separated list of allowed OAuth email addresses
- `NOTION_API_KEY` - Notion API key
- `GOOGLE_SERVICE_ACCOUNT_KEY` - Google service account JSON (as stringified JSON)
- `ANTHROPIC_API_KEY` - Anthropic API key

## Architecture

### Directory Structure

```
app/
  ├── (dashboard)/          # Main dashboard layout group
  │   ├── chat/            # Chat interface page
  │   ├── daily/           # Daily plan page
  │   ├── scraps/          # Scraps/notes page
  │   ├── settings/        # User settings page
  │   ├── tasks/           # Task list page
  │   ├── trends/          # Trend visualization page
  │   └── layout.tsx       # Dashboard wrapper layout
  ├── api/                 # Next.js API routes
  │   ├── auth/[...nextauth]/
  │   ├── chat/
  │   ├── daily-plan/
  │   ├── notifications/
  │   ├── scraps/
  │   ├── settings/
  │   ├── tasks/
  │   └── trends/
  ├── components/          # React components (server & client)
  ├── login/              # Login page
  ├── lp/                 # Landing page
  ├── types/              # App-level type definitions
  ├── utils/              # App-level utilities
  ├── layout.tsx          # Root layout
  ├── page.tsx            # Root page (redirects)
  └── globals.css         # Global styles with theme variables

services/
  ├── NotionClient.ts     # Notion API client initialization
  └── GoogleCalendarClient.ts  # Google Calendar API client with service account auth

types/
  └── md.d.ts             # Type definitions for markdown handling

utils/
  ├── getTodayJST.ts      # Get today's date in JST
  ├── addDays.ts          # Date manipulation utility
  ├── getAvailableDbs.ts  # Notion database utilities
  └── toISODateTime.ts    # DateTime conversion utility

skills/                    # AI skill definitions used by Luno assistant
```

### Key Architectural Patterns

1. **Authentication**: NextAuth with Google OAuth and email whitelist validation
2. **API Integration**: 
   - Notion Client uses API key authentication
   - Google Calendar uses service account credentials (JSON parsed from env var)
   - Anthropic SDK for AI features
3. **Styling**: Tailwind CSS 4 with CSS custom properties for theming
4. **Fonts**: Outfit (heading), JetBrains Mono (code), Noto Sans JP (body)

### Important Notes from AGENTS.md

⚠️ **This version of Next.js has breaking changes** — APIs, conventions, and file structure may differ from standard documentation. Before writing code:
- Check `node_modules/next/dist/docs/` for version-specific guides
- Pay attention to deprecation notices in Next.js error messages
- Verify that patterns match Next.js 16.2.1 documentation

### Data Flow

1. **User Authentication**: Google OAuth → NextAuth → Email whitelist check
2. **AI Features**: User input → API route → Anthropic SDK → Response
3. **Task Management**: UI → API route → Notion client → Notion database
4. **Calendar Integration**: API route → Google Calendar service account → User's calendar
5. **Daily Planning**: Fetch calendar + tasks → AI processing → Store in Notion

### LunoSystemPrompt

The `LunoSystemPrompt.md` file defines:
- Luno's personality and response style (Japanese)
- When to use AI knowledge vs. tools
- Skill definitions for task creation, calendar management, and daily plan generation

## Common Development Tasks

### Running Tests
There are no automated tests configured. Manual testing should be done via the development server.

### Linting
```bash
npm run lint
```

### Adding New API Routes
1. Create file in `app/api/[feature]/route.ts`
2. Export `GET`, `POST`, etc. handlers
3. Use middleware pattern from existing routes for auth if needed

### Adding New Dashboard Pages
1. Create folder in `app/(dashboard)/[feature]/`
2. Add `page.tsx` for the page component
3. Use dashboard layout automatically (via layout group)

### Database Integration
- Use `services/NotionClient.ts` to access Notion API
- Reference database IDs from environment or user settings
- Common database types: Tasks, Daily Plans, Scraps, Knowledge

## Key Dependencies to Know

- **Next.js 16**: Read breaking changes in node_modules docs
- **React 19**: Latest features like use() hook available
- **Anthropic SDK**: Uses modern async/await patterns
- **Notion Client**: Async API, returns typed responses
- **NextAuth v5 beta**: Different from stable v4 patterns

## Import Path Alias

The project uses `@/*` alias mapping to root directory for absolute imports:
```typescript
import { getNotionClient } from "@/services/NotionClient";
import { getTodayJST } from "@/utils/getTodayJST";
```

## Known Considerations

1. **Timezone**: Utilities handle JST timezone explicitly (`getTodayJST.ts`)
2. **Google Service Account**: Credentials stored as stringified JSON in env var for Vercel compatibility
3. **Email Whitelist**: Authentication requires user email to be in `ALLOWED_EMAILS` environment variable
4. **Notion API Limits**: Consider rate limiting when implementing bulk operations
5. **Anthropic API**: Check for usage limits and token consumption in production
