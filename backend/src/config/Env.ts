import { config } from 'dotenv';

config();

const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  JWT_SECRET: process.env.JWT_SECRET || '',
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
};

if (!env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export default env;
