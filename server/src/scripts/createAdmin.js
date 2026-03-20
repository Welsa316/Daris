/**
 * Admin account creation script
 * Run: node src/scripts/createAdmin.js
 *
 * Creates the Sheikh admin account securely via CLI (not through public registration)
 */
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../utils/crypto.js';

const prisma = new PrismaClient();

async function createAdmin() {
  const email = process.env.ADMIN_EMAIL || 'sheikh@daris.com';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) {
    console.error('ADMIN_PASSWORD environment variable is required');
    process.exit(1);
  }

  // Check if admin already exists
  const existing = await prisma.user.findFirst({
    where: { email: email.toLowerCase() },
  });

  if (existing) {
    console.log('Admin account already exists:', email);
    await prisma.$disconnect();
    return;
  }

  const passwordHash = await hashPassword(password);

  const admin = await prisma.user.create({
    data: {
      email: email.toLowerCase(),
      passwordHash,
      firstName: 'Sheikh',
      lastName: 'Admin',
      country: 'Egypt',
      role: 'admin',
      emailVerified: true,
    },
  });

  console.log('Admin account created successfully');
  console.log('  Email:', admin.email);
  console.log('  ID:', admin.id);

  // Initialize student count cache
  await prisma.studentCountCache.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton', count: 0 },
  });

  console.log('Student count cache initialized');
  await prisma.$disconnect();
}

createAdmin().catch((error) => {
  console.error('Failed to create admin:', error.message);
  process.exit(1);
});
