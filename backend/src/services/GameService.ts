import { GameRepository } from '../repositories/GameRepository';
import { PuzzleRepository } from '../repositories/PuzzleRepository';
import { NotFoundError, BadRequestError } from '../utils/Errors';
import logger from '../utils/Logger';

export class GameService {
  private gameRepo: GameRepository;
  private puzzleRepo: PuzzleRepository;

  constructor() {
    this.gameRepo = new GameRepository();
    this.puzzleRepo = new PuzzleRepository();
  }

  async startGame(puzzleId: string, username?: string) {
    const puzzle = await this.puzzleRepo.findById(puzzleId);
    if (!puzzle) {
      throw new NotFoundError('Puzzle not found');
    }

    if (!puzzle.is_reviewed) {
      throw new BadRequestError('This puzzle has not been approved yet');
    }

    const session = await this.gameRepo.create({
      puzzle_id: puzzleId,
      username,
    });

    logger.info('Game session started', { sessionId: session.id, puzzleId });

    return {
      session_id: session.id,
      puzzle: {
        id: puzzle.id,
        words: puzzle.words,
        difficulty: puzzle.difficulty,
      },
    };
  }

  async submitGuess(sessionId: string, selectedWords: string[]) {
    const session = await this.gameRepo.findById(sessionId);
    if (!session || !session.puzzle) {
      throw new NotFoundError('Game session not found');
    }

    if (session.completed) {
      throw new BadRequestError('Game session already completed');
    }

    if (selectedWords.length !== 4) {
      throw new BadRequestError('Must select exactly 4 words');
    }

    const puzzle = session.puzzle;
    const categories = puzzle.categories as Array<{
      name: string;
      words: string[];
      difficulty: string;
    }>;

    const correctGroup = categories.find((cat) =>
      cat.words.every((word) => selectedWords.includes(word))
    );

    const correctGroups = session.correct_groups as string[][];
    const isOneAway = this.checkOneAway(selectedWords, categories, correctGroups);

    if (correctGroup) {
      const updatedGroups = [...correctGroups, selectedWords];
      const isComplete = updatedGroups.length === 4;
      const completedAt = isComplete ? new Date() : undefined;
      const timeTaken = isComplete
        ? Math.floor((Date.now() - session.started_at.getTime()) / 1000)
        : undefined;

      await this.gameRepo.update(sessionId, {
        correct_groups: updatedGroups,
        attempts: session.attempts + 1,
        completed: isComplete,
        is_won: isComplete,
        completed_at: completedAt,
        time_taken: timeTaken,
      });

      logger.info('Correct group found', { sessionId, groupName: correctGroup.name });

      return {
        success: true,
        category: correctGroup,
        is_complete: isComplete,
        is_won: isComplete,
        mistakes_remaining: session.mistakes_remaining,
      };
    } else {
      const newMistakes = session.mistakes_remaining - 1;
      const isGameOver = newMistakes === 0;
      const completedAt = isGameOver ? new Date() : undefined;

      await this.gameRepo.update(sessionId, {
        attempts: session.attempts + 1,
        mistakes_remaining: newMistakes,
        completed: isGameOver,
        is_won: false,
        completed_at: completedAt,
      });

      logger.info('Incorrect guess', { sessionId, mistakesRemaining: newMistakes });

      return {
        success: false,
        is_one_away: isOneAway,
        is_complete: isGameOver,
        is_won: false,
        mistakes_remaining: newMistakes,
      };
    }
  }

  async getGameSession(sessionId: string) {
    const session = await this.gameRepo.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Game session not found');
    }
    return session;
  }

  private checkOneAway(
    selectedWords: string[],
    categories: Array<{ words: string[] }>,
    correctGroups: string[][]
  ): boolean {
    const remainingCategories = categories.filter(
      (cat) => !correctGroups.some((group) => group.every((word) => cat.words.includes(word)))
    );

    return remainingCategories.some((cat) => {
      const matches = selectedWords.filter((word) => cat.words.includes(word));
      return matches.length === 3;
    });
  }
}
