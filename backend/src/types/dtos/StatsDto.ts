export interface GameStatDto {
  id: string;
  username: string;
  total_games: number;
  total_wins: number;
  perfect_games: number;
  current_streak: number;
  best_streak: number;
  avg_time_seconds: number | null;
  avg_mistakes: number | null;
  created_at: Date;
  updated_at: Date;
}

export interface GameStatUpdateDto {
  total_games?: number;
  total_wins?: number;
  perfect_games?: number;
  current_streak?: number;
  best_streak?: number;
  avg_time_seconds?: number;
  avg_mistakes?: number;
}

