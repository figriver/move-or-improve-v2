import { NextRequest, NextResponse } from 'next/server';
import { getSessionWithBypass } from '@/lib/auth';


import { prisma } from '@/lib/prisma';

/**
 * GET /api/admin/scoring
 * Get scoring config for active version
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getSessionWithBypass();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const activeVersion = await prisma.questionnaireVersion.findFirst({
      where: { isActive: true },
    });

    if (!activeVersion) {
      return NextResponse.json(
        { error: 'No active version' },
        { status: 400 }
      );
    }

    const scoringConfig = await prisma.scoringConfig.findUnique({
      where: { versionId: activeVersion.id },
    });

    return NextResponse.json({
      success: true,
      scoringConfig,
      versionId: activeVersion.id,
    });
  } catch (error) {
    console.error('Error fetching scoring config:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scoring config' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/scoring
 * Update scoring config for active version
 */
export async function PUT(req: NextRequest) {
  try {
    const session = await getSessionWithBypass();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const activeVersion = await prisma.questionnaireVersion.findFirst({
      where: { isActive: true },
    });

    if (!activeVersion) {
      return NextResponse.json(
        { error: 'No active version' },
        { status: 400 }
      );
    }

    const scoringConfig = await prisma.scoringConfig.update({
      where: { versionId: activeVersion.id },
      data: {
        ...(body.equalWeighting !== undefined && { equalWeighting: body.equalWeighting }),
        ...(body.neutralZoneMin !== undefined && { neutralZoneMin: body.neutralZoneMin }),
        ...(body.neutralZoneMax !== undefined && { neutralZoneMax: body.neutralZoneMax }),
        ...(body.strongLeanThreshold !== undefined && { strongLeanThreshold: body.strongLeanThreshold }),
        ...(body.moderateLeanThreshold !== undefined && { moderateLeanThreshold: body.moderateLeanThreshold }),
        ...(body.slightLeanThreshold !== undefined && { slightLeanThreshold: body.slightLeanThreshold }),
        ...(body.naHandling !== undefined && { naHandling: body.naHandling }),
      },
    });

    return NextResponse.json({
      success: true,
      scoringConfig,
    });
  } catch (error) {
    console.error('Error updating scoring config:', error);
    return NextResponse.json(
      { error: 'Failed to update scoring config' },
      { status: 500 }
    );
  }
}
