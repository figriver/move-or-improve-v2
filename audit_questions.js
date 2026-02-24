const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function auditQuestions() {
  try {
    // Get active version with categories and questions
    const activeVersion = await prisma.questionnaireVersion.findFirst({
      where: { isActive: true },
      include: { 
        categories: true, 
        questions: true 
      },
    });

    if (!activeVersion) {
      console.log('No active version found');
      return;
    }

    console.log(`\n📋 Version ${activeVersion.version} - Active: ${activeVersion.isActive}`);
    console.log(`Categories: ${activeVersion.categories.length}`);
    console.log(`Total Questions: ${activeVersion.questions.length}`);

    // Count questions without categoryId
    const questionsWithoutCategory = activeVersion.questions.filter(q => !q.categoryId);
    console.log(`\n❌ Questions WITHOUT categoryId: ${questionsWithoutCategory.length}`);
    if (questionsWithoutCategory.length > 0) {
      questionsWithoutCategory.slice(0, 5).forEach(q => {
        console.log(`   - ${q.id}: ${q.text.substring(0, 50)}...`);
      });
    }

    // Count questions by category
    const byCategory = new Map();
    activeVersion.questions.forEach(q => {
      if (q.categoryId) {
        byCategory.set(q.categoryId, (byCategory.get(q.categoryId) || 0) + 1);
      }
    });

    console.log('\n✅ Questions by Category:');
    for (const [catId, count] of byCategory) {
      const cat = activeVersion.categories.find(c => c.id === catId);
      console.log(`   - ${cat?.name || catId}: ${count} questions`);
    }

    // List all categories
    console.log('\n📑 All Categories:');
    activeVersion.categories.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.label})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

auditQuestions();
