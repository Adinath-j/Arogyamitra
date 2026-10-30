import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import { logger } from './utils/logger.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import workoutRoutes from './routes/workoutRoutes.js';
import mealRoutes from './routes/mealRoutes.js';
import planRoutes from './routes/planRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import youtubeRoutes from './routes/youtubeRoutes.js';
import recipeRoutes from './routes/recipeRoutes.js';
import calendarRoutes from './routes/calendarRoutes.js';

const app = express();

// Request body parsers (JSON and URL-encoded for OAuth2 login form)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// CORS configuration matching FastAPI
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      if (env.CORS_ORIGINS.includes(origin) || env.CORS_ORIGINS.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev to avoid blocking
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['*'],
  })
);

// Root & Health endpoints
app.get('/', (req, res) => {
  logger.info('Root endpoint accessed');
  res.json({
    app: 'ArogyaMitra API v2.0',
    status: 'running 🌿',
    docs: '/docs',
    version: '2.0.0',
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    environment: env.ENVIRONMENT,
  });
});

// Mount all API routes under /api prefix
const PREFIX = '/api';

app.use(`${PREFIX}/auth`, authRoutes);
app.use(`${PREFIX}/user`, userRoutes);
app.use(`${PREFIX}/workout`, workoutRoutes);
app.use(`${PREFIX}/generate-workout`, workoutRoutes); // Alias matching FastAPI
app.use(`${PREFIX}/nutrition`, mealRoutes);
app.use(`${PREFIX}/plans`, planRoutes);
app.use(`${PREFIX}/aromi-chat`, chatRoutes);
app.use(`${PREFIX}/chat`, chatRoutes); // Support modern frontend ChatPage
app.use(`${PREFIX}/health-assessment`, healthRoutes);
app.use(`${PREFIX}/progress`, progressRoutes);
app.use(`${PREFIX}/youtube`, youtubeRoutes);
app.use(`${PREFIX}/recipes`, recipeRoutes);
app.use(`${PREFIX}/calendar`, calendarRoutes);

// Centralized error handler
app.use(errorHandler);

export default app;
