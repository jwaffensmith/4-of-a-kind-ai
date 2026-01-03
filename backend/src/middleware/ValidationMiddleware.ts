import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { BadRequestError } from '../utils/Errors';
import logger from '../utils/Logger';

export const validate = (schema: ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      logger.info('Validating request', { path: req.path, body: req.body });
      schema.parse(req.body);
      next();
    } catch (error) {
      logger.error('Validation failed', { path: req.path, body: req.body, error });
      next(new BadRequestError('Invalid request data'));
    }
  };
};

