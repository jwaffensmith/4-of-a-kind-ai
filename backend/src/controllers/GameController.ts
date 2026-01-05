import { Request, Response, NextFunction } from 'express';
import { GameService } from '../services/GameService';
import { DailyPuzzleRepository } from '../repositories/DailyPuzzleRepository';
import { PuzzleService } from '../services/PuzzleService';

export class GameController {
  private gameService: GameService;
  private dailyPuzzleRepo: DailyPuzzleRepository;
  private puzzleService: PuzzleService;

  constructor() {
    this.gameService = new GameService();
    this.dailyPuzzleRepo = new DailyPuzzleRepository();
    this.puzzleService = new PuzzleService();
  }

  getDailyPuzzle = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dailyPuzzle = await this.dailyPuzzleRepo.findByDate(today);

      if (dailyPuzzle && dailyPuzzle.puzzle) {
        res.json(dailyPuzzle.puzzle);
      } else {
        const randomPuzzle = await this.puzzleService.getRandomApprovedPuzzle();
        res.json(randomPuzzle);
      }
    } catch (error) {
      next(error);
    }
  };

  getRandomPuzzle = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const puzzle = await this.puzzleService.getRandomApprovedPuzzle();
      res.json(puzzle);
    } catch (error) {
      next(error);
    }
  };

  startGame = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { puzzle_id, username } = req.body;
      const result = await this.gameService.startGame(puzzle_id, username);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  submitGuess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { session_id, selected_words } = req.body;
      const result = await this.gameService.submitGuess(session_id, selected_words);
      res.json(result);
    } catch (error) {
      next(error);
    }
  };

  getGameSession = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { sessionId } = req.params;
      const session = await this.gameService.getGameSession(sessionId);
      res.json(session);
    } catch (error) {
      next(error);
    }
  };
}
