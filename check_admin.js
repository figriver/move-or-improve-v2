const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const admins = await prisma.admin.findMany();
  console.log('Admin count:', admins.length);
  console.log('Admins:', JSON.stringify(admins, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
