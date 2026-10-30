import { decodeToken } from '../utils/auth.js';
import { prisma } from '../config/database.js';

export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }

  const token = authHeader.split(' ')[1];
  const payload = decodeToken(token);
  if (!payload || !payload.sub) {
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }

  try {
    const userId = parseInt(payload.sub, 10);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(401).json({ detail: 'Could not validate credentials' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ detail: 'Could not validate credentials' });
  }
}

export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.split(' ')[1];
  const payload = decodeToken(token);
  if (!payload || !payload.sub) {
    return next();
  }

  try {
    const userId = parseInt(payload.sub, 10);
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (user) {
      req.user = user;
    }
  } catch {
    // Ignore optional auth failures
  }
  next();
}
