import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loadConfigByVersion } from '@/lib/config-loader';
import { DecisionEngine } from '@/lib/decision-engine';
import { Responses } from '@/types';

/**
 * POST /api/quiz/submit
 * Submit answers, calculate scores using DecisionEngine, and store results
 */
export async function POST(req: NextRequest) {
  try {
    const { sessionId, answers } = await req.json();

    if (!sessionId || !answers) {
      return NextResponse.json(
        { error: 'Missing sessionId or answers' },
        { status: 400 }
      );
    }

    // Validate session exists and not completed
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

    if (session.completedAt) {
      return NextResponse.json(
        { error: 'Session already completed' },
        { status: 400 }
      );
    }

    // Store individual answers
    const answersArray = Object.entries(answers);
    for (const [questionId, value] of answersArray) {
      const isNA = value === 'NA';
      await prisma.responseAnswer.upsert({
        where: {
          sessionId_questionId: {
            sessionId,
            questionId,
          },
        },
        update: {
          value: String(value) || null,
          isNA,
        },
        create: {
          sessionId,
          questionId,
          value: String(value) || null,
          isNA,
        },
      });
    }

    // Load config and calculate scores
    const config = await loadConfigByVersion(session.version.version);
    const engine = new DecisionEngine(config);
    const engineResults = engine.calculateScores(answers as Responses);

    // Map engine results to database enums
    const decisionMap: Record<string, 'IMPROVE' | 'MOVE' | 'UNCLEAR'> = {
      Improve: 'IMPROVE',
      Move: 'MOVE',
      Unclear: 'UNCLEAR',
    };
    const leanMap: Record<string, 'STRONG' | 'MODERATE' | 'SLIGHT' | 'UNCLEAR'> = {
      Strong: 'STRONG',
      Moderate: 'MODERATE',
      Slight: 'SLIGHT',
      Unclear: 'UNCLEAR',
    };

    // Store results
    const scoreResult = await prisma.scoreResult.create({
      data: {
        sessionId,
        improveComposite: engineResults.improveScore,
        moveComposite: engineResults.moveScore,
        decisionIndex: engineResults.decisionIndex,
        decision: decisionMap[engineResults.decision],
        leanStrength: leanMap[engineResults.lean],
        categoryBreakdown: engineResults.categoryScores as any,
        metadata: {
          totalQuestionsAnswered: engineResults.metadata.totalQuestionsAnswered,
          naCount: engineResults.metadata.naCount,
          timestamp: engineResults.metadata.timestamp,
        },
      },
    });

    // Mark session as completed
    await prisma.responseSession.update({
      where: { id: sessionId },
      data: { completedAt: new Date() },
    });

    return NextResponse.json({
      success: true,
      results: {
        id: scoreResult.id,
        sessionId: scoreResult.sessionId,
        improveComposite: scoreResult.improveComposite,
        moveComposite: scoreResult.moveComposite,
        decisionIndex: scoreResult.decisionIndex,
        decision: scoreResult.decision,
        leanStrength: scoreResult.leanStrength,
        categoryBreakdown: scoreResult.categoryBreakdown,
      },
    });
  } catch (error) {
    console.error('Error submitting answers:', error);
    return NextResponse.json(
      { error: 'Failed to submit answers' },
      { status: 500 }
    );
  }
}
