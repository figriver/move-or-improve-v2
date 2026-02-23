const fs = require('fs');
const { PrismaClient } = require('@prisma/client');

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
  const realVersionId = 'cmlzefu4c000111vd0kd4k4bj';

  // Get first 5 questions
  const questions = await prisma.question.findMany({
    where: { versionId: realVersionId },
    orderBy: { sortOrder: 'asc' },
    take: 5,
    include: { category: true }
  });

  console.log('=== First 5 Questions in Real Assessment ===\n');
  questions.forEach((q, idx) => {
    console.log(`${idx + 1}. [Order: ${q.sortOrder}] [Category: ${q.category.label}]`);
    console.log(`   Question: ${q.text.substring(0, 80)}...`);
    console.log('');
  });

  // Get total count
  const totalQuestions = await prisma.question.count({
    where: { versionId: realVersionId }
  });
  console.log(`Total questions in real version: ${totalQuestions}`);

  // Get version status
  const version = await prisma.questionnaireVersion.findUnique({
    where: { id: realVersionId }
  });
  console.log(`Active: ${version.isActive}`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
