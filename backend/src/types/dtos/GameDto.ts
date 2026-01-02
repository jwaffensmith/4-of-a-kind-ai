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

