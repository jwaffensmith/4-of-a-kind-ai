import { Request, Response, NextFunction } from 'express';
import { StatsService } from '../services/StatsService';

export class StatsController {
  private statsService: StatsService;

  constructor() {
    this.statsService = new StatsService();
  }

  getUserStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { username } = req.params;
      const stats = await this.statsService.getUserStats(username);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };

  getLeaderboard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const leaderboard = await this.statsService.getLeaderboard(limit);
      res.json(leaderboard);
    } catch (error) {
      next(error);
    }
  };

  syncLocalStats = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const syncData = req.body;
      const stats = await this.statsService.syncLocalStats(syncData);
      res.json(stats);
    } catch (error) {
      next(error);
    }
  };
}

