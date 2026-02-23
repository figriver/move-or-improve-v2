const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

// Load .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').replace(/^"/, '').replace(/"$/, '');
    process.env[key.trim()] = value;
  }
});

const prisma = new PrismaClient();

async function main() {
  const realVersionId = 'cmlzefu4c000111vd0kd4k4bj';  // 100 questions
  const sampleVersionId = 'cmlvwge5i00012t7nx92qnad2'; // 4 questions

  console.log('Starting cleanup...\n');

  // Step 1: Deactivate the sample version
  console.log('1. Deactivating sample version (4 questions)...');
  const updatedSampleVersion = await prisma.questionnaireVersion.update({
    where: { id: sampleVersionId },
    data: { isActive: false }
  });
  console.log(`   ✓ Sample version deactivated`);

  // Step 2: Count questions in sample version before deleting
  const sampleQuestions = await prisma.question.findMany({
    where: { versionId: sampleVersionId }
  });
  console.log(`\n2. Found ${sampleQuestions.length} questions in sample version`);

  // Step 3: Delete sample version questions (cascades, but let's be explicit)
  console.log('3. Deleting sample version questions...');
  const deletedQCount = await prisma.question.deleteMany({
    where: { versionId: sampleVersionId }
  });
  console.log(`   ✓ Deleted ${deletedQCount.count} questions`);

  // Step 4: Delete categories from sample version
  console.log('4. Deleting categories from sample version...');
  const deletedCatCount = await prisma.category.deleteMany({
    where: { versionId: sampleVersionId }
  });
  console.log(`   ✓ Deleted ${deletedCatCount.count} categories`);

  // Step 5: Verify real version is active
  const realVersion = await prisma.questionnaireVersion.findUnique({
    where: { id: realVersionId },
    include: { questions: { select: { id: true } } }
  });
  console.log(`\n5. Real version status:`);
  console.log(`   ID: ${realVersion.id}`);
  console.log(`   Active: ${realVersion.isActive}`);
  console.log(`   Questions: ${realVersion.questions.length}`);

  // Step 6: List all remaining versions
  const allVersions = await prisma.questionnaireVersion.findMany({
    include: { questions: { select: { id: true } } },
    orderBy: { createdAt: 'desc' }
  });
  console.log(`\n6. Final version list:`);
  allVersions.forEach((v, idx) => {
    console.log(`   ${idx + 1}. ${v.id.substring(0, 12)}... - ${v.questions.length} questions - Active: ${v.isActive}`);
  });

  console.log('\n✓ Cleanup complete!');
}

main()
  .catch(e => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
