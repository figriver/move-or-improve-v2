import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithBypass } from '@/lib/auth';


import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/questions
 * List all questions for the active version
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionWithBypass();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');

    // Get active version
    const activeVersion = await prisma.questionnaireVersion.findFirst({
      where: { isActive: true },
    });

    if (!activeVersion) {
      return NextResponse.json(
        { error: 'No active version' },
        { status: 400 }
      );
    }

    const questions = await prisma.question.findMany({
      where: { versionId: activeVersion.id },
      include: { scoring: true },
      orderBy: { sortOrder: 'asc' },
      take: limit,
    });

    return NextResponse.json({
      success: true,
      questions,
      total: questions.length,
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/questions
 * Create a new question
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionWithBypass();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      categoryId,
      text,
      type,
      scaleMin,
      scaleMax,
      scaleLabels,
      options,
      allowNA,
      improveWeight,
      moveWeight,
      multiplier,
      reverseScored,
      sortOrder,
    } = body;

    // Validate required fields
    if (!categoryId || !text || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get active version
    const activeVersion = await prisma.questionnaireVersion.findFirst({
      where: { isActive: true },
    });

    if (!activeVersion) {
      return NextResponse.json(
        { error: 'No active version' },
        { status: 400 }
      );
    }

    // Create question
    const question = await prisma.question.create({
      data: {
        versionId: activeVersion.id,
        categoryId,
        text,
        type,
        scaleMin,
        scaleMax,
        scaleLabels,
        options,
        allowNA: allowNA || false,
        sortOrder: sortOrder || 0,
        isActive: true,
      },
    });

    // Create scoring
    if (improveWeight !== undefined && moveWeight !== undefined) {
      await prisma.questionScoring.create({
        data: {
          questionId: question.id,
          improveWeight,
          moveWeight,
          multiplier: multiplier || 1,
          reverseScored: reverseScored || false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      question,
    });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}
