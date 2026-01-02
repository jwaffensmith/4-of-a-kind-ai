import { PuzzleRepository } from '../repositories/PuzzleRepository';
import { AIService } from './AIService';
import prisma from '../config/Database';
import logger from '../utils/Logger';
import { NotFoundError } from '../utils/Errors';

export class PuzzleService {
  private puzzleRepo: PuzzleRepository;
  private aiService: AIService;

  constructor() {
    this.puzzleRepo = new PuzzleRepository();
    this.aiService = new AIService();
  }

  async generatePuzzle() {
    const generated = await this.aiService.generatePuzzle();

    const puzzle = await this.puzzleRepo.create({
      words: generated.words,
      categories: generated.categories,
      ai_reasoning: generated.ai_reasoning,
      difficulty: generated.difficulty,
    });

    await prisma.adminLog.create({
      data: {
        action: 'generate',
        puzzle_id: puzzle.id,
        details: {
          difficulty: puzzle.difficulty,
          remainingQuota: this.aiService.getRemainingGenerations(),
        },
      },
    });

    logger.info('Puzzle generated and logged', { puzzleId: puzzle.id });
    return puzzle;
  }

  async approvePuzzle(id: string) {
    const puzzle = await this.puzzleRepo.findById(id);
    if (!puzzle) {
      throw new NotFoundError('Puzzle not found');
    }

    const updated = await this.puzzleRepo.updateReviewStatus(id, true);

    await prisma.adminLog.create({
      data: {
        action: 'approve',
        puzzle_id: id,
        details: { previousStatus: puzzle.is_reviewed },
      },
    });

    logger.info('Puzzle approved', { puzzleId: id });
    return updated;
  }

  async rejectPuzzle(id: string) {
    const puzzle = await this.puzzleRepo.findById(id);
    if (!puzzle) {
      throw new NotFoundError('Puzzle not found');
    }

    await prisma.adminLog.create({
      data: {
        action: 'reject',
        puzzle_id: id,
        details: { difficulty: puzzle.difficulty },
      },
    });

    await this.puzzleRepo.delete(id);

    logger.info('Puzzle rejected and deleted', { puzzleId: id });
  }

  async getAllPuzzles() {
    return await this.puzzleRepo.findAll();
  }

  async getApprovedPuzzles() {
    return await this.puzzleRepo.findAllReviewed();
  }

  async getPuzzleById(id: string) {
    const puzzle = await this.puzzleRepo.findById(id);
    if (!puzzle) {
      throw new NotFoundError('Puzzle not found');
    }
    return puzzle;
  }

  async getRandomApprovedPuzzle() {
    const puzzle = await this.puzzleRepo.findRandomReviewed();
    if (!puzzle) {
      throw new NotFoundError('No approved puzzles available');
    }
    return puzzle;
  }

  getRemainingQuota() {
    return this.aiService.getRemainingGenerations();
  }
}
