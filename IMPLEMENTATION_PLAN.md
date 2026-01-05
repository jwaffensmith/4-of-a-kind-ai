# Implementation Plan

## Overview

This document outlines the implementation plan for the AI Connections game. The application will be built using modern web technologies with a focus on clean architecture, type safety, and scalability.

**Important for Implementation:**
- Write clean, self-documenting code with descriptive names
- **Use comments sparingly** - only when necessary to explain complex logic or business rationale
- Let TypeScript types and clear naming serve as documentation
- Follow the Layered/N-Tier Architecture pattern strictly
- Use PascalCase for all backend TypeScript files
- **Use singular table names** in database (e.g., `puzzle`, `game_session`, not `puzzles`, `game_sessions`)
- **Use React 19** with modern React patterns and best practices
- **Prefer declarative programming** over imperative approaches wherever possible
- **Design AI prompts for category diversity** - ensure the 4 categories in each puzzle have varied themes (not all the same type)
- **Use localStorage for anonymous user stats** - persist stats without requiring username, with option to sync to database later
- **NO AUTHENTICATION for game/stats** - players can play anonymously without any login
- **Token-based admin authentication** - admin login with password returns session token, token required for admin routes
- **Follow accessibility best practices** - ensure the application is usable by everyone, including users with disabilities

### Phase 1: Infrastructure & Database
- Set up Docker Compose configuration for local development
- Configure PostgreSQL database with 5 tables (puzzle, game_session, game_stat, admin_log, daily_puzzle)
- Initialize backend TypeScript project with Express
- Initialize frontend TypeScript project with Vite + React
- Create complete folder structure for both backend and frontend
- Write migration files for database schema

### Phase 2: Database Setup with Prisma ORM
- Install and configure **Prisma ORM** for type-safe database access
- Initialize Prisma in the backend:
  ```bash
  npm install prisma @prisma/client
  npx prisma init
  ```
- Define Prisma schema (`prisma/schema.prisma`) with singular table names:
  - Puzzle model → `puzzle` table (id, words, categories, ai_reasoning, difficulty, is_reviewed, etc.)
  - GameSession model → `game_session` table (id, puzzle_id, username, completed, is_won, mistakes_remaining, etc.)
  - GameStat model → `game_stat` table (username, total_games, total_wins, current_streak, etc.)
  - DailyPuzzle model → `daily_puzzle` table (puzzle_date, puzzle_id)
  - AdminLog model → `admin_log` table (action, puzzle_id, details)
- Generate Prisma Client: `npx prisma generate`
- Create initial migration: `npx prisma migrate dev --name init`
- Benefits of using Prisma:
  - ✅ Auto-generated TypeScript types
  - ✅ Type-safe database queries
  - ✅ Built-in migration system
  - ✅ Excellent IDE autocomplete
  - ✅ No manual SQL query strings

### Phase 3: AI Integration & Backend Architecture
- Integrate Claude API via Anthropic SDK
- Build AI service for puzzle generation with validation
- **Implement daily puzzle generation limit**:
  - Track daily puzzle generation count (store in database or cache)
  - Reset counter at midnight UTC
  - Return error when 100 puzzles/day limit is reached
  - Log all generation attempts for monitoring
- **Design prompts for category diversity**: Ensure each puzzle has varied themes across the 4 categories (avoid repetitive themes)
- Implement **Layered/N-Tier Architecture** with PascalCase naming:
  - **Config Layer** (`config/`): Application configuration
    - `Database.ts`, `Env.ts`
  - **Controller Layer** (`controllers/`): HTTP request/response handling, routing, validation
    - `GameController.ts`, `StatsController.ts`, `AdminController.ts`
  - **Service Layer** (`services/`): Business logic, orchestration, data transformation
    - `GameService.ts`, `PuzzleService.ts`, `AIService.ts`, `StatsService.ts`
  - **Repository Layer** (`repositories/`): Data access using Prisma Client
    - `GameRepository.ts`, `PuzzleRepository.ts`, `StatsRepository.ts`, `DailyPuzzleRepository.ts`
  - **Routes Layer** (`routes/`): Express route definitions
    - `Index.ts`, `GameRoutes.ts`, `StatsRoutes.ts`, `AdminRoutes.ts`
  - **Middleware Layer** (`middleware/`): Express middleware functions
    - `ErrorMiddleware.ts`, `ValidationMiddleware.ts`, `AdminMiddleware.ts`
    - Note: AdminMiddleware provides token-based authentication for admin routes only
  - **Validators Layer** (`validators/`): Request validation schemas
    - `GameValidator.ts`, `AdminValidator.ts`
  - **Utils Layer** (`utils/`): Helper functions and utilities
    - `Logger.ts`, `Errors.ts`
- Implement "one away" detection algorithm
- Add error handling and validation middleware
- **Implement admin token-based authentication**:
  - Create `/api/admin/login` endpoint that validates password and returns token
  - Generate session tokens (JWT or crypto random) with expiration
  - Create AdminMiddleware to validate Bearer tokens on protected routes
  - Store active sessions (in-memory Map or Redis for production)
  - Implement token expiration (24 hours default)
  - Apply middleware to all admin routes only (game routes remain public)
- Use PascalCase naming convention for all backend files to match class names

### Phase 4: React Game UI with Tailwind CSS
- Set up **Tailwind CSS v4** with `@tailwindcss/vite` plugin
- Configure custom theme with difficulty colors (easy, medium, tricky, hard)
- Build GameContext with modern React 19 state management patterns
- Apply React 19 best practices for forms, async operations, and UI feedback
- **Implement accessibility features**: keyboard navigation, ARIA labels, focus management, screen reader support
- Create styled components using Tailwind utility classes:
  - WordGrid component with 4x4 responsive layout
  - WordButton component with hover and selection states
  - FoundGroups component with difficulty-based color gradients
  - MistakesRemaining visual indicator with Tailwind animations
  - Controls (Shuffle, Deselect, Submit) with consistent styling
  - GameComplete modal with confetti and stats display
  - **Display AI reasoning**: Show AI's explanation for each category connection after puzzle completion
  - OneAwayHint toast notification with slide-in animation
- Implement full game flow from start to completion
- Add daily puzzle display (show featured daily puzzle if available)
- Apply responsive design patterns using Tailwind breakpoints

### Phase 5: Stats & Admin Dashboard
- **Implement local storage for anonymous user stats**:
  - Store game sessions, wins, streaks, and averages in browser localStorage
  - Provide option for users to add username and sync local stats to database
  - Read from localStorage for anonymous users, database for named users
  - Handle localStorage expiration and cleanup gracefully
- Build StatsPanel component showing user statistics (local or database)
- Create Leaderboard component with top players (database only, requires username)
- **Implement admin login and token management**:
  - Create login form component with password input
  - POST password to `/api/admin/login` endpoint
  - Store returned token in sessionStorage (expires on tab close)
  - Include token in `Authorization: Bearer <token>` header for all admin API requests
  - Handle 401 responses by redirecting to login
  - Add "logout" button to clear token and redirect to login
  - Show token expiration warning (optional)
- Design Admin Dashboard with tab navigation using Tailwind
- Implement AdminStats overview page with stat cards
- Build PuzzleGenerator form for creating puzzles
- **Implement puzzle review/approval workflow**:
  - Create PuzzleList table showing all generated puzzles (approved and pending)
  - Add filters for approved/pending status
  - Display puzzle details (words, categories, AI reasoning, difficulty)
  - Add "Approve" and "Reject" buttons for each puzzle
  - Update `is_reviewed` flag when admin approves puzzle
  - Only show approved puzzles in game puzzle selection
- **Implement daily puzzle management**:
  - Admin can select a puzzle to set as the daily puzzle for a specific date
  - **Only approved puzzles** (`is_reviewed: true`) can be selected
  - Show error message if admin tries to set daily puzzle with no approved puzzles
  - Admin can regenerate/change the daily puzzle if needed
  - Display current daily puzzle in admin dashboard
  - Store daily puzzle assignments in `daily_puzzle` table
- **Display puzzle generation quota**:
  - Show remaining daily puzzle generation quota (X/100)
  - Disable generate button when limit is reached
  - Show reset time (midnight UTC)
- Develop Admin API service
- Ensure responsive design for mobile using Tailwind utilities

### Phase 6: Production Readiness
- Create production Dockerfiles for backend and frontend
- Configure Fly.io deployment files (fly.toml)
- Set up Nginx configuration for frontend
- Implement GitHub Actions CI/CD workflow
- Write comprehensive README with setup instructions
- Document environment variables
- Provide deployment documentation

## Project Structure

### Backend Architecture

```
backend/
├── prisma/
│   ├── schema.prisma      # Prisma schema definition
│   └── migrations/        # Database migrations
├── src/
│   ├── config/            # Configuration files
│   │   ├── Database.ts    # Prisma client initialization
│   │   └── Env.ts         # Environment variables
│   ├── controllers/       # HTTP request/response handling
│   │   ├── GameController.ts
│   │   ├── StatsController.ts
│   │   └── AdminController.ts
│   ├── services/          # Business logic layer
│   │   ├── GameService.ts
│   │   ├── PuzzleService.ts
│   │   ├── AIService.ts
│   │   └── StatsService.ts
│   ├── repositories/      # Data access using Prisma
│   │   ├── GameRepository.ts
│   │   ├── PuzzleRepository.ts
│   │   ├── StatsRepository.ts
│   │   └── DailyPuzzleRepository.ts
│   ├── routes/            # Route definitions
│   │   ├── Index.ts       # Main router
│   │   ├── GameRoutes.ts
│   │   ├── StatsRoutes.ts
│   │   └── AdminRoutes.ts
│   ├── middleware/        # Express middleware
│   │   ├── ErrorMiddleware.ts
│   │   ├── ValidationMiddleware.ts
│   │   └── AdminMiddleware.ts
│   ├── validators/        # Request validation schemas
│   │   ├── GameValidator.ts
│   │   └── AdminValidator.ts
│   ├── types/             # TypeScript type definitions
│   │   ├── express/
│   │   │   └── index.d.ts
│   │   └── dtos/
│   │       ├── GameDto.ts
│   │       ├── PuzzleDto.ts
│   │       └── StatsDto.ts
│   ├── utils/             # Utility functions
│   │   ├── Logger.ts
│   │   └── Errors.ts
│   ├── App.ts             # Express app configuration
│   └── Server.ts          # App entry point
└── package.json
```

### Frontend Architecture

```
frontend/src/
├── components/       # React components (styled with Tailwind)
│   ├── Game/
│   ├── Admin/
│   └── Stats/
├── contexts/        # React Context providers
├── hooks/           # Custom React hooks
├── services/        # API service clients
├── styles/          # Tailwind CSS configuration
│   └── main.css    # @import "tailwindcss" + custom theme
└── types/          # TypeScript type definitions
```

## Key Features to Implement

### 🎮 Gameplay
- AI-generated word puzzles with 4 difficulty levels
- Only **approved puzzles** (`is_reviewed: true`) are available for gameplay
- 16 words divided into 4 categories
- 4 mistake limit with visual feedback
- "One away" hint system
- Word shuffling with smooth animations
- Animated transitions using Tailwind
- Win/loss conditions with confetti celebration
- **Post-game reveal**: Display AI's reasoning for each category connection after puzzle completion
- Daily puzzle system (admin-curated puzzle featured each day from approved puzzles)

### 📊 Statistics
- User stats tracking (wins, streaks, averages)
- **Local storage for anonymous users**: Persist stats in browser localStorage for users without usernames
- Leaderboard system (requires self-entered username to appear)
- Puzzle quality metrics
- Anonymous play by default with optional self-entered usernames (no authentication)
- Sync local stats to database when user provides username

### 🔧 Admin Features
- Batch puzzle generation via Claude API (with 100 puzzles/day limit)
- **Puzzle review/approval workflow**:
  - Generate puzzles → Review → Approve/Reject
  - Admin reviews AI-generated puzzles before publishing
  - **View AI reasoning**: Display AI's explanation for each category during review
  - Only approved puzzles (`is_reviewed: true`) are available for gameplay
  - Only approved puzzles can be set as daily puzzle
- Quality filtering (including category diversity checks)
- Full puzzle details with AI reasoning (words, categories, AI reasoning)
- **Daily puzzle management**: 
  - Admin can set/regenerate the daily puzzle for any date
  - Can only select from approved puzzles
  - Error shown if no approved puzzles exist
- Admin action audit log
- System overview dashboard
- Display remaining puzzle generation quota
- **Token-based authentication**: Login with password returns session token with 24-hour expiration

### 🎨 Styling with Tailwind CSS
- Modern utility-first CSS approach
- Custom color palette for difficulty levels:
  - Easy: `#F9DF6D` (Yellow)
  - Medium: `#9FD661` (Green)
  - Tricky: `#74A9F7` (Blue)
  - Hard: `#C589E8` (Purple)
- Ensure all colors meet WCAG 2.2 AA contrast requirements for accessibility
- Custom spacing scale (xs, sm, md, lg, xl)
- Custom animations (shake, fadeIn, slideIn, etc.)
- Responsive design with mobile-first approach
- Focus-visible styles for keyboard navigation

### 🚀 Technical Excellence
- TypeScript throughout for type safety
- Docker containerization for consistent environments
- PostgreSQL with proper indexing
- RESTful API design with clean layered architecture
- React Context API for state management
- Tailwind CSS for rapid, maintainable styling
- Production-ready deployment configuration
- Clean, self-documenting code with minimal comments
- **Accessibility-first approach** - following WCAG 2.2 AA guidelines
- **No authentication for gameplay** - users play anonymously without login
- **Token-based admin authentication** - admin routes secured with session tokens (24-hour expiration)

### 📝 Code Quality Standards
- **Use Comments Sparingly**: Write self-explanatory code with clear variable/function names
  - ❌ Avoid: Unnecessary comments that explain what code does
  - ✅ Prefer: Descriptive names that make code self-documenting
  - ✅ Use comments only for: Complex algorithms, business logic rationale, "why" not "what"
- **Declarative over Imperative**: Prefer declarative programming patterns that describe what to do, not how to do it
  - Favor map/filter/reduce over for-loops
  - Use functional composition and expressions
  - Let frameworks and libraries handle the "how" (React, Prisma, etc.)
- Follow consistent PascalCase naming for all backend files
- Use TypeScript types to document expected data structures
- Write pure functions where possible for better testability

### ⚛️ Modern React Principles
- Apply modern React 19 patterns and best practices throughout
- Write declarative components that describe UI based on state
- Prefer composition over prop drilling
- Extract reusable logic into custom hooks
- Implement appropriate error and loading boundaries
- Use performance optimizations only when needed (avoid premature optimization)
- Follow React 19 conventions for forms, state management, and async operations

### ♿ Accessibility Best Practices
- **Follow WCAG 2.2 AA guidelines** for accessible web content
- **Semantic HTML**: Use proper HTML elements (button, nav, main, section, etc.)
- **Keyboard Navigation**: All interactive elements accessible via keyboard (Tab, Enter, Space, Arrow keys)
- **Screen Reader Support**: 
  - Proper ARIA labels and roles where needed
  - Meaningful alt text for images/icons
  - Announce dynamic content changes (game state, mistakes, found groups)
- **Color Contrast**: Ensure sufficient contrast ratios for text and interactive elements
- **Focus Indicators**: Visible focus states for keyboard navigation

### 🤖 AI Prompt Engineering for Puzzle Generation

#### **Game Mechanics to Explain to AI:**
- **Puzzle Structure**: 16 words total, divided into exactly 4 hidden groups of 4 words each
- **Category Connection**: Each group of 4 words shares a common theme or connection
- **Difficulty Levels**: Four difficulty levels that determine category complexity:
  - **Easy (Yellow)**: Obvious, straightforward connections (e.g., types of fish, words that end in "berry")
  - **Medium (Green)**: Requires some thinking but still recognizable (e.g., things that are "black", pizza toppings)
  - **Tricky (Blue)**: Wordplay, indirect connections, or nuanced relationships (e.g., words that follow "fire___", homophones)
  - **Hard (Purple)**: Subtle, abstract, or multiple-meaning connections (e.g., ___bank, words with silent letters)
- **Player Goal**: Identify all 4 groups by selecting 4 words at a time
- **Challenge**: Words should have potential to belong to multiple categories to create interesting dilemmas

#### **Critical: Ensure Diversity and Variety**

**The AI MUST generate varied puzzles across multiple dimensions:**

1. **Category Type Diversity** - Mix different connection types in each puzzle:
   - Semantic categories (e.g., types of birds, emotions, colors)
   - Functional categories (e.g., things that cut, kitchen appliances)
   - Contextual relationships (e.g., found in a garden, used in sports)
   - Word structure patterns (e.g., compound words, rhyming words)
   - Cultural references (e.g., movie titles, famous landmarks)
   - Abstract associations (e.g., words meaning "fast", things that are "round")
   - Wordplay and linguistics (e.g., homophones, prefixes, anagrams)

2. **Thematic Domain Diversity** - Each puzzle should span different domains:
   - ❌ **AVOID**: All 4 categories from same domain (all animals, all food, all sports)
   - ✅ **PREFER**: Mix domains (nature + technology + pop culture + wordplay)
   - Examples of good variety:
     - Category 1: Types of trees (nature)
     - Category 2: Computer commands (technology)  
     - Category 3: Marvel superheroes (pop culture)
     - Category 4: Words ending in "-tion" (wordplay)

3. **Conceptual Diversity** - Avoid repetitive conceptual patterns:
   - ❌ Don't make all categories "types of X" (types of fish, types of birds, types of trees)
   - ❌ Don't make all categories color-based (red things, blue things, green things)
   - ❌ Don't make all categories body-related (body parts, bones, muscles)
   - ✅ Mix conceptual approaches: direct categories + wordplay + cultural + functional

4. **Difficulty Progression Variety**:
   - Don't always make the hardest category wordplay
   - Vary what makes each difficulty level challenging
   - Sometimes abstract concepts are harder than wordplay
   - Sometimes very specific knowledge is the hardest

#### **Prompt Structure Guidance:**

**System Prompt Should Include:**
```
You are a puzzle generator creating word connection puzzles. Each puzzle has:
- 16 words divided into 4 hidden groups of 4 words each
- Each group shares a specific connection or theme
- 4 difficulty levels: Easy, Medium, Tricky, Hard

CRITICAL REQUIREMENTS:
1. MAXIMIZE DIVERSITY: The 4 categories in each puzzle MUST span different 
   thematic domains and connection types. Never create puzzles where all 
   categories are similar (e.g., all animals, all food-related, all colors).

2. VARY CONNECTION TYPES: Mix different connection types:
   - Semantic (types/categories)
   - Functional (purpose/use)
   - Contextual (where found/when used)
   - Structural (word patterns)
   - Cultural (references)
   - Linguistic (wordplay)

3. GOOD DIVERSITY EXAMPLE:
   - Easy: Types of fish (semantic)
   - Medium: Things you plug in (functional)
   - Tricky: Netflix shows (cultural)
   - Hard: Words that can follow "fire" (structural)

4. BAD EXAMPLE (avoid):
   - Easy: Types of birds (all nature)
   - Medium: Types of trees
   - Tricky: Types of flowers
   - Hard: Types of fish

5. Each puzzle should feel distinct from previous ones
6. Avoid predictable patterns across multiple puzzles
7. Words should have potential ambiguity (could fit multiple categories)
```

**Generation Request Should Specify:**
- Request the AI to provide clear, concise reasoning for each category connection
- Ask for explanations that are insightful and educational (not just restating the obvious)
- Reasoning should enhance player understanding and appreciation of the puzzle
- Request the AI to explicitly state how categories are diverse
- Ask for reasoning about why categories span different domains
- Request confirmation that no two categories share the same thematic domain
- Encourage creative, unexpected combinations

#### **Validation Requirements:**

Implement service-layer checks to reject puzzles with:
- All categories from the same domain (all animals, all food, etc.)
- More than 2 categories using the same connection type
- Repetitive patterns with recently generated puzzles
- Lack of clear diversity in the AI's reasoning

Store and reference recent puzzles to prevent:
- Generating similar puzzles in sequence
- Overusing certain category types
- Falling into predictable patterns

#### **Examples of High-Diversity Puzzles:**

**Example 1:**
- Easy: US State capitals (geography)
- Medium: Things that spin (functional)
- Tricky: Bond villain names (pop culture)
- Hard: Words containing "ear" (wordplay)

**Example 2:**
- Easy: Kitchen utensils (objects)
- Medium: Words meaning "angry" (semantic)
- Tricky: Can precede "board" (structural)
- Hard: Fibonacci sequence positions (mathematical)

**Example 3:**
- Easy: Types of cheese (food)
- Medium: Computer keyboard shortcuts (technology)
- Tricky: Words from song titles (cultural)
- Hard: Palindromes (linguistic)

### 🔐 Admin Security (Token-Based Authentication)
- **Authentication Approach**: Token-based authentication for admin routes only
  - Single admin password stored in environment variable (`ADMIN_PASSWORD`)
  - No user authentication system - game remains completely open
  - Login endpoint validates password and returns session token
  - AdminMiddleware validates token on all protected admin API routes
- **Authentication Flow**:
  1. Admin enters password in login form
  2. POST `/api/admin/login` with password
  3. Server validates password and returns session token (JWT or random token)
  4. Token stored in sessionStorage (expires on browser tab close)
  5. All subsequent admin requests include `Authorization: Bearer <token>` header
  6. Token expires after 24 hours (configurable)
- **Security Requirements**:
  - ✅ **HTTPS Only**: All traffic encrypted (provided by Fly.io)
  - ✅ **Strong Password**: 20+ random characters in environment variable
  - ✅ **Token Expiration**: Tokens expire after 24 hours
  - ✅ **Secure Token Storage**: Store token in sessionStorage (not localStorage) for auto-expiry
  - ✅ **Token Revocation**: Ability to invalidate tokens without changing password
  - ✅ **Admin Logging**: Log all admin actions with timestamps for audit trail
  - ✅ **Daily Puzzle Limit**: Maximum 100 puzzles can be generated per day globally (prevents API abuse)
- **API Cost Protection**:
  - Global daily limit of 100 puzzle generations to prevent Claude API cost attacks
  - Track daily puzzle generation count (reset at midnight UTC)
  - Return 429 error when daily limit is reached
  - Admin should also set spending caps in Anthropic dashboard
- **Frontend Implementation**:
  - Admin dashboard shows login form on first access
  - On successful login, store token in sessionStorage
  - All admin API calls include `Authorization: Bearer <token>` header
  - Logout button clears token from sessionStorage
  - Auto-redirect to login on 401 Unauthorized responses
  - Display remaining daily puzzle generation quota

## Getting Started

1. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Add your CLAUDE_API_KEY, DB_PASSWORD, and ADMIN_PASSWORD
   # ADMIN_PASSWORD should be 20+ random characters

   ```

2. **Start the application**:
   ```bash
   docker-compose up
   ```

3. **Run migrations**:
   ```bash
   docker exec -it connections_backend sh
   npx prisma migrate deploy
   # Or for development:
   # npx prisma migrate dev
   ```

4. **Access the app**:
   - Game: http://localhost:3000
   - Admin: http://localhost:3000/admin
   - API: http://localhost:3001

5. **Generate and approve puzzles**:
   - Go to Admin Dashboard → Generate tab
   - Create puzzles with desired difficulty
   - Go to Puzzles tab to review generated puzzles
   - Review AI reasoning and puzzle quality
   - Click "Approve" on puzzles you want to publish
   - Only approved puzzles will be available for gameplay
   - Optionally set a daily puzzle from approved puzzles
   - Start playing!

## Deployment Plan

Deploy to Fly.io:
```bash
# Backend
cd backend
fly launch --no-deploy
fly secrets set CLAUDE_API_KEY=... DATABASE_URL=... ADMIN_PASSWORD=...
fly deploy

# Frontend
cd frontend
fly launch --no-deploy
fly deploy --build-arg VITE_API_URL=https://your-backend.fly.dev
```

## Architecture Overview

### Architecture Pattern: Layered/N-Tier Architecture

The backend follows a **Layered Architecture** (also known as **N-Tier Architecture**), which organizes code into distinct horizontal layers with clear responsibilities and dependencies flowing in one direction:

**Request Flow:** `Client → Routes → Controllers → Services → Repositories → Database`

**Key Principles:**
- **Separation of Concerns**: Each layer has a single, well-defined responsibility
- **Dependency Rule**: Layers only depend on layers below them (Controllers → Services → Repositories)
- **Abstraction**: Each layer provides an abstraction over the layer below it
- **Testability**: Layers can be tested independently with mocked dependencies
- **Maintainability**: Changes in one layer don't ripple through the entire codebase

This architectural approach ensures the codebase remains clean, scalable, and maintainable as the application grows.

### System Architecture Diagram

```
┌─────────────────────────────────────┐
│         React UI (Tailwind)         │
│           (Port 3000)                │
│  ┌─────────────────────────────┐   │
│  │  Components w/ Tailwind     │   │
│  │  ┌──────────┐  ┌─────────┐ │   │
│  │  │   Game   │  │  Admin  │ │   │
│  │  └──────────┘  └─────────┘ │   │
│  └─────────────────────────────┘   │
└──────────────┬──────────────────────┘
               │
               │ HTTP/REST API
               ▼
┌─────────────────────────────────────┐      ┌──────────────┐
│      Express Backend (Layered)      │─────▶│  Claude API  │
│          (Port 3001)                 │      │  (Puzzles)   │
│  ┌──────────────────────────────┐  │      └──────────────┘
│  │Controllers (GameController)  │  │
│  └───────────┬──────────────────┘  │
│  ┌───────────▼──────────────────┐  │
│  │ Services (GameService, etc)  │  │
│  └───────────┬──────────────────┘  │
│  ┌───────────▼──────────────────┐  │
│  │Repositories (via Prisma)     │  │
│  └───────────┬──────────────────┘  │
└──────────────┼──────────────────────┘
               │
               │ SQL Queries
               ▼
┌─────────────────────────────────────┐
│          PostgreSQL                  │
│          (Port 5432)                 │
│  ┌──────────────────────────────┐  │
│  │  Tables: puzzle,              │  │
│  │  game_session, game_stat,     │  │
│  │  admin_log, daily_puzzle      │  │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## Backend Layer Responsibilities

### Config Layer (`config/`)
- Initialize Prisma client instance (`Database.ts`)
- Load and validate environment variables (`Env.ts`)
- Centralize configuration settings
- Provide singleton database connection
- Export configuration objects for use across the app

### Controller Layer (`controllers/`)
- Receive and parse HTTP requests
- Validate request data with middleware
- Call appropriate service methods
- Format and return HTTP responses
- Handle HTTP status codes and errors
- Route requests to appropriate handlers

### Service Layer (`services/`)
- Implement business logic
- Orchestrate operations across multiple data sources
- Transform data between formats
- Validate business rules
- Handle complex workflows
- Coordinate between different services

### Repository Layer (`repositories/`)
- Use Prisma Client for type-safe database operations
- Wrap Prisma calls with repository pattern
- Provide clean interface for data access
- Handle database transactions
- Map Prisma models to domain types if needed
- Abstract data persistence details from services

### Routes Layer (`routes/`)
- Define Express route handlers
- Map HTTP methods to controller functions
- Group related endpoints together
- Apply route-specific middleware
- Export configured routers

### Middleware Layer (`middleware/`)
- Implement error handling (`ErrorMiddleware.ts`)
- Validate incoming requests (`ValidationMiddleware.ts`)
- Protect admin routes with token authentication (`AdminMiddleware.ts`)
  - Validate `Authorization: Bearer <token>` header
  - Check token exists and is not expired
  - Return 401 Unauthorized for invalid/missing/expired tokens
- Process requests before reaching controllers
- Transform responses before sending to client

### Validators Layer (`validators/`)
- Define validation schemas using Zod or similar
- Validate request bodies, params, and queries
- Provide reusable validation rules
- Export validation middleware functions
- Ensure type safety for incoming data

### Utils Layer (`utils/`)
- Implement logging functionality (`Logger.ts`)
- Define custom error classes (`Errors.ts`)
- Provide helper functions used across the app
- Abstract common patterns and utilities
- Support DRY principles

**Example Repository with Prisma:**
```typescript
// src/repositories/PuzzleRepository.ts
import { PrismaClient } from '@prisma/client';
import type { Puzzle } from '@prisma/client';
import type { PuzzleCreateDto } from '../types/dtos/PuzzleDto';

export class PuzzleRepository {
  constructor(private prisma: PrismaClient) {}

  async create(data: PuzzleCreateDto): Promise<Puzzle> {
    return await this.prisma.puzzle.create({
      data: {
        words: data.words,
        categories: data.categories,
        ai_reasoning: data.ai_reasoning,
        difficulty: data.difficulty,
      },
    });
  }

  async findById(id: string): Promise<Puzzle | null> {
    return await this.prisma.puzzle.findUnique({
      where: { id },
    });
  }

  async findRandomReviewed(): Promise<Puzzle | null> {
    const count = await this.prisma.puzzle.count({
      where: { is_reviewed: true },
    });
    
    if (count === 0) return null;
    
    const skip = Math.floor(Math.random() * count);
    return await this.prisma.puzzle.findFirst({
      where: { is_reviewed: true },
      skip,
    });
  }
}
```

**Example Admin Authentication:**
```typescript
// src/middleware/AdminMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const activeSessions = new Map<string, { created: number }>();

// Login endpoint
export const adminLogin = (req: Request, res: Response) => {
  const { password } = req.body;

  // Validate password
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  // Generate session token
  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  activeSessions.set(token, { created: now });

  res.json({ 
    token, 
    expiresIn: 86400 // 24 hours in seconds
  });
};

// Auth middleware for protected routes
export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const session = activeSessions.get(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid token' });
  }

  // Check if expired (24 hours)
  const now = Date.now();
  if (now - session.created > 86400000) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Token expired' });
  }

  next();
};

// Optional: Logout endpoint
export const adminLogout = (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');
  
  if (token) {
    activeSessions.delete(token);
  }
  
  res.json({ message: 'Logged out successfully' });
};
```

## Prisma Schema Example

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Puzzle {
  id             String   @id @default(uuid())
  words          Json     // Array of 16 words
  categories     Json     // Array of 4 category objects with {name, words, difficulty}
  ai_reasoning   String   @db.Text  // AI's explanation for each category connection
  difficulty     String   // Overall puzzle difficulty: 'easy' | 'medium' | 'tricky' | 'hard'
  is_reviewed    Boolean  @default(false)
  times_played   Int      @default(0)
  avg_completion_time Int?
  avg_mistakes   Float?
  created_at     DateTime @default(now())
  
  game_sessions  GameSession[]
  daily_puzzles  DailyPuzzle[]
  admin_logs     AdminLog[]
  
  @@index([difficulty])
  @@index([is_reviewed])
  @@map("puzzle")
}

model GameSession {
  id                String   @id @default(uuid())
  puzzle_id         String
  username          String?
  completed         Boolean  @default(false)
  is_won            Boolean  @default(false)
  attempts          Int      @default(0)
  correct_groups    Json     @default("[]")
  mistakes_remaining Int     @default(4)
  started_at        DateTime @default(now())
  completed_at      DateTime?
  time_taken        Int?     // in seconds
  
  puzzle            Puzzle   @relation(fields: [puzzle_id], references: [id])
  
  @@index([puzzle_id])
  @@index([username])
  @@index([completed])
  @@map("game_session")
}

model GameStat {
  id               String   @id @default(uuid())
  username         String   @unique
  total_games      Int      @default(0)
  total_wins       Int      @default(0)
  perfect_games    Int      @default(0)
  current_streak   Int      @default(0)
  best_streak      Int      @default(0)
  avg_time_seconds Float?
  avg_mistakes     Float?
  created_at       DateTime @default(now())
  updated_at       DateTime @updatedAt
  
  @@index([total_wins])
  @@map("game_stat")
}

model DailyPuzzle {
  puzzle_date String   @id
  puzzle_id   String
  created_at  DateTime @default(now())
  
  puzzle      Puzzle   @relation(fields: [puzzle_id], references: [id])
  
  @@index([puzzle_id])
  @@map("daily_puzzle")
}

model AdminLog {
  id         String   @id @default(uuid())
  action     String   // 'generate' | 'approve' | 'reject' | 'delete' | 'set_daily'
  puzzle_id  String?
  details    Json
  created_at DateTime @default(now())
  
  puzzle     Puzzle?  @relation(fields: [puzzle_id], references: [id])
  
  @@index([created_at])
  @@map("admin_log")
}
```

## Tech Stack Summary

### Backend
- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **ORM**: Prisma (type-safe database access)
- **Database**: PostgreSQL
- **AI Integration**: Anthropic Claude API
- **Validation**: Zod or similar
- **Architecture**: Layered/N-Tier Architecture (Controllers → Services → Repositories)
- **Admin Security**: Token-based authentication (session tokens with expiration)
- **File Naming**: PascalCase for all TypeScript files

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v6
- **State Management**: React Context API with modern React patterns
- **Local Storage**: Browser localStorage for anonymous user stats persistence
- **Accessibility**: WCAG 2.2 AA compliant, keyboard navigation, screen reader support
- **Animations**: Framer Motion
- **HTTP Client**: Fetch API

### DevOps
- **Containerization**: Docker & Docker Compose
- **Deployment**: Fly.io
- **Web Server**: Nginx (for frontend static files)
- **Environment**: .env files for config

## Success Criteria

The implementation will be considered complete when:
- ✅ Prisma ORM is integrated with auto-generated types
- ✅ All backend layers follow PascalCase naming convention:
  - Config: `Database.ts`, `Env.ts`
  - Controllers: `GameController.ts`, `StatsController.ts`, `AdminController.ts`
  - Services: `GameService.ts`, `PuzzleService.ts`, `AIService.ts`, `StatsService.ts`
  - Repositories: `GameRepository.ts`, `PuzzleRepository.ts`, `StatsRepository.ts`, `DailyPuzzleRepository.ts`
  - Routes: `Index.ts`, `GameRoutes.ts`, `StatsRoutes.ts`, `AdminRoutes.ts`
  - Middleware: `ErrorMiddleware.ts`, `ValidationMiddleware.ts`, `AdminMiddleware.ts`
  - Validators: `GameValidator.ts`, `AdminValidator.ts`
  - Utils: `Logger.ts`, `Errors.ts`
  - Entry points: `App.ts`, `Server.ts`
- ✅ React 19 is implemented with modern React patterns and best practices
- ✅ Tailwind CSS v4 is integrated with custom theme
- ✅ AI puzzle generation is working via Claude API with diverse category themes
- ✅ AI prompts ensure category variety (no repetitive themes across the 4 categories)
- ✅ Puzzle review/approval workflow implemented (generate → review → approve)
- ✅ Only approved puzzles available for gameplay and daily puzzle selection
- ✅ Error handling when trying to set daily puzzle with no approved puzzles
- ✅ Complete game flow is functional
- ✅ Post-game screen displays AI reasoning for each category connection
- ✅ Admin dashboard allows puzzle management
- ✅ Admin can view AI reasoning during puzzle review
- ✅ Daily puzzle system implemented (admin can set/regenerate daily puzzle from approved puzzles)
- ✅ Statistics tracking is operational (localStorage for anonymous, database for named users)
- ✅ Anonymous users can persist stats locally without username
- ✅ Users can sync local stats to database by providing username
- ✅ Application is containerized and deployable
- ✅ All components are responsive on mobile
- ✅ Game/stats are publicly accessible without authentication
- ✅ Admin dashboard protected with token-based authentication
- ✅ Admin login endpoint validates password and returns session token
- ✅ Admin routes validate Bearer tokens with expiration (24 hours)
- ✅ Daily puzzle generation limit enforced (100 puzzles/day max)
- ✅ Accessibility best practices implemented (keyboard navigation, ARIA labels, screen reader support)
- ✅ Application is usable with keyboard-only navigation
- ✅ Code follows TypeScript best practices with minimal comments
- ✅ Code is self-documenting with clear naming conventions
- ✅ Declarative programming patterns are used throughout
- ✅ Database migrations are managed through Prisma
