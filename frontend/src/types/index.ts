export interface Puzzle {
  id: string;
  words: string[];
  categories: Category[];
  ai_reasoning: string;
  difficulty: string;
  is_reviewed: boolean;
}

export interface Category {
  name: string;
  words: string[];
  difficulty: 'easy' | 'medium' | 'tricky' | 'hard';
  reasoning?: string;
}

export interface GameSession {
  session_id: string;
  puzzle: {
    id: string;
    words: string[];
    difficulty: string;
  };
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

