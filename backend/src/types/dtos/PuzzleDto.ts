export interface PuzzleCreateDto {
  words: string[];
  categories: Array<{
    name: string;
    words: string[];
    color: 'yellow' | 'green' | 'blue' | 'purple';
    tier: 'easy' | 'medium' | 'hard' | 'difficult';
    difficulty: 'easy' | 'medium' | 'tricky' | 'hard';
    reasoning?: string;
  }>;
  ai_reasoning: string;
  difficulty: string;
}

export interface PuzzleDto {
  id: string;
  words: string[];
  categories: Array<{
    name: string;
    words: string[];
    difficulty: string;
    color?: string;
    tier?: string;
    reasoning?: string;
  }>;
  ai_reasoning: string;
  difficulty: string;
  is_reviewed: boolean;
  times_played: number;
  avg_completion_time: number | null;
  avg_mistakes: number | null;
  created_at: Date;
}

