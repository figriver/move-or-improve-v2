import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithBypass } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/categories
 * List all categories
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionWithBypass();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
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

    const categories = await prisma.category.findMany({
      where: { versionId: activeVersion.id },
      orderBy: { sortOrder: 'asc' },
    });

    return NextResponse.json({
      success: true,
      categories,
      total: categories.length,
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/categories
 * Create a new category
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getSessionWithBypass();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, label, description, defaultWeight, sortOrder } = body;

    // Validate required fields
    if (!name || !label) {
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

    // Create category
    const category = await prisma.category.create({
      data: {
        versionId: activeVersion.id,
        name,
        label,
        description,
        defaultWeight: defaultWeight || 1,
        sortOrder: sortOrder || 0,
        isActive: true,
      },
    });

    return NextResponse.json({
      success: true,
      category,
    });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
