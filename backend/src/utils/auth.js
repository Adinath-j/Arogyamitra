import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export async function hashPassword(password) {
  // Truncate password to 72 bytes to match bcrypt standard behavior
  const truncated = Buffer.from(password, 'utf-8').subarray(0, 72).toString('utf-8');
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(truncated, salt);
}

export async function verifyPassword(plain, hashed) {
  try {
    if (!plain || !hashed) return false;
    const truncated = Buffer.from(plain, 'utf-8').subarray(0, 72).toString('utf-8');
    return await bcrypt.compare(truncated, hashed);
  } catch {
    return false;
  }
}

export function createAccessToken(data, customExpiresIn = null) {
  const expiresIn = customExpiresIn || `${env.ACCESS_TOKEN_EXPIRE_MINUTES}m`;
  return jwt.sign(data, env.JWT_SECRET_KEY, {
    algorithm: 'HS256',
    expiresIn,
  });
}

export function decodeToken(token) {
  try {
    return jwt.verify(token, env.JWT_SECRET_KEY, { algorithms: ['HS256'] });
  } catch {
    return null;
  }
}
