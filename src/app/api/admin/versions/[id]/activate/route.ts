import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithBypass } from '@/lib/auth';


import { prisma } from '@/lib/prisma';

/**
 * POST /api/admin/versions/[id]/activate
 * Activate a specific version
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSessionWithBypass();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check admin role
    const userRole = (session.user as any)?.role;
    if (userRole !== 'ADMIN') {
      return NextResponse.json({ error: 'Only admins can activate versions' }, { status: 403 });
    }

    // Deactivate all other versions
    await prisma.questionnaireVersion.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });

    // Activate the specified version
    const version = await prisma.questionnaireVersion.update({
      where: { id: params.id },
      data: { isActive: true },
    });

    return NextResponse.json({
      success: true,
      message: `Version ${version.version} activated`,
      version,
    });
  } catch (error) {
    console.error('Error activating version:', error);
    return NextResponse.json(
      { error: 'Failed to activate version' },
      { status: 500 }
    );
  }
}
