const fs = require('fs');
const path = require('path');

// Load .env.local
const envFile = fs.readFileSync('.env.local', 'utf8');
envFile.split('\n').forEach(line => {
  if (line && !line.startsWith('#')) {
    const [key, ...valueParts] = line.split('=');
    const value = valueParts.join('=').replace(/^"/, '').replace(/"$/, '');
    process.env[key.trim()] = value;
  }
});

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Get all questionnaire versions with question count
  const versions = await prisma.questionnaireVersion.findMany({
    include: {
      questions: {
        select: { id: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  console.log('=== QUESTIONNAIRE VERSIONS ===\n');
  versions.forEach((v, idx) => {
    const questionCount = v.questions.length;
    console.log(`${idx + 1}. ID: ${v.id}`);
    console.log(`   Version: ${v.version}`);
    console.log(`   Questions: ${questionCount}`);
    console.log(`   Active: ${v.isActive}`);
    console.log(`   Created: ${v.createdAt}`);
    console.log(`   Created By: ${v.createdBy}`);
    console.log(`   Description: ${v.description || 'N/A'}`);
    console.log('');
  });

  console.log('=== SUMMARY ===');
  console.log(`Total versions: ${versions.length}`);
  const activeVersions = versions.filter(v => v.isActive);
  console.log(`Active versions: ${activeVersions.length}`);
  const realVersion = versions.find(v => v.questions.length > 50);
  if (realVersion) {
    console.log(`\nReal assessment (>50 questions): ID ${realVersion.id} with ${realVersion.questions.length} questions`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
