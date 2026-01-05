export interface Category {
  name: string;
  words: string[];
  difficulty: string;
  reasoning?: string;
}

export interface PuzzleData {
  id: string;
  words: string[];
  difficulty: string;
  categories: Category[];
  ai_reasoning: string;
}

export interface GameSessionCreateDto {
  puzzle_id: string;
  username?: string;
}

export interface GameSessionUpdateDto {
  completed?: boolean;
  is_won?: boolean;
  attempts?: number;
  correct_groups?: string[][];
  mistakes_remaining?: number;
  completed_at?: Date;
  time_taken?: number;
}

export interface GameSessionDto {
  id: string;
  puzzle_id: string;
  username: string | null;
  completed: boolean;
  is_won: boolean;
  attempts: number;
  correct_groups: string[][];
  mistakes_remaining: number;
  started_at: Date;
  completed_at: Date | null;
  time_taken: number | null;
}

export interface GameSessionWithPuzzle {
  id: string;
  puzzle_id: string;
  username: string | null;
  completed: boolean;
  is_won: boolean;
  attempts: number;
  correct_groups: string[][];
  mistakes_remaining: number;
  started_at: Date;
  completed_at: Date | null;
  time_taken: number | null;
  puzzle: {
    id: string;
    words: any;
    categories: any;
    ai_reasoning: string;
    difficulty: string;
    is_reviewed: boolean;
    times_played: number;
    avg_completion_time: number | null;
    avg_mistakes: number | null;
    created_at: Date;
  };
}

export interface StartGameResponse {
  session_id: string;
  puzzle: PuzzleData;
}

export interface SubmitGuessResponse {
  success: boolean;
  category?: Category;
  is_one_away: boolean;
  is_complete: boolean;
  is_won: boolean;
  mistakes_remaining: number;
}

