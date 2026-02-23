-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('SCALE', 'DROPDOWN', 'NUMERIC', 'YESNO');

-- CreateEnum
CREATE TYPE "ConditionOperator" AS ENUM ('EQ', 'NE', 'LT', 'GT', 'LTE', 'GTE', 'CONTAINS', 'IN');

-- CreateEnum
CREATE TYPE "ConditionalAction" AS ENUM ('HIDE', 'DISABLE', 'ZERO_WEIGHT', 'CHANGE_WEIGHT');

-- CreateEnum
CREATE TYPE "Decision" AS ENUM ('IMPROVE', 'MOVE', 'UNCLEAR');

-- CreateEnum
CREATE TYPE "LeanStrength" AS ENUM ('STRONG', 'MODERATE', 'SLIGHT', 'UNCLEAR');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('ADMIN', 'EDITOR');

-- CreateEnum
CREATE TYPE "VersionChangeType" AS ENUM ('QUESTION_ADDED', 'QUESTION_EDITED', 'QUESTION_DELETED', 'CATEGORY_ADDED', 'CATEGORY_EDITED', 'CATEGORY_DELETED', 'WEIGHT_UPDATED', 'THRESHOLD_UPDATED', 'RULE_ADDED', 'RULE_EDITED', 'RULE_DELETED', 'RULE_ACTIVATED', 'VERSION_ACTIVATED', 'VERSION_ROLLBACK');

-- CreateEnum
CREATE TYPE "NAHandling" AS ENUM ('EXCLUDE_FROM_DENOMINATOR', 'TREAT_AS_NEUTRAL');

-- CreateTable
CREATE TABLE "QuestionnaireVersion" (
    "id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "description" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionnaireVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "defaultWeight" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "scaleMin" INTEGER DEFAULT 1,
    "scaleMax" INTEGER DEFAULT 10,
    "scaleLabels" JSONB,
    "options" JSONB,
    "allowNA" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionScoring" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "improveWeight" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "moveWeight" DECIMAL(5,2) NOT NULL DEFAULT -1.0,
    "multiplier" DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    "reverseScored" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionScoring_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConditionalRule" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "ifQuestionId" TEXT NOT NULL,
    "operator" "ConditionOperator" NOT NULL,
    "value" TEXT NOT NULL,
    "action" "ConditionalAction" NOT NULL,
    "targetQuestionId" TEXT,
    "targetQuestionIds" TEXT[],
    "weightOverride" DECIMAL(5,2),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConditionalRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResponseSession" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "userMeta" JSONB,

    CONSTRAINT "ResponseSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResponseAnswer" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "value" TEXT,
    "isNA" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResponseAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoreResult" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "improveComposite" DECIMAL(5,4) NOT NULL,
    "moveComposite" DECIMAL(5,4) NOT NULL,
    "decisionIndex" DECIMAL(5,4) NOT NULL,
    "decision" "Decision" NOT NULL,
    "leanStrength" "LeanStrength" NOT NULL,
    "categoryBreakdown" JSONB NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ScoreResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT,
    "role" "AdminRole" NOT NULL DEFAULT 'EDITOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLogin" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VersionHistory" (
    "id" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT NOT NULL,
    "changeType" "VersionChangeType" NOT NULL,
    "description" TEXT NOT NULL,
    "configSnapshot" JSONB NOT NULL,
    "previousVersionId" TEXT,

    CONSTRAINT "VersionHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ScoringConfig" (
    "id" TEXT NOT NULL,
    "versionId" TEXT NOT NULL,
    "equalWeighting" BOOLEAN NOT NULL DEFAULT true,
    "neutralZoneMin" DECIMAL(5,4) NOT NULL DEFAULT -0.75,
    "neutralZoneMax" DECIMAL(5,4) NOT NULL DEFAULT 0.75,
    "strongLeanThreshold" DECIMAL(5,4) NOT NULL DEFAULT 1.5,
    "moderateLeanThreshold" DECIMAL(5,4) NOT NULL DEFAULT 0.75,
    "slightLeanThreshold" DECIMAL(5,4) NOT NULL DEFAULT 0.3,
    "naHandling" "NAHandling" NOT NULL DEFAULT 'EXCLUDE_FROM_DENOMINATOR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoringConfig_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QuestionnaireVersion_isActive_idx" ON "QuestionnaireVersion"("isActive");

-- CreateIndex
CREATE INDEX "QuestionnaireVersion_version_idx" ON "QuestionnaireVersion"("version");

-- CreateIndex
CREATE INDEX "Category_versionId_idx" ON "Category"("versionId");

-- CreateIndex
CREATE INDEX "Category_sortOrder_idx" ON "Category"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "Category_versionId_name_key" ON "Category"("versionId", "name");

-- CreateIndex
CREATE INDEX "Question_versionId_idx" ON "Question"("versionId");

-- CreateIndex
CREATE INDEX "Question_categoryId_idx" ON "Question"("categoryId");

-- CreateIndex
CREATE INDEX "Question_sortOrder_idx" ON "Question"("sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionScoring_questionId_key" ON "QuestionScoring"("questionId");

-- CreateIndex
CREATE INDEX "ConditionalRule_versionId_idx" ON "ConditionalRule"("versionId");

-- CreateIndex
CREATE INDEX "ConditionalRule_ifQuestionId_idx" ON "ConditionalRule"("ifQuestionId");

-- CreateIndex
CREATE INDEX "ResponseSession_versionId_idx" ON "ResponseSession"("versionId");

-- CreateIndex
CREATE INDEX "ResponseSession_createdAt_idx" ON "ResponseSession"("createdAt");

-- CreateIndex
CREATE INDEX "ResponseAnswer_sessionId_idx" ON "ResponseAnswer"("sessionId");

-- CreateIndex
CREATE INDEX "ResponseAnswer_questionId_idx" ON "ResponseAnswer"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ResponseAnswer_sessionId_questionId_key" ON "ResponseAnswer"("sessionId", "questionId");

-- CreateIndex
CREATE UNIQUE INDEX "ScoreResult_sessionId_key" ON "ScoreResult"("sessionId");

-- CreateIndex
CREATE INDEX "ScoreResult_sessionId_idx" ON "ScoreResult"("sessionId");

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "Admin_email_idx" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "VersionHistory_versionNumber_idx" ON "VersionHistory"("versionNumber");

-- CreateIndex
CREATE INDEX "VersionHistory_createdAt_idx" ON "VersionHistory"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ScoringConfig_versionId_key" ON "ScoringConfig"("versionId");

-- AddForeignKey
ALTER TABLE "Category" ADD CONSTRAINT "Category_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "QuestionnaireVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "QuestionnaireVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionScoring" ADD CONSTRAINT "QuestionScoring_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionalRule" ADD CONSTRAINT "ConditionalRule_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "QuestionnaireVersion"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionalRule" ADD CONSTRAINT "ConditionalRule_ifQuestionId_fkey" FOREIGN KEY ("ifQuestionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConditionalRule" ADD CONSTRAINT "ConditionalRule_targetQuestionId_fkey" FOREIGN KEY ("targetQuestionId") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponseSession" ADD CONSTRAINT "ResponseSession_versionId_fkey" FOREIGN KEY ("versionId") REFERENCES "QuestionnaireVersion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponseAnswer" ADD CONSTRAINT "ResponseAnswer_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ResponseSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ResponseAnswer" ADD CONSTRAINT "ResponseAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ScoreResult" ADD CONSTRAINT "ScoreResult_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "ResponseSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

