const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Test 1: Check admin exists
  const admin = await prisma.admin.findUnique({
    where: { email: 'admin@moveimprove.local' },
  });
  
  console.log('Test 1 - Admin exists:', !!admin);
  
  if (!admin) {
    console.log('ERROR: Admin not found');
    return;
  }
  
  // Test 2: Try password comparison
  const password = 'admin123'; // Default test password
  const isValid = await bcrypt.compare(password, admin.passwordHash);
  console.log('Test 2 - Password valid with "admin123":', isValid);
  
  // Test 3: Check password hash exists
  console.log('Test 3 - Password hash exists:', !!admin.passwordHash);
  console.log('Test 3 - Password hash:', admin.passwordHash.substring(0, 20) + '...');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
