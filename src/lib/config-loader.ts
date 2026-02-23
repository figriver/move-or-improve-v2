import { prisma } from './prisma';
import { VersionSnapshot } from '@/types';

/**
 * Load the active configuration for the decision engine
 */
export async function loadActiveConfig(): Promise<VersionSnapshot> {
  const activeVersion = await prisma.questionnaireVersion.findFirst({
    where: { isActive: true },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
      questions: {
        where: { isActive: true },
        include: {
          scoring: true,
        },
        orderBy: { sortOrder: 'asc' },
      },
      conditionalRules: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!activeVersion) {
    throw new Error('No active questionnaire version found');
  }

  // Build scoring map
  const questionScoring: Record<string, any> = {};
  for (const question of activeVersion.questions) {
    if (question.scoring) {
      questionScoring[question.id] = question.scoring;
    }
  }

  // Get scoring config
  const scoringConfig = await prisma.scoringConfig.findUnique({
    where: { versionId: activeVersion.id },
  });

  if (!scoringConfig) {
    throw new Error(`No scoring config found for version ${activeVersion.id}`);
  }

  // Build the snapshot
  const snapshot: VersionSnapshot = {
    version: activeVersion.version,
    isActive: activeVersion.isActive,
    categories: activeVersion.categories.map(c => ({ ...c, description: c.description ?? undefined })) as any,
    questions: activeVersion.questions.map(q => ({
      ...q,
      scoring: undefined, // Remove to avoid duplication
    })) as any,
    questionScoring,
    conditionalRules: activeVersion.conditionalRules as any,
    scoringConfig: {
      ...scoringConfig,
      neutralZoneMin: Number(scoringConfig.neutralZoneMin),
      neutralZoneMax: Number(scoringConfig.neutralZoneMax),
      strongLeanThreshold: Number(scoringConfig.strongLeanThreshold),
      moderateLeanThreshold: Number(scoringConfig.moderateLeanThreshold),
      slightLeanThreshold: Number(scoringConfig.slightLeanThreshold),
    } as any,
};

  return snapshot;
}

/**
 * Load configuration for a specific version
 */
export async function loadConfigByVersion(version: number): Promise<VersionSnapshot> {
  const questVersion = await prisma.questionnaireVersion.findFirst({
    where: { version },
    include: {
      categories: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
      questions: {
        where: { isActive: true },
        include: {
          scoring: true,
        },
        orderBy: { sortOrder: 'asc' },
      },
      conditionalRules: {
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
      },
    },
  });

  if (!questVersion) {
    throw new Error(`Version ${version} not found`);
  }

  const questionScoring: Record<string, any> = {};
  for (const question of questVersion.questions) {
    if (question.scoring) {
      questionScoring[question.id] = question.scoring;
    }
  }

  const scoringConfig = await prisma.scoringConfig.findUnique({
    where: { versionId: questVersion.id },
  });

  if (!scoringConfig) {
    throw new Error(`No scoring config found for version ${questVersion.id}`);
  }

  const snapshot: VersionSnapshot = {
    version: questVersion.version,
    isActive: questVersion.isActive,
    categories: questVersion.categories.map(c => ({ ...c, description: c.description ?? undefined })) as any,
    questions: questVersion.questions.map(q => ({
      ...q,
      scoring: undefined,
    })) as any,
    questionScoring,
    conditionalRules: questVersion.conditionalRules,
    scoringConfig: {
      ...scoringConfig,
      neutralZoneMin: Number(scoringConfig.neutralZoneMin),
      neutralZoneMax: Number(scoringConfig.neutralZoneMax),
      strongLeanThreshold: Number(scoringConfig.strongLeanThreshold),
      moderateLeanThreshold: Number(scoringConfig.moderateLeanThreshold),
      slightLeanThreshold: Number(scoringConfig.slightLeanThreshold),
    } as any,
};

  return snapshot;
}

/**
 * Get the latest version number
 */
export async function getLatestVersionNumber(): Promise<number> {
  const latest = await prisma.questionnaireVersion.findFirst({
    orderBy: { version: 'desc' },
    select: { version: true },
  });

  return latest?.version || 0;
}

/**
 * Get all available versions
 */
export async function getAllVersions() {
  return await prisma.questionnaireVersion.findMany({
    orderBy: { version: 'desc' },
    select: {
      id: true,
      version: true,
      isActive: true,
      createdAt: true,
      createdBy: true,
      description: true,
    },
  });
}
