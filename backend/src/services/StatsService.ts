import { StatsRepository } from '../repositories/StatsRepository';
import { GameRepository } from '../repositories/GameRepository';
import { NotFoundError } from '../utils/Errors';
import logger from '../utils/Logger';

interface LocalStatsSync {
  username: string;
  total_games: number;
  total_wins: number;
  perfect_games: number;
  current_streak: number;
  best_streak: number;
  avg_time_seconds?: number;
  avg_mistakes?: number;
}

export class StatsService {
  private statsRepo: StatsRepository;
  private gameRepo: GameRepository;

  constructor() {
    this.statsRepo = new StatsRepository();
    this.gameRepo = new GameRepository();
  }

  async getUserStats(username: string) {
    const stats = await this.statsRepo.findByUsername(username);
    if (!stats) {
      throw new NotFoundError('User stats not found');
    }
    return stats;
  }

  async getLeaderboard(limit: number = 10) {
    return await this.statsRepo.findTopPlayers(limit);
  }

  async updateStatsAfterGame(sessionId: string) {
    const session = await this.gameRepo.findById(sessionId);
    if (!session || !session.username) {
      return;
    }

    const stats = await this.statsRepo.findByUsername(session.username);
    const allUserSessions = await this.gameRepo.findByUsername(session.username);

    const totalGames = allUserSessions.length;
    const totalWins = allUserSessions.filter((s) => s.is_won).length;
    const perfectGames = allUserSessions.filter(
      (s) => s.is_won && s.mistakes_remaining === 4
    ).length;

    const currentStreak = this.calculateCurrentStreak(allUserSessions);
    const bestStreak = stats ? Math.max(stats.best_streak, currentStreak) : currentStreak;

    const completedSessions = allUserSessions.filter((s) => s.completed && s.time_taken);
    const avgTimeSeconds = completedSessions.length
      ? completedSessions.reduce((sum, s) => sum + (s.time_taken || 0), 0) / completedSessions.length
      : undefined;

    const avgMistakes = allUserSessions.length
      ? allUserSessions.reduce((sum, s) => sum + (4 - s.mistakes_remaining), 0) / allUserSessions.length
      : undefined;

    await this.statsRepo.upsert(session.username, {
      total_games: totalGames,
      total_wins: totalWins,
      perfect_games: perfectGames,
      current_streak: currentStreak,
      best_streak: bestStreak,
      avg_time_seconds: avgTimeSeconds,
      avg_mistakes: avgMistakes,
    });

    logger.info('User stats updated', { username: session.username });
  }

  async syncLocalStats(data: LocalStatsSync) {
    const existing = await this.statsRepo.findByUsername(data.username);

    if (existing) {
      await this.statsRepo.update(data.username, {
        total_games: Math.max(existing.total_games, data.total_games),
        total_wins: Math.max(existing.total_wins, data.total_wins),
        perfect_games: Math.max(existing.perfect_games, data.perfect_games),
        current_streak: Math.max(existing.current_streak, data.current_streak),
        best_streak: Math.max(existing.best_streak, data.best_streak),
        avg_time_seconds: data.avg_time_seconds,
        avg_mistakes: data.avg_mistakes,
      });
    } else {
      await this.statsRepo.create(data.username);
      await this.statsRepo.update(data.username, {
        total_games: data.total_games,
        total_wins: data.total_wins,
        perfect_games: data.perfect_games,
        current_streak: data.current_streak,
        best_streak: data.best_streak,
        avg_time_seconds: data.avg_time_seconds,
        avg_mistakes: data.avg_mistakes,
      });
    }

    logger.info('Local stats synced to database', { username: data.username });
    return await this.statsRepo.findByUsername(data.username);
  }

  private calculateCurrentStreak(sessions: Array<{ completed: boolean; is_won: boolean; completed_at: Date | null }>): number {
    const sorted = sessions
      .filter((s) => s.completed && s.completed_at)
      .sort((a, b) => (b.completed_at!.getTime() - a.completed_at!.getTime()));

    let streak = 0;
    for (const session of sorted) {
      if (session.is_won) {
        streak++;
      } else {
        break;
      }
    }
    return streak;
  }
}
