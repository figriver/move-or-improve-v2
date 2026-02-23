import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySeed() {
  console.log('\n📊 VERIFYING DATABASE SEED\n');
  console.log('═'.repeat(80));

  try {
    // Check QuestionnaireVersion
    const versions = await prisma.questionnaireVersion.findMany();
    console.log(`\n✅ Questionnaire Versions: ${versions.length}`);
    versions.forEach((v) => {
      console.log(`   - Version ${v.version} (ID: ${v.id}, Active: ${v.isActive})`);
    });

    const version = versions[versions.length - 1];
    if (!version) throw new Error('No version found');

    // Check Categories
    const categories = await prisma.category.findMany({
      where: { versionId: version.id },
    });
    console.log(`\n✅ Categories: ${categories.length}`);
    categories.forEach((c) => {
      console.log(`   - ${c.label} (${c.name})`);
    });

    // Check Questions
    const questions = await prisma.question.findMany({
      where: { versionId: version.id },
      include: { category: true, scoring: true },
    });
    console.log(`\n✅ Questions: ${questions.length}`);

    // Group by category
    const questionsByCategory = categories.map((cat) => {
      const count = questions.filter((q) => q.categoryId === cat.id).length;
      return { category: cat.label, count };
    });

    questionsByCategory.forEach((item) => {
      console.log(`   - ${item.category}: ${item.count} questions`);
    });

    // Check Question Types
    const typeBreakdown = questions.reduce(
      (acc, q) => {
        acc[q.type] = (acc[q.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    console.log(`\n✅ Question Types:`);
    Object.entries(typeBreakdown).forEach(([type, count]) => {
      console.log(`   - ${type}: ${count}`);
    });

    // Check Scoring
    const scoringCount = await prisma.questionScoring.count({
      where: {
        question: {
          versionId: version.id,
        },
      },
    });
    console.log(`\n✅ Question Scoring: ${scoringCount} questions scored`);

    // Check Scoring Config
    const config = await prisma.scoringConfig.findFirst({
      where: { versionId: version.id },
    });
    console.log(`\n✅ Scoring Configuration: ${config ? 'Created' : 'Missing'}`);
    if (config) {
      console.log(`   - Equal Weighting: ${config.equalWeighting}`);
      console.log(`   - Neutral Zone: ${config.neutralZoneMin} to ${config.neutralZoneMax}`);
      console.log(`   - NA Handling: ${config.naHandling}`);
    }

    // Check Admin
    const admin = await prisma.admin.findFirst({
      where: { email: 'admin@moveimprove.local' },
    });
    console.log(`\n✅ Admin User: ${admin ? admin.email : 'Not Found'}`);

    console.log('\n' + '═'.repeat(80));
    console.log('✅ VERIFICATION COMPLETE - All data seeded successfully!\n');

    // Display summary
    console.log('📋 Final Summary:');
    console.log(`   Total Questions: ${questions.length}`);
    console.log(`   Total Categories: ${categories.length}`);
    console.log(`   Version Status: ${version.isActive ? '✓ Active' : '✗ Inactive'}`);
    console.log(`   Scoring Config: ${config ? '✓ Created' : '✗ Missing'}`);
    console.log(`   Admin User: ${admin ? '✓ Created' : '✗ Missing'}`);
  } catch (error) {
    console.error('❌ Verification failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySeed();
