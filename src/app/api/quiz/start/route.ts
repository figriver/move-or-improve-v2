import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * POST /api/quiz/start
 * Create a new response session and return sessionId
 */
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

    // Parse user metadata from request body if provided
    let userMeta: Record<string, any> = {};
    try {
      const body = await req.json();
      userMeta = body.userMeta || {};
    } catch (e) {
      // No body or invalid JSON, use empty metadata
    }

    // Create response session
    const session = await prisma.responseSession.create({
      data: {
        versionId: activeVersion.id,
        userMeta,
      },
    });

    return NextResponse.json({
      success: true,
      sessionId: session.id,
      createdAt: session.createdAt,
    });
  } catch (error) {
    console.error('Error starting quiz:', error);
    return NextResponse.json(
      { error: 'Failed to start quiz' },
      { status: 500 }
    );
  }
}
