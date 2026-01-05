import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import env from '../config/Env';
import { UnauthorizedError } from '../utils/Errors';
import logger from '../utils/Logger';

// Token expiration: 1 day
const TOKEN_EXPIRATION_SECONDS = 24 * 60 * 60;

interface TokenPayload {
  iat: number;
  exp: number;
}

/**
 * Creates a signed token using HMAC-SHA256
 * Format: base64(payload).base64(signature)
 */
const createToken = (): string => {
  const now = Math.floor(Date.now() / 1000);
  const payload: TokenPayload = {
    iat: now,
    exp: now + TOKEN_EXPIRATION_SECONDS,
  };

  const payloadStr = JSON.stringify(payload);
  const payloadB64 = Buffer.from(payloadStr).toString('base64url');
  
  const signature = crypto
    .createHmac('sha256', env.JWT_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
};

/**
 * Verifies and decodes a token
 * Returns the payload if valid, null otherwise
 */
const verifyToken = (token: string): TokenPayload | null => {
  try {
    const [payloadB64, signature] = token.split('.');
    
    if (!payloadB64 || !signature) {
      return null;
    }

    const expectedSignature = crypto
      .createHmac('sha256', env.JWT_SECRET)
      .update(payloadB64)
      .digest('base64url');

    if (signature !== expectedSignature) {
      return null;
    }

    const payloadStr = Buffer.from(payloadB64, 'base64url').toString('utf-8');
    const payload: TokenPayload = JSON.parse(payloadStr);

    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      return null;
    }

    return payload;
  } catch (error) {
    return null;
  }
};

export const adminLogin = (req: Request, res: Response): void => {
  const { password } = req.body;

  if (!password || password !== env.ADMIN_PASSWORD) {
    logger.warn('Failed admin login attempt');
    res.status(401).json({ error: 'Invalid password' });
    return;
  }

  const token = createToken();

  logger.info('Admin logged in successfully');

  res.json({
    token,
    expiresIn: TOKEN_EXPIRATION_SECONDS,
  });
};

export const adminAuth = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader?.replace('Bearer ', '');

  if (!token) {
    next(new UnauthorizedError('No token provided'));
    return;
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    next(new UnauthorizedError('Invalid or expired token'));
    return;
  }

  next();
};

export const adminLogout = (_req: Request, res: Response): void => {
  logger.info('Admin logged out');
  res.json({ message: 'Logged out successfully' });
};

