# Quick Start Guide - Move vs Improve Platform

## Phase 1 Complete ✅ - Database & Core Engine Ready

This document gets you from zero to development in 10 minutes.

---

## 1️⃣ Clone & Install (2 mins)

```bash
cd ~/move-or-improve-assessment

npm install
```

**Installs:**
- React 18, Next.js 14
- Prisma 5 with PostgreSQL adapter
- NextAuth with credentials provider
- PDF, validation, date utilities
- TypeScript, ESLint, Prettier

---

## 2️⃣ Configure Environment (2 mins)

```bash
# Copy example env file
cp .env.local.example .env.local

# Edit with your PostgreSQL URL
nano .env.local
```

**Required Variables:**
```env
DATABASE_URL="postgresql://user:password@host:5432/move_improve_db"
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
```

---

## 3️⃣ Set Up Database (3 mins)

```bash
# Create schema in PostgreSQL
npm run db:push

# Generate Prisma client
npx prisma generate

# Seed initial data
npm run db:seed
```

**What this does:**
- Creates all tables from schema.prisma
- Generates TypeScript types for database models
- Creates first admin user + version
- Populates sample categories & questions

---

## 4️⃣ Create Admin User (2 mins)

The seed script creates:
- **Email:** admin@moveimprove.local
- **Password:** (check seed output or set your own)

To create additional admins:

```bash
# Run Prisma Studio (interactive DB browser)
npx prisma studio

# Or create via API endpoint (coming in Phase 2)
```

---

## 5️⃣ Start Development Server (1 min)

```bash
npm run dev
```

Opens: **http://localhost:3000**

**What you can do right now:**
- ❌ Quiz isn't accessible yet (Phase 2)
- ❌ Admin panel isn't accessible yet (Phase 2)
- ✅ Database is ready
- ✅ Core engine is ready
- ✅ Auth is configured

---

## 📂 What's Ready Now

### ✅ Decision Engine (`src/lib/decision-engine.ts`)

```typescript
import { DecisionEngine } from '@/lib/decision-engine';
import { loadActiveConfig } from '@/lib/config-loader';

// Load config
const config = await loadActiveConfig();

// Create engine
const engine = new DecisionEngine(config);

// Score responses
const results = engine.calculateScores({
  Q1: '8',      // 1-10 scale
  Q2: '6',
  Q3: 'NA',     // Missing response
  Q4: '7',
});

console.log(results);
// {
//   improveScore: 0.40,
//   moveScore: -0.40,
//   decisionIndex: 0.80,
//   decision: 'Improve',
//   lean: 'Moderate',
//   categoryScores: { ... }
// }
```

### ✅ Database Models

All Prisma models available:
- `QuestionnaireVersion` - Versioning
- `Category` - Question groups
- `Question` - Assessment items
- `QuestionScoring` - Weights & multipliers
- `ConditionalRule` - IF/THEN logic
- `ResponseSession` - User sessions
- `ResponseAnswer` - Individual answers
- `ScoreResult` - Calculated results
- `Admin` - Admin users
- `ScoringConfig` - Thresholds & settings

### ✅ Type Safety

```typescript
import {
  Question,
  DecisionEngineOutput,
  Decision,
  LeanStrength,
} from '@/types';

// Everything is typed
const result: DecisionEngineOutput = engine.calculateScores(...);
```

### ✅ Authentication

```typescript
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const session = await getServerSession(authOptions);
if (!session) {
  // Not authenticated
}
```

---

## 🔧 Useful Commands

```bash
# Development
npm run dev           # Start dev server

# Database
npm run db:push       # Push schema changes
npm run db:migrate    # Create migration
npx prisma studio    # Visual database explorer

# Validation
npm run type-check   # TypeScript validation
npm run lint         # ESLint check
npm run format       # Prettier reformat

# Build
npm run build        # Production build
npm start            # Start production server
```

---

## 📖 Documentation Files

| File | Purpose |
|------|---------|
| `IMPLEMENTATION_BRIEF_MOVE_IMPROVE.md` | Complete spec (data models, engine, admin panel, PDF) |
| `SCAFFOLD_IMPLEMENTATION.md` | File structure & Phase 2 templates |
| `IMPLEMENTATION_SUMMARY.md` | What's done, what's next, architecture |
| `QUICKSTART.md` | This file - get up and running |

---

## 🚀 What's Next (Phase 2)

### Option 1: Start with API Routes

```bash
# Create POST /api/quiz/start
# → Creates ResponseSession
# → Returns sessionId

# Create POST /api/quiz/submit
# → Stores ResponseAnswers
# → Runs DecisionEngine
# → Returns scores
```

Then build the quiz UI to use these endpoints.

### Option 2: Start with Quiz UI

```bash
# Create /quiz/page.tsx
# → "Start Quiz" button

# Create /quiz/[sessionId]/page.tsx
# → Load questions from DB
# → Display form
# → Submit to API

# Create /results/[sessionId]/page.tsx
# → Show decision & breakdown
# → PDF download button
```

### Option 3: Start with Admin Panel

```bash
# Create /admin/login (NextAuth login form)
# Create /admin/questions (CRUD questions)
# Create /admin/categories (CRUD categories)
# Create /admin/scoring (Edit thresholds)
# Create /admin/versions (History + rollback)
```

---

## 🧪 Testing the Engine

Quick test without UI:

```typescript
// Create a test file: src/__tests__/engine.test.ts

import { DecisionEngine } from '@/lib/decision-engine';
import { loadActiveConfig } from '@/lib/config-loader';

async function test() {
  const config = await loadActiveConfig();
  const engine = new DecisionEngine(config);
  
  const result = engine.calculateScores({
    Q1: '8',
    Q2: '6',
    Q3: '7',
  });
  
  console.log('Decision:', result.decision);
  console.log('Improve Score:', result.improveScore);
  console.log('Move Score:', result.moveScore);
}

test();
```

Run with:
```bash
npx ts-node src/__tests__/engine.test.ts
```

---

## ❓ Troubleshooting

### "DATABASE_URL not found"

```bash
# Make sure .env.local exists and has DATABASE_URL
cat .env.local | grep DATABASE_URL
```

### "No active questionnaire version"

The seed script creates an initial version. If missing:

```bash
# Check what's in the database
npx prisma studio

# Look at QuestionnaireVersion table
# Make sure one has isActive = true
```

### TypeScript errors after schema change

```bash
# Regenerate Prisma client
npx prisma generate

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Port 3000 already in use

```bash
# Use a different port
PORT=3001 npm run dev
```

---

## 📊 Architecture at a Glance

```
Database (PostgreSQL)
    ↓
Config Loader (loadActiveConfig)
    ↓
Decision Engine (calculateScores)
    ↓
API Routes (handle requests)
    ↓
React Components (display results)
    ↓
PDF Generator (export)
```

---

## 🎯 Success Checklist

After setup, verify:

- [ ] `npm run dev` starts without errors
- [ ] Database tables created (`npx prisma studio`)
- [ ] TypeScript compiles (`npm run type-check`)
- [ ] Admin user created (check seed output)
- [ ] Decision engine can load config
- [ ] Decision engine produces valid scores

---

## 🚀 Ready to Build?

Pick one:

1. **"Let me scaffold Phase 2 completely"** → API + Quiz + Admin + PDF all at once
2. **"I'll build incrementally"** → Start with API routes
3. **"I want a working quiz first"** → Build UI first, API second
4. **"Admin panel is priority"** → Build admin CRUD first

---

## 💬 Questions?

Refer to:
- `IMPLEMENTATION_BRIEF_MOVE_IMPROVE.md` - Technical details
- `SCAFFOLD_IMPLEMENTATION.md` - Code structure & templates
- `IMPLEMENTATION_SUMMARY.md` - Architecture & timeline

Happy building! 🚀
