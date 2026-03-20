import { PrismaClient } from '@prisma/client';
import { isDev } from './env.js';

const basePrisma = new PrismaClient({
  log: isDev ? ['warn', 'error'] : ['error'],
});

// Soft-delete extension: filter out deleted users by default
export const prisma = basePrisma.$extends({
  query: {
    user: {
      async findMany({ args, query }) {
        args = {
          ...args,
          where: {
            ...args.where,
            ...(args.where?.deletedAt === undefined ? { deletedAt: null } : {}),
          },
        };
        return query(args);
      },
      async findFirst({ args, query }) {
        args = {
          ...args,
          where: {
            ...args.where,
            ...(args.where?.deletedAt === undefined ? { deletedAt: null } : {}),
          },
        };
        return query(args);
      },
    },
  },
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
