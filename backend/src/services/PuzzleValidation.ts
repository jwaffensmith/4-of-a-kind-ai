import { InternalServerError } from '../utils/Errors';

export type PuzzleColor = 'yellow' | 'green' | 'blue' | 'purple';
export type PuzzleTier = 'easy' | 'medium' | 'hard' | 'difficult';

export interface GeneratedCategory {
  name: string;
  words: string[];
  color: PuzzleColor;
  tier: PuzzleTier;
  reasoning?: string;
}

export interface GeneratedPuzzleLike {
  words: string[];
  categories: GeneratedCategory[];
}

const COLOR_TO_TIER: Record<PuzzleColor, PuzzleTier> = {
  yellow: 'easy',
  green: 'medium',
  blue: 'hard',
  purple: 'difficult',
};

function normalizeWord(word: string): string {
  return word.trim().toUpperCase();
}

export function validateGeneratedPuzzle(puzzle: GeneratedPuzzleLike): string[] {
  const errors: string[] = [];

  if (!puzzle || typeof puzzle !== 'object') {
    return ['Puzzle is not an object'];
  }

  if (!Array.isArray(puzzle.categories) || puzzle.categories.length !== 4) {
    errors.push('Must have exactly 4 categories');
    return errors;
  }

  const colors = puzzle.categories.map((c) => c?.color).filter(Boolean) as PuzzleColor[];
  const colorSet = new Set(colors);
  const requiredColors: PuzzleColor[] = ['yellow', 'green', 'blue', 'purple'];
  for (const c of requiredColors) {
    if (!colorSet.has(c)) errors.push(`Missing category color: ${c}`);
  }
  if (colorSet.size !== 4) errors.push('Category colors must be unique (yellow/green/blue/purple exactly once)');

  const allWords: string[] = [];
  for (const cat of puzzle.categories) {
    if (!cat || typeof cat !== 'object') {
      errors.push('Category is not an object');
      continue;
    }
    if (!cat.name || typeof cat.name !== 'string') {
      errors.push('Category is missing a valid name');
    }
    if (!Array.isArray(cat.words) || cat.words.length !== 4) {
      errors.push(`Category "${cat?.name || 'unknown'}" must have exactly 4 words`);
      continue;
    }
    const normalized = cat.words.map((w) => normalizeWord(String(w)));
    const unique = new Set(normalized);
    if (unique.size !== 4) errors.push(`Category "${cat.name}" has duplicate words`);
    allWords.push(...normalized);

    if (!cat.color || !(cat.color in COLOR_TO_TIER)) {
      errors.push(`Category "${cat?.name || 'unknown'}" has invalid color`);
    } else {
      const expectedTier = COLOR_TO_TIER[cat.color];
      if (cat.tier !== expectedTier) {
        errors.push(
          `Category "${cat.name}" tier/color mismatch: color=${cat.color} requires tier=${expectedTier}`
        );
      }
    }
  }

  if (allWords.length !== 16) errors.push('Puzzle must contain exactly 16 words (4 categories x 4 words)');
  const allUnique = new Set(allWords);
  if (allUnique.size !== 16) errors.push('Puzzle words must be globally unique across categories');

  if (Array.isArray(puzzle.words)) {
    const normalizedPuzzleWords = puzzle.words.map((w) => normalizeWord(String(w)));
    if (normalizedPuzzleWords.length !== 16) {
      errors.push('Puzzle.words must have length 16');
    } else {
      const setA = new Set(normalizedPuzzleWords);
      const setB = new Set(allWords);
      if (setA.size !== 16) errors.push('Puzzle.words must be unique');
      for (const w of setB) {
        if (!setA.has(w)) errors.push(`Puzzle.words missing word from categories: ${w}`);
      }
      for (const w of setA) {
        if (!setB.has(w)) errors.push(`Puzzle.words contains extra word not in categories: ${w}`);
      }
    }
  }

  return errors;
}

export function assertValidGeneratedPuzzle(puzzle: GeneratedPuzzleLike): void {
  const errors = validateGeneratedPuzzle(puzzle);
  if (errors.length > 0) {
    throw new InternalServerError(`Generated puzzle failed validation: ${errors.join('; ')}`);
  }
}


