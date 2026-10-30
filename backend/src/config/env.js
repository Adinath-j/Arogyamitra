import dotenv from 'dotenv';
dotenv.config();

function parseCorsOrigins(raw) {
  if (!raw) {
    return [
      'http://localhost:5173',
      'http://localhost:3000',
      'https://arogyamitra-chi.vercel.app',
    ];
  }
  const trimmed = raw.trim();
  if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed;
    } catch {
      // ignore
    }
  }
  return trimmed.split(',').map((o) => o.trim()).filter(Boolean);
}

export const env = {
  PORT: parseInt(process.env.PORT || '8000', 10),
  ENVIRONMENT: process.env.ENVIRONMENT || 'development',
  DEBUG: process.env.DEBUG === 'true' || true,
  DATABASE_URL: process.env.DATABASE_URL || '',
  JWT_SECRET_KEY: process.env.JWT_SECRET_KEY || process.env.SECRET_KEY || 'arogyamitra-jwt-secret-2024',
  SECRET_KEY: process.env.SECRET_KEY || 'arogyamitra-super-secret-key-2024',
  JWT_ALGORITHM: process.env.ALGORITHM || 'HS256',
  ACCESS_TOKEN_EXPIRE_MINUTES: parseInt(process.env.ACCESS_TOKEN_EXPIRE_MINUTES || '1440', 10),
  CORS_ORIGINS: parseCorsOrigins(process.env.CORS_ORIGINS),
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  GOOGLE_CALENDAR_CLIENT_ID: process.env.GOOGLE_CALENDAR_CLIENT_ID || '',
  GOOGLE_CALENDAR_CLIENT_SECRET: process.env.GOOGLE_CALENDAR_CLIENT_SECRET || '',
  GOOGLE_CALENDAR_REDIRECT_URI: process.env.GOOGLE_CALENDAR_REDIRECT_URI || 'http://localhost:8000/api/calendar/callback',
  YOUTUBE_API_KEY: process.env.YOUTUBE_API_KEY || '',
  SPOONACULAR_API_KEY: process.env.SPOONACULAR_API_KEY || '',
};
