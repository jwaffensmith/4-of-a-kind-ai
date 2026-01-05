import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import routes from './routes/Index';
import { errorHandler } from './middleware/ErrorMiddleware';
import logger from './utils/Logger';
import env from './config/Env';

const createApp = (): Application => {
  const app = express();

  app.use(helmet());
  
  const allowedOrigins = [
    env.FRONTEND_URL,
    'http://localhost:3000',
    'http://localhost:5173'
  ];
  
  app.use(cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.some(allowed => origin.startsWith(allowed))) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }));
  
  app.use(compression());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api', routes);

  app.use(errorHandler);

  logger.info('Express app configured');

  return app;
};

export default createApp;

