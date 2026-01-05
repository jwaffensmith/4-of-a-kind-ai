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
    - `ErrorMiddleware.ts`, `ValidationMiddleware.ts`, `AuthMiddleware.ts`
  - **Validators Layer** (`validators/`): Request validation schemas
    - `GameValidator.ts`, `AdminValidator.ts`
  - **Utils Layer** (`utils/`): Helper functions and utilities
    - `Logger.ts`, `Errors.ts`
- Implement "one away" detection algorithm
- Add error handling and validation middleware
- Use PascalCase naming convention for all backend files to match class names

### Phase 4: React Game UI with Tailwind CSS
- Set up **Tailwind CSS v4** with `@tailwindcss/vite` plugin
- Configure custom theme with difficulty colors (easy, medium, tricky, hard)
- Build GameContext with modern React 19 state management patterns
- Apply React 19 best practices for forms, async operations, and UI feedback
- Create styled components using Tailwind utility classes:
  - WordGrid component with 4x4 responsive layout
  - WordButton component with hover and selection states
  - FoundGroups component with difficulty-based color gradients
  - MistakesRemaining visual indicator with Tailwind animations
  - Controls (Shuffle, Deselect, Submit) with consistent styling
  - GameComplete modal with confetti and stats display
  - OneAwayHint toast notification with slide-in animation
- Implement full game flow from start to completion
- Apply responsive design patterns using Tailwind breakpoints

### Phase 5: Stats & Admin Dashboard
- **Implement local storage for anonymous user stats**:
  - Store game sessions, wins, streaks, and averages in browser localStorage
  - Provide option for users to add username and sync local stats to database
  - Read from localStorage for anonymous users, database for named users
  - Handle localStorage expiration and cleanup gracefully
- Build StatsPanel component showing user statistics (local or database)
- Create Leaderboard component with top players (database only, requires username)
- Design Admin Dashboard with tab navigation using Tailwind
- Implement AdminStats overview page with stat cards
- Build PuzzleGenerator form for creating puzzles
- Create PuzzleList table with filters and hover states
- Design PuzzleDetail page with full reasoning display
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
│   │   └── AuthMiddleware.ts
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
- 16 words divided into 4 categories
- 4 mistake limit with visual feedback
- "One away" hint system
- Word shuffling with smooth animations
- Animated transitions using Tailwind
- Win/loss conditions with confetti celebration
- Daily puzzle system (optional: one featured puzzle per day)

### 📊 Statistics
- User stats tracking (wins, streaks, averages)
- **Local storage for anonymous users**: Persist stats in browser localStorage for users without usernames
- Leaderboard system (requires username to appear)
- Puzzle quality metrics
- Anonymous play with optional usernames
- Sync local stats to database when user provides username

### 🔧 Admin Features
- Batch puzzle generation via Claude API
- Puzzle review system
- Quality filtering (including category diversity checks)
- Full puzzle details with AI reasoning
- Admin action audit log
- System overview dashboard

### 🎨 Styling with Tailwind CSS
- Modern utility-first CSS approach
- Custom color palette for difficulty levels:
  - Easy: `#F9DF6D` (Yellow)
  - Medium: `#9FD661` (Green)
  - Tricky: `#74A9F7` (Blue)
  - Hard: `#C589E8` (Purple)
- Custom spacing scale (xs, sm, md, lg, xl)
- Custom animations (shake, fadeIn, slideIn, etc.)
- Responsive design with mobile-first approach
- Dark mode support (future enhancement)

### 🚀 Technical Excellence
- TypeScript throughout for type safety
- Docker containerization for consistent environments
- PostgreSQL with proper indexing
- RESTful API design with clean layered architecture
- React Context API for state management
- Tailwind CSS for rapid, maintainable styling
- Production-ready deployment configuration
- Clean, self-documenting code with minimal comments

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

### 🤖 AI Prompt Engineering for Puzzle Generation
- **Ensure Category Diversity**: Design prompts to prevent all 4 categories from sharing the same theme
  - Explicitly instruct the AI to use diverse category types (e.g., not all animal-based, not all color-based)
  - Request varied semantic domains across the 4 categories within each puzzle
  - Ask for categories that span different conceptual areas (e.g., mix: pop culture, wordplay, science, geography)
- **Prompt Structure Guidance**:
  - Specify the need for thematic variety explicitly in the system prompt
  - Include examples of diverse category combinations
  - Add constraints that prevent repetitive patterns
  - Request that categories be distinct and not overlapping in theme
- **Validation**: Implement checks in the service layer to detect and reject puzzles with overly similar category themes

## Getting Started

1. **Set up environment variables**:
   ```bash
   cp .env.example .env
   # Add your CLAUDE_API_KEY and DB_PASSWORD
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

5. **Generate puzzles**:
   - Go to Admin Dashboard → Generate tab
   - Create puzzles with desired difficulty
   - Mark puzzles as reviewed in Puzzles tab
   - Start playing!

## Deployment Plan

Deploy to Fly.io:
```bash
# Backend
cd backend
fly launch --no-deploy
fly secrets set CLAUDE_API_KEY=... DATABASE_URL=...
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
- Authenticate and authorize users (`AuthMiddleware.ts`)
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
  categories     Json     // Array of 4 category objects
  ai_reasoning   String   @db.Text
  difficulty     String   // 'easy' | 'medium' | 'tricky' | 'hard'
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
  action     String   // 'generate' | 'review' | 'delete' | 'set_daily'
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
- **File Naming**: PascalCase for all TypeScript files

### Frontend
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **Routing**: React Router v6
- **State Management**: React Context API with modern React patterns
- **Local Storage**: Browser localStorage for anonymous user stats persistence
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
  - Middleware: `ErrorMiddleware.ts`, `ValidationMiddleware.ts`, `AuthMiddleware.ts`
  - Validators: `GameValidator.ts`, `AdminValidator.ts`
  - Utils: `Logger.ts`, `Errors.ts`
  - Entry points: `App.ts`, `Server.ts`
- ✅ React 19 is implemented with modern React patterns and best practices
- ✅ Tailwind CSS v4 is integrated with custom theme
- ✅ AI puzzle generation is working via Claude API with diverse category themes
- ✅ AI prompts ensure category variety (no repetitive themes across the 4 categories)
- ✅ Complete game flow is functional
- ✅ Admin dashboard allows puzzle management
- ✅ Statistics tracking is operational (localStorage for anonymous, database for named users)
- ✅ Anonymous users can persist stats locally without username
- ✅ Users can sync local stats to database by providing username
- ✅ Application is containerized and deployable
- ✅ All components are responsive on mobile
- ✅ Code follows TypeScript best practices with minimal comments
- ✅ Code is self-documenting with clear naming conventions
- ✅ Declarative programming patterns are used throughout
- ✅ Database migrations are managed through Prisma
