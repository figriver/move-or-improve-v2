# Move vs Improve - Next.js Scaffold Implementation
## Complete File Structure & Setup Guide

**Status:** Phase 1 - Database Schema & Core Engine ✅  
**Next:** Phase 2 - Next.js App Router & API Routes

---

## 📁 Directory Structure (Complete)

```
move-or-improve-assessment/
├── src/
│   ├── app/
│   │   ├── layout.tsx                 # Root layout (providers, session)
│   │   ├── page.tsx                   # Redirect to /quiz
│   │   ├── error.tsx                  # Global error boundary
│   │   ├── not-found.tsx              # 404 page
│   │   │
│   │   ├── quiz/                      # Public quiz flow
│   │   │   ├── layout.tsx             # Quiz layout (no auth required)
│   │   │   ├── page.tsx               # Start quiz / question display
│   │   │   ├── [sessionId]/
│   │   │   │   ├── page.tsx           # Display questions
│   │   │   │   └── submit/            # POST answers
│   │   │   │       └── route.ts       # API handler
│   │   │   └── loading.tsx            # Loading UI
│   │   │
│   │   ├── results/                   # Results page
│   │   │   ├── [sessionId]/
│   │   │   │   ├── page.tsx           # Show results + decision
│   │   │   │   ├── pdf/
│   │   │   │   │   └── route.ts       # Generate PDF
│   │   │   │   └── loading.tsx
│   │   │   └── layout.tsx
│   │   │
│   │   ├── admin/                     # Admin panel (protected)
│   │   │   ├── layout.tsx             # Admin layout + auth check
│   │   │   ├── page.tsx               # Dashboard
│   │   │   ├── login/
│   │   │   │   └── page.tsx           # Login form
│   │   │   │
│   │   │   ├── questions/
│   │   │   │   ├── page.tsx           # Questions list + CRUD
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx       # Edit question
│   │   │   │   └── new/
│   │   │   │       └── page.tsx       # Create question form
│   │   │   │
│   │   │   ├── categories/
│   │   │   │   ├── page.tsx           # Categories list + CRUD
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx       # Edit category
│   │   │   │   └── new/
│   │   │   │       └── page.tsx       # Create category form
│   │   │   │
│   │   │   ├── rules/
│   │   │   │   ├── page.tsx           # Conditional rules list
│   │   │   │   ├── [id]/
│   │   │   │   │   └── page.tsx       # Edit rule
│   │   │   │   └── new/
│   │   │   │       └── page.tsx       # Create rule form
│   │   │   │
│   │   │   ├── scoring/
│   │   │   │   └── page.tsx           # Edit scoring config (thresholds, weighting)
│   │   │   │
│   │   │   ├── versions/
│   │   │   │   ├── page.tsx           # Version history + rollback
│   │   │   │   └── [version]/
│   │   │   │       └── page.tsx       # View specific version
│   │   │   │
│   │   │   └── api/
│   │   │       ├── questions/
│   │   │       │   ├── route.ts       # GET/POST questions
│   │   │       │   └── [id]/
│   │   │       │       └── route.ts   # GET/PUT/DELETE specific question
│   │   │       ├── categories/
│   │   │       │   ├── route.ts
│   │   │       │   └── [id]/
│   │   │       │       └── route.ts
│   │   │       ├── rules/
│   │   │       │   ├── route.ts
│   │   │       │   └── [id]/
│   │   │       │       └── route.ts
│   │   │       ├── scoring-config/
│   │   │       │   └── route.ts       # GET/PUT scoring config
│   │   │       ├── versions/
│   │   │       │   ├── route.ts       # GET versions + activate
│   │   │       │   └── rollback/
│   │   │       │       └── route.ts   # POST to rollback
│   │   │       └── auth/
│   │   │           └── [nextauth]/
│   │   │               └── route.ts   # NextAuth handler
│   │
│   ├── api/                           # Root API routes (outside app/)
│   │   ├── quiz/
│   │   │   ├── start/                 # POST create session
│   │   │   │   └── route.ts
│   │   │   ├── submit/                # POST submit answers
│   │   │   │   └── route.ts
│   │   │   └── [sessionId]/
│   │   │       ├── route.ts           # GET session + responses
│   │   │       └── score/
│   │   │           └── route.ts       # GET calculated scores
│   │   └── health/
│   │       └── route.ts               # Health check endpoint
│   │
│   ├── components/
│   │   ├── quiz/
│   │   │   ├── QuestionRenderer.tsx   # Render question based on type
│   │   │   ├── QuestionForm.tsx       # Form with all questions
│   │   │   └── ProgressBar.tsx        # Progress indicator
│   │   │
│   │   ├── results/
│   │   │   ├── ResultsCard.tsx        # Main result display
│   │   │   ├── DecisionChart.tsx      # Visualization of scores
│   │   │   ├── CategoryBreakdown.tsx  # Per-category scores
│   │   │   └── PDFDownloadButton.tsx  # Download PDF
│   │   │
│   │   ├── admin/
│   │   │   ├── Sidebar.tsx            # Admin navigation
│   │   │   ├── QuestionForm.tsx       # Form for editing questions
│   │   │   ├── CategoryForm.tsx       # Form for editing categories
│   │   │   ├── RuleBuilder.tsx        # Conditional rule UI
│   │   │   ├── ScoringConfigForm.tsx  # Edit thresholds
│   │   │   ├── VersionHistory.tsx     # Version timeline
│   │   │   └── ActivateVersion.tsx    # Activate/rollback UI
│   │   │
│   │   └── shared/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       ├── LoadingSpinner.tsx
│   │       └── Alert.tsx
│   │
│   ├── lib/
│   │   ├── decision-engine.ts         # ✅ Core scoring engine
│   │   ├── auth.ts                    # ✅ NextAuth config
│   │   ├── prisma.ts                  # ✅ Prisma client
│   │   ├── config-loader.ts           # ✅ Load active config
│   │   ├── pdf-generator.ts           # Generate PDF reports
│   │   ├── validation.ts              # Form validation
│   │   └── errors.ts                  # Custom error classes
│   │
│   ├── types/
│   │   └── index.ts                   # ✅ All TypeScript types
│   │
│   └── styles/
│       ├── globals.css
│       └── components.css
│
├── prisma/
│   ├── schema.prisma                  # ✅ Database schema
│   ├── migrations/                    # Auto-generated
│   └── seed.ts                        # Seed initial data
│
├── public/
│   ├── favicon.ico
│   └── logo.svg
│
├── .env.local.example                 # ✅ Environment template
├── .env.local                         # Create from .example
├── .gitignore
├── package.json                       # ✅ Dependencies
├── tsconfig.json                      # ✅ TypeScript config
├── next.config.js                     # ✅ Next.js config
├── prettier.config.js                 # Code formatting
├── .eslintrc.json                     # Linting
└── README.md                          # Documentation

```

---

## 🚀 Setup Instructions

### 1. Install Dependencies

```bash
cd move-or-improve-assessment
npm install
```

### 2. Set Up Environment

```bash
cp .env.local.example .env.local

# Edit .env.local with your PostgreSQL URL
# DATABASE_URL="postgresql://user:password@localhost:5432/move_improve_db"
# NEXTAUTH_SECRET=$(openssl rand -base64 32)
# NEXTAUTH_URL="http://localhost:3000"
```

### 3. Initialize Database

```bash
# Create database & run migrations
npm run db:push

# Seed with initial data (optional)
npm run db:seed
```

### 4. Create First Admin User

```bash
# Use the seed script or create via:
npx ts-node prisma/seed-admin.ts
```

### 5. Start Development Server

```bash
npm run dev
# Open http://localhost:3000
```

---

## 📋 Phase 2: File Templates (Ready to Create)

### A. Root Layout (src/app/layout.tsx)

```typescript
import type { Metadata } from 'next';
import { SessionProvider } from 'next-auth/react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import './globals.css';

export const metadata: Metadata = {
  title: 'Move vs Improve Assessment',
  description: 'Objective assessment tool to help you decide: improve your current situation or move',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body>
        <SessionProvider session={session}>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

### B. Quiz Start Page (src/app/quiz/page.tsx)

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

export default function QuizStart() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleStart = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/quiz/start');
      const { sessionId } = res.data;
      router.push(`/quiz/${sessionId}`);
    } catch (error) {
      console.error('Failed to start quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="quiz-start">
      <h1>Move vs Improve Assessment</h1>
      <p>Objective. Transparent. Customizable.</p>
      <button onClick={handleStart} disabled={loading}>
        {loading ? 'Starting...' : 'Start Assessment'}
      </button>
    </div>
  );
}
```

### C. API Route: Start Quiz (src/app/api/quiz/start/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loadActiveConfig } from '@/lib/config-loader';

export async function POST(req: NextRequest) {
  try {
    // Get active version
    const activeVersion = await prisma.questionnaireVersion.findFirst({
      where: { isActive: true },
      select: { id: true },
    });

    if (!activeVersion) {
      return NextResponse.json(
        { error: 'No active questionnaire version' },
        { status: 400 }
      );
    }

    // Create response session
    const session = await prisma.responseSession.create({
      data: {
        versionId: activeVersion.id,
        userMeta: {}, // Can be populated from query params
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to start quiz' },
      { status: 500 }
    );
  }
}
```

### D. API Route: Submit Answers (src/app/api/quiz/submit/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loadConfigByVersion } from '@/lib/config-loader';
import { DecisionEngine } from '@/lib/decision-engine';

export async function POST(req: NextRequest) {
  try {
    const { sessionId, answers } = await req.json();

    // Validate session exists
    const session = await prisma.responseSession.findUnique({
      where: { id: sessionId },
      include: { version: true },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Store answers
    for (const [questionId, value] of Object.entries(answers)) {
      await prisma.responseAnswer.upsert({
        where: {
          sessionId_questionId: {
            sessionId,
            questionId: questionId as string,
          },
        },
        update: {
          value: value as string,
          isNA: value === 'NA',
        },
        create: {
          sessionId,
          questionId: questionId as string,
          value: value as string,
          isNA: value === 'NA',
        },
      });
    }

    // Load config and calculate scores
    const config = await loadConfigByVersion(session.version.version);
    const engine = new DecisionEngine(config);
    const results = engine.calculateScores(answers);

    // Store results
    const scoreResult = await prisma.scoreResult.create({
      data: {
        sessionId,
        improveComposite: results.improveScore,
        moveComposite: results.moveScore,
        decisionIndex: results.decisionIndex,
        decision: results.decision,
        leanStrength: results.lean,
        categoryBreakdown: results.categoryScores,
        metadata: results.metadata,
      },
    });

    // Mark session as completed
    await prisma.responseSession.update({
      where: { id: sessionId },
      data: { completedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      results: scoreResult,
    });
  } catch (error) {
    console.error('Error submitting answers:', error);
    return NextResponse.json(
      { error: 'Failed to submit answers' },
      { status: 500 }
    );
  }
}
```

### E. API Route: Generate PDF (src/app/api/results/[sessionId]/pdf/route.ts)

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generatePDF } from '@/lib/pdf-generator';

export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Get session, answers, and results
    const session = await prisma.responseSession.findUnique({
      where: { id: params.sessionId },
      include: {
        scoreResult: true,
        version: true,
        answers: true,
      },
    });

    if (!session || !session.scoreResult) {
      return NextResponse.json(
        { error: 'Session or results not found' },
        { status: 404 }
      );
    }

    // Generate PDF
    const pdfBuffer = await generatePDF(session);

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="move-improve-results-${params.sessionId}.pdf"`,
      },
    });
  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
```

---

## ✅ Completed Phase 1 Files

- [x] `prisma/schema.prisma` - Full database schema with all models
- [x] `src/types/index.ts` - All TypeScript type definitions
- [x] `src/lib/decision-engine.ts` - Core scoring engine (NA-safe, config-driven)
- [x] `src/lib/auth.ts` - NextAuth with credentials provider
- [x] `src/lib/prisma.ts` - Prisma client singleton
- [x] `src/lib/config-loader.ts` - Config loading utilities
- [x] `package.json` - All dependencies configured
- [x] `.env.local.example` - Environment template
- [x] `tsconfig.json` - TypeScript configuration
- [x] `next.config.js` - Next.js configuration

---

## 🔜 Phase 2 (Next Steps)

Create the remaining files in this order:

1. **Prisma Setup** (5 mins)
   - Run `npm install && npm run db:push`
   - Seed initial version with `npm run db:seed`

2. **App Routes** (1 hour)
   - Root layout + providers
   - Quiz pages (start, questions, results)
   - Results display + PDF download button

3. **API Routes** (1.5 hours)
   - POST /api/quiz/start
   - POST /api/quiz/submit
   - GET /api/results/[sessionId]
   - GET /api/results/[sessionId]/pdf

4. **Admin Panel** (2 hours)
   - Auth middleware
   - Dashboard layout
   - Questions CRUD
   - Categories CRUD
   - Conditional rules builder
   - Scoring config editor
   - Version history

5. **PDF Generation** (1 hour)
   - Implement `src/lib/pdf-generator.ts`
   - Test PDF output

6. **Testing & Deployment** (1+ hours)
   - Unit tests for decision engine
   - E2E tests for quiz flow
   - Deploy to Vercel

---

## 📦 Quick Start Commands

```bash
# Install & setup
npm install
npm run db:push
npm run db:seed

# Development
npm run dev          # http://localhost:3000

# Admin login
# Email: admin@moveimprove.local
# Password: (check seed output)

# Type checking
npm run type-check

# Build
npm run build
npm start
```

---

## 🎯 Architecture Highlights

- **Config-Driven**: Zero hardcoding. All questions/scores/weights in database
- **NA-Safe**: Division-by-zero protection, proper handling of missing data
- **Version Control**: Full snapshots, audit trail, rollback capability
- **Transparent Math**: Decision engine fully auditable & explained
- **Admin CRUD**: Full lifecycle management without code changes
- **Public-Facing**: Clean quiz UX, results, PDF export
- **Secure**: NextAuth protected admin panel, audit logging

---

Ready to scaffold Phase 2? Let me know which file to start with!
