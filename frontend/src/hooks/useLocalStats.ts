import { useState, useEffect } from 'react';
import type { UserStats } from '../types';

interface LocalGameSession {
  puzzleId: string;
  isWon: boolean;
  mistakeCount: number;
  timeTaken: number;
  completedAt: string;
}

interface LocalStats {
  sessions: LocalGameSession[];
  totalGames: number;
  totalWins: number;
  perfectGames: number;
  currentStreak: number;
  bestStreak: number;
  lastPlayed: string;
}

const STORAGE_KEY = 'connections_local_stats';

const getDefaultStats = (): LocalStats => ({
  sessions: [],
  totalGames: 0,
  totalWins: 0,
  perfectGames: 0,
  currentStreak: 0,
  bestStreak: 0,
  lastPlayed: '',
});

export const useLocalStats = () => {
  const [stats, setStats] = useState<LocalStats>(getDefaultStats);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setStats(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load local stats:', error);
    }
  };

  const saveStats = (newStats: LocalStats) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newStats));
      setStats(newStats);
    } catch (error) {
      console.error('Failed to save local stats:', error);
    }
  };

  const addGameSession = (
    puzzleId: string,
    isWon: boolean,
    mistakeCount: number,
    timeTaken: number
  ) => {
    const session: LocalGameSession = {
      puzzleId,
      isWon,
      mistakeCount,
      timeTaken,
      completedAt: new Date().toISOString(),
    };

    const newSessions = [session, ...stats.sessions];
    const totalGames = newSessions.length;
    const totalWins = newSessions.filter((s) => s.isWon).length;
    const perfectGames = newSessions.filter((s) => s.isWon && s.mistakeCount === 0).length;

    let currentStreak = 0;
    for (const s of newSessions) {
      if (s.isWon) {
        currentStreak++;
      } else {
        break;
      }
    }

    const bestStreak = Math.max(stats.bestStreak, currentStreak);

    const newStats: LocalStats = {
      sessions: newSessions,
      totalGames,
      totalWins,
      perfectGames,
      currentStreak,
      bestStreak,
      lastPlayed: new Date().toISOString(),
    };

    saveStats(newStats);
  };

  const getStatsForSync = (): Partial<UserStats> => {
    const avgTimeSeconds =
      stats.sessions.length > 0
        ? stats.sessions.reduce((sum, s) => sum + s.timeTaken, 0) / stats.sessions.length
        : undefined;

    const avgMistakes =
      stats.sessions.length > 0
        ? stats.sessions.reduce((sum, s) => sum + s.mistakeCount, 0) / stats.sessions.length
        : undefined;

    return {
      total_games: stats.totalGames,
      total_wins: stats.totalWins,
      perfect_games: stats.perfectGames,
      current_streak: stats.currentStreak,
      best_streak: stats.bestStreak,
      avg_time_seconds: avgTimeSeconds,
      avg_mistakes: avgMistakes,
    };
  };

  const clearStats = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setStats(getDefaultStats());
    } catch (error) {
      console.error('Failed to clear local stats:', error);
    }
  };

  return {
    stats,
    addGameSession,
    getStatsForSync,
    clearStats,
  };
};

