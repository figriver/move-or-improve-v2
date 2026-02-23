import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/results/[sessionId]
 * Fetch calculated scores and category breakdown
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Get session with results and version
    const session = await prisma.responseSession.findUnique({
      where: { id: params.sessionId },
      include: {
        scoreResult: true,
        version: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    if (!session.scoreResult) {
      return NextResponse.json(
        { error: 'Results not found - session may not be completed' },
        { status: 404 }
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

    return NextResponse.json({
      success: true,
      result: {
        id: session.scoreResult.id,
        sessionId: session.scoreResult.sessionId,
        improveComposite: session.scoreResult.improveComposite,
        moveComposite: session.scoreResult.moveComposite,
        decisionIndex: session.scoreResult.decisionIndex,
        decision: session.scoreResult.decision,
        leanStrength: session.scoreResult.leanStrength,
        categoryBreakdown: session.scoreResult.categoryBreakdown,
        metadata: session.scoreResult.metadata,
        createdAt: session.scoreResult.createdAt,
      },
      categories,
      version: {
        version: session.version.version,
        isActive: session.version.isActive,
      },
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    return NextResponse.json(
      { error: 'Failed to fetch results' },
      { status: 500 }
    );
  }
}
