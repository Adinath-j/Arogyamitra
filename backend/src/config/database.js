import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

prisma.$connect()
  .then(() => {
    logger.info('Database engine (Prisma) connected successfully.');
  })
  .catch((err) => {
    logger.warn(`Prisma connection pending or failed: ${err.message}`);
  });
