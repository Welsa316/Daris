import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
  // Initialize student count cache
  await prisma.studentCountCache.upsert({
    where: { id: 'singleton' },
    update: {},
    create: { id: 'singleton', count: 0 },
  });

  console.log('Database seeded successfully');
  await prisma.$disconnect();
}

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
