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
  // Check what the API would fetch
  const activeVersion = await prisma.questionnaireVersion.findFirst({
    where: { isActive: true },
    include: {
      questions: {
        select: { id: true, text: true, sortOrder: true }
      }
    }
  });

  console.log('=== ACTIVE VERSION FETCHED BY API ===\n');
  console.log(`Version ID: ${activeVersion.id}`);
  console.log(`Total Questions: ${activeVersion.questions.length}`);
  console.log(`\nFirst 5 questions:`);
  
  activeVersion.questions.slice(0, 5).forEach((q, idx) => {
    console.log(`${idx + 1}. ${q.text.substring(0, 70)}...`);
  });

  // Check if there are any inactive versions
  const inactiveVersions = await prisma.questionnaireVersion.findMany({
    where: { isActive: false },
    include: {
      questions: { select: { id: true } }
    }
  });

  console.log(`\n=== INACTIVE VERSIONS ===`);
  console.log(`Count: ${inactiveVersions.length}`);
  inactiveVersions.forEach(v => {
    console.log(`- ${v.id.substring(0, 12)}... (${v.questions.length} questions)`);
  });
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
