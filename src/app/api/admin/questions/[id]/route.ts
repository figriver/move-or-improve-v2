import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/questions/[id]
 * Get a specific question
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const question = await prisma.question.findUnique({
      where: { id: params.id },
      include: { scoring: true },
    });

    if (!question) {
      return NextResponse.json({ error: 'Question not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      question,
    });
  } catch (error) {
    console.error('Error fetching question:', error);
    return NextResponse.json(
      { error: 'Failed to fetch question' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/questions/[id]
 * Update a question
 */
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      text,
      type,
      categoryId,
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

    // Update question
    const question = await prisma.question.update({
      where: { id: params.id },
      data: {
        ...(text && { text }),
        ...(type && { type }),
        ...(categoryId && { categoryId }),
        ...(scaleMin !== undefined && { scaleMin }),
        ...(scaleMax !== undefined && { scaleMax }),
        ...(scaleLabels && { scaleLabels }),
        ...(options && { options }),
        ...(allowNA !== undefined && { allowNA }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
      include: { scoring: true },
    });

    // Update scoring if provided
    if (improveWeight !== undefined || moveWeight !== undefined) {
      if (question.scoring) {
        await prisma.questionScoring.update({
          where: { id: question.scoring.id },
          data: {
            ...(improveWeight !== undefined && { improveWeight }),
            ...(moveWeight !== undefined && { moveWeight }),
            ...(multiplier !== undefined && { multiplier }),
            ...(reverseScored !== undefined && { reverseScored }),
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      question,
    });
  } catch (error) {
    console.error('Error updating question:', error);
    return NextResponse.json(
      { error: 'Failed to update question' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/questions/[id]
 * Delete a question (soft delete)
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const question = await prisma.question.update({
      where: { id: params.id },
      data: { isActive: false },
    });

    return NextResponse.json({
      success: true,
      message: 'Question deleted',
      question,
    });
  } catch (error) {
    console.error('Error deleting question:', error);
    return NextResponse.json(
      { error: 'Failed to delete question' },
      { status: 500 }
    );
  }
}
