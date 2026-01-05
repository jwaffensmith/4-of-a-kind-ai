import { Request, Response, NextFunction } from 'express';
import { PuzzleService } from '../services/PuzzleService';
import { DailyPuzzleRepository } from '../repositories/DailyPuzzleRepository';
import prisma from '../config/Database';
import { BadRequestError } from '../utils/Errors';
import logger from '../utils/Logger';

export class AdminController {
  private puzzleService: PuzzleService;
  private dailyPuzzleRepo: DailyPuzzleRepository;

  constructor() {
    this.puzzleService = new PuzzleService();
    this.dailyPuzzleRepo = new DailyPuzzleRepository();
  }

  generatePuzzle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { targetDifficulty } = req.body;
      logger.info('AdminController.generatePuzzle called', { 
        body: req.body, 
        targetDifficulty,
        targetDifficultyType: typeof targetDifficulty 
      });
      const puzzle = await this.puzzleService.generatePuzzle(targetDifficulty);
      
      res.json({
        puzzle,
        remainingQuota: this.puzzleService.getRemainingQuota(),
      });
    } catch (error) {
      next(error);
    }
  };

  getAllPuzzles = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const puzzles = await this.puzzleService.getAllPuzzles();
      res.json(puzzles);
    } catch (error) {
      next(error);
    }
  };

  approvePuzzle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const puzzle = await this.puzzleService.approvePuzzle(id);
      res.json(puzzle);
    } catch (error) {
      next(error);
    }
  };

  rejectPuzzle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      await this.puzzleService.rejectPuzzle(id);
      res.json({ message: 'Puzzle rejected and deleted' });
    } catch (error) {
      next(error);
    }
  };

  setDailyPuzzle = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { date, puzzle_id } = req.body;
      
      const puzzle = await this.puzzleService.getPuzzleById(puzzle_id);
      if (!puzzle.is_reviewed) {
        throw new BadRequestError('Only approved puzzles can be set as daily puzzle');
      }

      const dailyPuzzle = await this.dailyPuzzleRepo.upsert(date, puzzle_id);

      await prisma.adminLog.create({
        data: {
          action: 'set_daily',
          puzzle_id,
          details: { date },
        },
      });

      res.json(dailyPuzzle);
    } catch (error) {
      next(error);
    }
  };

  getAdminStats = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const totalPuzzles = await prisma.puzzle.count();
      const approvedPuzzles = await prisma.puzzle.count({ where: { is_reviewed: true } });
      const pendingPuzzles = totalPuzzles - approvedPuzzles;
      const totalGames = await prisma.gameSession.count();
      const completedGames = await prisma.gameSession.count({ where: { completed: true } });
      const totalPlayers = await prisma.gameStat.count();
      const remainingQuota = this.puzzleService.getRemainingQuota();

      res.json({
        totalPuzzles,
        approvedPuzzles,
        pendingPuzzles,
        totalGames,
        completedGames,
        totalPlayers,
        remainingQuota,
      });
    } catch (error) {
      next(error);
    }
  };

  getAdminLogs = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const limit = parseInt(req.query.limit as string) || 50;
      const logs = await prisma.adminLog.findMany({
        orderBy: { created_at: 'desc' },
        take: limit,
        include: { puzzle: true },
      });
      res.json(logs);
    } catch (error) {
      next(error);
    }
  };

  getQuota = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const remainingQuota = this.puzzleService.getRemainingQuota();
      res.json({ remainingQuota, maxQuota: 100 });
    } catch (error) {
      next(error);
    }
  };
}
