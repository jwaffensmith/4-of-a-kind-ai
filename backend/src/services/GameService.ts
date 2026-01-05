import { GameRepository } from '../repositories/GameRepository';
import { PuzzleRepository } from '../repositories/PuzzleRepository';
import { NotFoundError, BadRequestError } from '../utils/Errors';
import logger from '../utils/Logger';
import prisma from '../config/Database';
import type { Prisma } from '@prisma/client';
import type {
  Category,
  StartGameResponse,
  SubmitGuessResponse,
  GameSessionWithPuzzle,
  GameSessionUpdateDto,
} from '../types/dtos/GameDto';

export class GameService {
  private static readonly WORDS_PER_GROUP = 4;
  private static readonly TOTAL_GROUPS = 4;
  private static readonly INITIAL_MISTAKES = 4;
  
  private gameRepo: GameRepository;
  private puzzleRepo: PuzzleRepository;

  constructor() {
    this.gameRepo = new GameRepository();
    this.puzzleRepo = new PuzzleRepository();
  }

  private normalizeWord(word: string): string {
    return word.toUpperCase().trim();
  }

  private normalizeWords(words: string[]): string[] {
    return words.map(w => this.normalizeWord(w));
  }

  private arraysMatch(arr1: string[], arr2: string[]): boolean {
    if (arr1.length !== arr2.length) return false;
    return arr1.every(item => arr2.includes(item)) && 
      arr2.every(item => arr1.includes(item));
  }

  async startGame(puzzleId: string, username?: string): Promise<StartGameResponse> {
    if (!puzzleId || typeof puzzleId !== 'string') {
      throw new BadRequestError('Invalid puzzle ID provided');
    }

    const puzzle = await this.puzzleRepo.findById(puzzleId);
    if (!puzzle) {
      throw new NotFoundError(`Puzzle with ID ${puzzleId} not found`);
    }

    if (!puzzle.is_reviewed) {
      throw new BadRequestError('This puzzle has not been approved yet. Please select a different puzzle.');
    }

    const categories = puzzle.categories as Category[];
    if (!Array.isArray(categories) || categories.length !== GameService.TOTAL_GROUPS) {
      throw new BadRequestError('Invalid puzzle structure: must have exactly 4 categories');
    }

    const session = await this.gameRepo.create({
      puzzle_id: puzzleId,
      username: username?.trim(),
    });

    logger.info('Game session started', { 
      sessionId: session.id, 
      puzzleId, 
      username: username || 'anonymous' 
    });

    return {
      session_id: session.id,
      puzzle: {
        id: puzzle.id,
        words: puzzle.words as string[],
        difficulty: puzzle.difficulty,
        categories,
        ai_reasoning: puzzle.ai_reasoning,
      },
    };
  }

  async submitGuess(sessionId: string, selectedWords: string[]): Promise<SubmitGuessResponse> {
    if (!sessionId || typeof sessionId !== 'string') {
      throw new BadRequestError('Invalid session ID provided');
    }

    if (!Array.isArray(selectedWords)) {
      throw new BadRequestError('Selected words must be an array');
    }

    if (selectedWords.length !== GameService.WORDS_PER_GROUP) {
      throw new BadRequestError(
        `Must select exactly ${GameService.WORDS_PER_GROUP} words. You selected ${selectedWords.length}.`
      );
    }

    const session = await this.gameRepo.findById(sessionId);
    if (!session || !session.puzzle) {
      throw new NotFoundError(`Game session with ID ${sessionId} not found`);
    }

    if (session.completed) {
      throw new BadRequestError(
        `Game session already completed at ${session.completed_at?.toISOString()}`
      );
    }

    const typedSession = session as GameSessionWithPuzzle;
    const categories = typedSession.puzzle.categories as Category[];
    const correctGroups = typedSession.correct_groups as string[][];
    const normalizedSelected = this.normalizeWords(selectedWords);

    const puzzleWords = typedSession.puzzle.words as string[];
    const normalizedPuzzleWords = this.normalizeWords(puzzleWords);
    const invalidWords = normalizedSelected.filter(w => !normalizedPuzzleWords.includes(w));
    
    if (invalidWords.length > 0) {
      throw new BadRequestError(
        `Invalid words selected: ${invalidWords.join(', ')}. These words are not in the puzzle.`
      );
    }

    const correctGroup = this.findMatchingCategory(normalizedSelected, categories);
    const isOneAway = !correctGroup && this.checkOneAway(normalizedSelected, categories, correctGroups);

    if (correctGroup) {
      return await this.handleCorrectGuess(sessionId, typedSession, selectedWords, correctGroup);
    } else {
      return await this.handleIncorrectGuess(sessionId, typedSession, isOneAway);
    }
  }

  private findMatchingCategory(normalizedSelected: string[], categories: Category[]): Category | undefined {
    return categories.find((cat) => {
      const normalizedCategory = this.normalizeWords(cat.words);
      return normalizedCategory.length === GameService.WORDS_PER_GROUP &&
        this.arraysMatch(normalizedSelected, normalizedCategory);
    });
  }

  private async handleCorrectGuess(
    sessionId: string,
    session: GameSessionWithPuzzle,
    selectedWords: string[],
    correctGroup: Category
  ): Promise<SubmitGuessResponse> {
    const correctGroups = session.correct_groups as string[][];
    const updatedGroups = [...correctGroups, selectedWords];
    const isComplete = updatedGroups.length === GameService.TOTAL_GROUPS;
    
    const updateData: GameSessionUpdateDto = {
      correct_groups: updatedGroups,
      attempts: session.attempts + 1,
      completed: isComplete,
      is_won: isComplete,
    };

    if (isComplete) {
      const completedAt = new Date();
      const timeTaken = Math.floor((completedAt.getTime() - session.started_at.getTime()) / 1000);
      
      updateData.completed_at = completedAt;
      updateData.time_taken = timeTaken;

      await this.updateStatsOnCompletion(session, timeTaken);
    }

    await this.gameRepo.update(sessionId, updateData);
    
    logger.info('Correct group found', { 
      sessionId, 
      groupName: correctGroup.name, 
      isComplete,
      groupsFound: updatedGroups.length 
    });

    return {
      success: true,
      category: correctGroup,
      is_one_away: false,
      is_complete: isComplete,
      is_won: isComplete,
      mistakes_remaining: session.mistakes_remaining,
    };
  }

  private async handleIncorrectGuess(
    sessionId: string, 
    session: GameSessionWithPuzzle, 
    isOneAway: boolean
  ): Promise<SubmitGuessResponse> {
    const newMistakes = session.mistakes_remaining - 1;
    const isGameOver = newMistakes === 0;

    const updateData: GameSessionUpdateDto = {
      attempts: session.attempts + 1,
      mistakes_remaining: newMistakes,
      completed: isGameOver,
      is_won: false,
    };

    if (isGameOver) {
      const completedAt = new Date();
      const timeTaken = Math.floor((completedAt.getTime() - session.started_at.getTime()) / 1000);
      
      updateData.completed_at = completedAt;
      updateData.time_taken = timeTaken;

      await this.updateStatsOnCompletion(session, timeTaken);
    }

    await this.gameRepo.update(sessionId, updateData);
    
    logger.info('Incorrect guess', { 
      sessionId, 
      mistakesRemaining: newMistakes, 
      isOneAway,
      isGameOver 
    });

    return {
      success: false,
      is_one_away: isOneAway,
      is_complete: isGameOver,
      is_won: false,
      mistakes_remaining: newMistakes,
    };
  }

  async getGameSession(sessionId: string): Promise<GameSessionWithPuzzle> {
    if (!sessionId || typeof sessionId !== 'string') {
      throw new BadRequestError('Invalid session ID provided');
    }

    const session = await this.gameRepo.findById(sessionId);
    if (!session) {
      throw new NotFoundError(`Game session with ID ${sessionId} not found`);
    }

    return session as GameSessionWithPuzzle;
  }

  /**
   * Updates puzzle and player stats when a game completes
   * This runs in a transaction to ensure data consistency
   * Stats are for admin analytics only - frontend uses session storage
   */
  private async updateStatsOnCompletion(
    session: GameSessionWithPuzzle,
    timeTaken: number
  ): Promise<void> {
    try {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const puzzleId = session.puzzle_id;
        const currentTimesPlayed = session.puzzle.times_played || 0;
        const currentAvgTime = session.puzzle.avg_completion_time || 0;
        const currentAvgMistakes = session.puzzle.avg_mistakes || 0;

        const mistakesMade = GameService.INITIAL_MISTAKES - session.mistakes_remaining;
        const newTimesPlayed = currentTimesPlayed + 1;
   
        const newAvgTime = Math.round(
          (currentAvgTime * currentTimesPlayed + timeTaken) / newTimesPlayed
        );
        const newAvgMistakes = 
          (currentAvgMistakes * currentTimesPlayed + mistakesMade) / newTimesPlayed;

        await tx.puzzle.update({
          where: { id: puzzleId },
          data: {
            times_played: newTimesPlayed,
            avg_completion_time: newAvgTime,
            avg_mistakes: newAvgMistakes,
          },
        });

        if (session.username) {
          const currentStats = await tx.gameStat.findUnique({
            where: { username: session.username },
          });

          const isWin = session.is_won;
          const isPerfect = isWin && mistakesMade === 0;

          const newTotalGames = (currentStats?.total_games || 0) + 1;
          const newTotalWins = (currentStats?.total_wins || 0) + (isWin ? 1 : 0);
          const newPerfectGames = (currentStats?.perfect_games || 0) + (isPerfect ? 1 : 0);
          
          let newStreak = 0;
          if (isWin) {
            newStreak = (currentStats?.current_streak || 0) + 1;
          }
          const newBestStreak = Math.max(
            currentStats?.best_streak || 0,
            newStreak
          );

          const currentAvgTimePlayer = currentStats?.avg_time_seconds || 0;
          const currentAvgMistakesPlayer = currentStats?.avg_mistakes || 0;
          const prevGamesCount = currentStats?.total_games || 0;
          
          const newAvgTimePlayer = 
            (currentAvgTimePlayer * prevGamesCount + timeTaken) / newTotalGames;
          const newAvgMistakesPlayer =
            (currentAvgMistakesPlayer * prevGamesCount + mistakesMade) / newTotalGames;

          await tx.gameStat.upsert({
            where: { username: session.username },
            update: {
              total_games: newTotalGames,
              total_wins: newTotalWins,
              perfect_games: newPerfectGames,
              current_streak: newStreak,
              best_streak: newBestStreak,
              avg_time_seconds: newAvgTimePlayer,
              avg_mistakes: newAvgMistakesPlayer,
            },
            create: {
              username: session.username,
              total_games: 1,
              total_wins: isWin ? 1 : 0,
              perfect_games: isPerfect ? 1 : 0,
              current_streak: isWin ? 1 : 0,
              best_streak: isWin ? 1 : 0,
              avg_time_seconds: timeTaken,
              avg_mistakes: mistakesMade,
            },
          });
        }
      });

      logger.info('Stats updated successfully', {
        sessionId: session.id,
        puzzleId: session.puzzle_id,
        username: session.username || 'anonymous',
      });
    } catch (error) {
      logger.error('Failed to update stats', {
        error,
        sessionId: session.id,
        puzzleId: session.puzzle_id,
      });
    }
  }

  private checkOneAway(
    normalizedSelectedWords: string[],
    categories: Category[],
    correctGroups: string[][]
  ): boolean {
    const remainingCategories = this.getRemainingCategories(categories, correctGroups);

    return remainingCategories.some((cat) => {
      const normalizedCategory = this.normalizeWords(cat.words);
      const matchCount = normalizedSelectedWords.filter(word => 
        normalizedCategory.includes(word)
      ).length;
      return matchCount === GameService.WORDS_PER_GROUP - 1;
    });
  }

  private getRemainingCategories(categories: Category[], correctGroups: string[][]): Category[] {
    return categories.filter(cat => {
      const normalizedCategoryWords = this.normalizeWords(cat.words);
      return !correctGroups.some(group => {
        const normalizedGroup = this.normalizeWords(group);
        return this.arraysMatch(normalizedCategoryWords, normalizedGroup);
      });
    });
  }
}
