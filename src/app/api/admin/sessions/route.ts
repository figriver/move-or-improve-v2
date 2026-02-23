import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithBypass } from '@/lib/auth';


import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/sessions
 * List all response sessions
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionWithBypass();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');

    const sessions = await prisma.responseSession.findMany({
      include: {
        scoreResult: {
          select: {
            decision: true,
            improveComposite: true,
            moveComposite: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const completed = sessions.filter(s => s.completedAt).length;

    return NextResponse.json({
      success: true,
      sessions,
      total: sessions.length,
      completed,
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
