import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import env from '../config/Env';
import { UnauthorizedError } from '../utils/Errors';
import logger from '../utils/Logger';

interface Session {
  created: number;
}

// NOTE: In-memory storage is suitable for development only.
// For production, use Redis or database-backed session storage to persist tokens across restarts.
const activeSessions = new Map<string, Session>();

// Token expiration: 7 days for development (adjust for production)
const TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000;

export const adminLogin = (req: Request, res: Response): void => {
  const { password } = req.body;

  if (!password || password !== env.ADMIN_PASSWORD) {
    logger.warn('Failed admin login attempt');
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  const token = crypto.randomBytes(32).toString('hex');
  const now = Date.now();
  activeSessions.set(token, { created: now });

  logger.info('Admin logged in successfully');

  res.json({
    token,
    expiresIn: TOKEN_EXPIRATION_MS / 1000,
  });
};

export const adminAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    next(new UnauthorizedError('No token provided'));
    return;
  }

  const session = activeSessions.get(token);
  if (!session) {
    next(new UnauthorizedError('Invalid token'));
    return;
  }

  const now = Date.now();
  if (now - session.created > TOKEN_EXPIRATION_MS) {
    activeSessions.delete(token);
    next(new UnauthorizedError('Token expired'));
    return;
  }

  next();
};

export const adminLogout = (req: Request, res: Response): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (token) {
    activeSessions.delete(token);
    logger.info('Admin logged out');
  }

  res.json({ message: 'Logged out successfully' });
};

