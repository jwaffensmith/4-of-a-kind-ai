export interface Puzzle {
  id: string;
  words: string[];
  categories: Category[];
  ai_reasoning: string;
  difficulty: string;
  is_reviewed: boolean;
  times_played: number;
  avg_completion_time?: number | null;
  avg_mistakes?: number | null;
  created_at: string;
}

export interface GamePuzzle {
  id: string;
  words: string[];
  categories: Category[];
  ai_reasoning: string;
  difficulty: string;
}

export interface Category {
  name: string;
  words: string[];
  color?: 'yellow' | 'green' | 'blue' | 'purple';
  tier?: 'easy' | 'medium' | 'hard' | 'difficult';
  difficulty?: 'easy' | 'medium' | 'tricky' | 'hard';
  reasoning?: string;
}

export interface GameSession {
  session_id: string;
  puzzle: GamePuzzle;
}

export interface GameResult {
  success: boolean;
  category?: Category;
  is_one_away?: boolean;
  is_complete: boolean;
  is_won: boolean;
  mistakes_remaining: number;
}

export interface UserStats {
  username: string;
  total_games: number;
  total_wins: number;
  perfect_games: number;
  current_streak: number;
  best_streak: number;
  avg_time_seconds: number | null;
  avg_mistakes: number | null;
}

export interface AdminStats {
  totalPuzzles: number;
  approvedPuzzles: number;
  pendingPuzzles: number;
  totalGames: number;
  completedGames: number;
  totalPlayers: number;
  remainingQuota: number;
}

