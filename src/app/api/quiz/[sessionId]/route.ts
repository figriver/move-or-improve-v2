import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/quiz/[sessionId]
 * Fetch session data and associated questions
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

    // Get questions for this version
    const questions = await prisma.question.findMany({
      where: {
        versionId: session.versionId,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      versionId: session.versionId,
      createdAt: session.createdAt,
      questions,
      totalQuestions: questions.length,
    });
  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}
