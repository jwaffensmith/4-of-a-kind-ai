import { config } from 'dotenv';

config();

const env = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || '',
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD || '',
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000'
};

export default env;
