import { z } from 'zod';

export const loginSchema = z.object({
  password: z.string().min(1),
});

export const approvePuzzleSchema = z.object({
  puzzle_id: z.string().uuid(),
});

export const setDailyPuzzleSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  puzzle_id: z.string().uuid(),
});

export const syncStatsSchema = z.object({
  username: z.string().min(1),
  total_games: z.number().int().min(0),
  total_wins: z.number().int().min(0),
  perfect_games: z.number().int().min(0),
  current_streak: z.number().int().min(0),
  best_streak: z.number().int().min(0),
  avg_time_seconds: z.number().optional(),
  avg_mistakes: z.number().optional(),
});

export const generatePuzzleSchema = z.object({
  targetDifficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

