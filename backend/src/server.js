import app from './app.js';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { prisma } from './config/database.js';

const PORT = env.PORT || 8000;

const server = app.listen(PORT, () => {
  logger.info(`Starting ArogyaMitra API v2.0.0 in ${env.ENVIRONMENT} mode on port ${PORT}.`);
  logger.info(`Loaded CORS origins:\n- ${env.CORS_ORIGINS.join('\n- ')}`);
});

// Graceful shutdown handling
async function shutdown(signal) {
  logger.info(`Received ${signal}. Shutting down gracefully...`);
  server.close(async () => {
    logger.info('HTTP server closed.');
    await prisma.$disconnect();
    logger.info('Prisma disconnected.');
    process.exit(0);
  });

  // Force shutdown after timeout if pending connections hang
  setTimeout(() => {
    logger.error('Could not close connections in time, forcefully shutting down');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
