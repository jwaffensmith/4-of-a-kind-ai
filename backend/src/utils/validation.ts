import { z } from 'zod';

export const submitGuessSchema = z.object({
  words: z.array(z.string()).length(4, 'Must submit exactly 4 words'),
});

export const generatePuzzleSchema = z.object({
  difficulty: z.enum(['easy', 'medium', 'hard']),
  count: z.number().min(1).max(50).optional().default(1),
});

export const usernameSchema = z.object({
  username: z.string().min(1).max(50).optional(),
});

