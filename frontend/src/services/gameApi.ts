import { fetchApi } from './api';
import type { Puzzle, GameSession, GameResult } from '../types';

export const gameApi = {
  getDailyPuzzle: () => fetchApi<Puzzle>('/api/game/daily'),

  getRandomPuzzle: () => fetchApi<Puzzle>('/api/game/random'),

  startGame: (puzzleId: string, username?: string) =>
    fetchApi<GameSession>('/api/game/start', {
      method: 'POST',
      body: JSON.stringify({ puzzle_id: puzzleId, username }),
    }),

  submitGuess: (sessionId: string, selectedWords: string[]) =>
    fetchApi<GameResult>('/api/game/submit', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId, selected_words: selectedWords }),
    }),

  getGameSession: (sessionId: string) =>
    fetchApi<GameSession>(`/api/game/${sessionId}`),
};

