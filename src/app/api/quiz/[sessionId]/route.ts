import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface CategoryWithQuestions {
  id: string;
  name: string;
  label: string;
  description?: string;
  sortOrder: number;
  questions: any[];
  totalCount: number;
  answeredCount: number;
}

/**
 * GET /api/quiz/[sessionId]
 * Fetch session data and associated questions grouped by category
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Get session
    const session = await prisma.responseSession.findUnique({
      where: { id: params.sessionId },
      include: {
        version: true,
        answers: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // If already completed, don't allow further changes
    if (session.completedAt) {
      return NextResponse.json(
        { error: 'This session has already been completed' },
        { status: 400 }
      );
    }

    // Get categories for this version
    const categories = await prisma.category.findMany({
      where: {
        versionId: session.versionId,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Get questions for this version
    const questions = await prisma.question.findMany({
      where: {
        versionId: session.versionId,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    // Group questions by category
    const categoriesWithQuestions: CategoryWithQuestions[] = categories.map(cat => {
      const catQuestions = questions.filter(q => q.categoryId === cat.id);
      const answeredQuestions = session.answers.filter(
        a => catQuestions.some(q => q.id === a.questionId)
      );
      
      return {
        id: cat.id,
        name: cat.name,
        label: cat.label,
        description: cat.description || '',
        sortOrder: cat.sortOrder,
        questions: catQuestions,
        totalCount: catQuestions.length,
        answeredCount: answeredQuestions.length,
      };
    });

    // Calculate current recommendation based on answered questions
    let currentRecommendation = null;
    let recommendationConfidence = 0;

    if (session.answers.length > 0) {
      const totalQuestions = questions.length;
      const answeredCount = session.answers.length;
      recommendationConfidence = Math.round((answeredCount / totalQuestions) * 100);

      // Get score result if completed
      const scoreResult = await prisma.scoreResult.findUnique({
        where: { sessionId: session.id },
      });

      if (scoreResult) {
        currentRecommendation = {
          decision: scoreResult.decision,
          leanStrength: scoreResult.leanStrength,
          decisionIndex: parseFloat(scoreResult.decisionIndex.toString()),
        };
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      versionId: session.versionId,
      createdAt: session.createdAt,
      categories: categoriesWithQuestions,
      currentRecommendation,
      recommendationConfidence,
      totalQuestions: questions.length,
      answeredQuestions: session.answers.length,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
