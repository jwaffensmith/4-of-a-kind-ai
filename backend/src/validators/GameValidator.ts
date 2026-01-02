import { z } from 'zod';

export const startGameSchema = z.object({
  puzzle_id: z.string().uuid(),
  username: z.string().optional(),
});

export const submitGuessSchema = z.object({
  session_id: z.string().uuid(),
  selected_words: z.array(z.string()).length(4),
});

