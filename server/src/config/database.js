import { PrismaClient } from '@prisma/client';
import { isDev } from './env.js';

export const prisma = new PrismaClient({
  log: isDev ? ['warn', 'error'] : ['error'],
});

// Soft-delete middleware: filter out deleted users by default
prisma.$use(async (params, next) => {
  if (params.model === 'User') {
    // For find operations, exclude soft-deleted records unless explicitly requested
    if (params.action === 'findMany' || params.action === 'findFirst') {
      if (!params.args) params.args = {};
      if (!params.args.where) params.args.where = {};
      if (params.args.where.deletedAt === undefined) {
        params.args.where.deletedAt = null;
      }
    }
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      // Convert findUnique to findFirst to support compound conditions
      if (params.action === 'findUnique') {
        params.action = 'findFirst';
        const where = params.args.where;
        // Flatten unique constraint keys
        params.args.where = { ...where, deletedAt: null };
      }
    }
  }
  return next(params);
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('Database connected');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}
