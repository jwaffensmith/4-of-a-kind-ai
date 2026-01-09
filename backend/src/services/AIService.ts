import OpenAI from 'openai';
import env from '../config/Env';
import logger from '../utils/Logger';
import { TooManyRequestsError, InternalServerError } from '../utils/Errors';
import { PuzzleRepository } from '../repositories/PuzzleRepository';
import { validateGeneratedPuzzle } from './PuzzleValidation';

interface PuzzleCategory {
  name: string;
  words: string[];
  color: 'yellow' | 'green' | 'blue' | 'purple';
  tier: 'easy' | 'medium' | 'hard' | 'difficult';
  difficulty: 'easy' | 'medium' | 'tricky' | 'hard';
  reasoning: string;
}

interface GeneratedPuzzle {
  words: string[];
  categories: PuzzleCategory[];
  ai_reasoning: string;
  difficulty: string;
}

type PuzzleCategoryColor = PuzzleCategory['color'];
type PuzzleCategoryTier = PuzzleCategory['tier'];

const COLOR_TO_LEGACY_DIFFICULTY: Record<PuzzleCategoryColor, PuzzleCategory['difficulty']> = {
  yellow: 'easy',
  green: 'medium',
  blue: 'tricky',
  purple: 'hard',
};

export class AIService {
  private client: OpenAI;
  private dailyGenerationCount: number = 0;
  private lastResetDate: string = new Date().toISOString().split('T')[0];
  private readonly MAX_DAILY_GENERATIONS = 100;
  private recentCategories: string[] = [];
  private readonly MAX_RECENT_CATEGORIES = 20;
  private puzzleRepo: PuzzleRepository;
  private readonly RECENT_PUZZLES_FOR_PROMPT = 50;

  constructor() {
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
    this.puzzleRepo = new PuzzleRepository();
  }

  private checkAndResetDailyLimit(): void {
    const today = new Date().toISOString().split('T')[0];
    if (today !== this.lastResetDate) {
      this.dailyGenerationCount = 0;
      this.lastResetDate = today;
      logger.info('Daily puzzle generation limit reset');
    }
  }

  getRemainingGenerations(): number {
    this.checkAndResetDailyLimit();
    return this.MAX_DAILY_GENERATIONS - this.dailyGenerationCount;
  }

  private normalizeWord(word: string): string {
    return word.trim().toUpperCase();
  }

  private getRecentAvoidanceContext(recentPuzzles: Array<{ words: any; categories: any }>): {
    recentCategoryNames: string[];
    recentWords: string[];
  } {
    const categoryNames: string[] = [];
    const words: string[] = [];

    for (const p of recentPuzzles) {
      const pWords = Array.isArray(p.words) ? (p.words as string[]) : [];
      for (const w of pWords) {
        if (typeof w === 'string') words.push(this.normalizeWord(w));
      }

      const cats = Array.isArray(p.categories) ? (p.categories as any[]) : [];
      for (const c of cats) {
        if (c && typeof c.name === 'string') categoryNames.push(String(c.name).trim());
      }
    }

    const seenNames = new Set<string>();
    const uniqueNames: string[] = [];
    for (const n of categoryNames) {
      const key = n.toLowerCase();
      if (seenNames.has(key)) continue;
      seenNames.add(key);
      uniqueNames.push(n);
    }

    const seenWords = new Set<string>();
    const uniqueWords: string[] = [];
    for (const w of words) {
      if (seenWords.has(w)) continue;
      seenWords.add(w);
      uniqueWords.push(w);
    }

    return {
      recentCategoryNames: uniqueNames.slice(0, 60),
      recentWords: uniqueWords.slice(0, 800),
    };
  }

  private normalizeCategoryName(name: string): string {
    return name.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private jaccardSimilarity(a: string, b: string): number {
    const tok = (s: string) =>
      s
        .toLowerCase()
        .split(/[^a-z0-9]+/g)
        .map((t) => t.trim())
        .filter(Boolean);
    const A = new Set(tok(a));
    const B = new Set(tok(b));
    if (A.size === 0 && B.size === 0) return 1;
    if (A.size === 0 || B.size === 0) return 0;
    let inter = 0;
    for (const t of A) if (B.has(t)) inter++;
    const union = A.size + B.size - inter;
    return union === 0 ? 0 : inter / union;
  }

  private async checkForNearDuplicates(words: string[], categories: PuzzleCategory[]): Promise<string[]> {
    const errors: string[] = [];
    const recent = await this.puzzleRepo.findRecent(200);

    const recentWords = new Set<string>();
    const recentCategoryNames: string[] = [];

    for (const p of recent) {
      const pWords = Array.isArray((p as any).words) ? ((p as any).words as string[]) : [];
      for (const w of pWords) recentWords.add(this.normalizeWord(String(w)));

      const cats = Array.isArray((p as any).categories) ? ((p as any).categories as any[]) : [];
      for (const c of cats) {
        if (c && typeof c.name === 'string') recentCategoryNames.push(String(c.name));
      }
    }

    const overlaps = words.filter((w) => recentWords.has(this.normalizeWord(w)));
    if (overlaps.length > 0) {
      errors.push(`Word repeat vs recent puzzles: ${overlaps.slice(0, 12).join(', ')}${overlaps.length > 12 ? '…' : ''}`);
    }

    const SIM_THRESHOLD = 0.6;
    for (const cat of categories) {
      const catName = this.normalizeCategoryName(cat.name);
      for (const prevName of recentCategoryNames) {
        const prevNorm = this.normalizeCategoryName(prevName);
        if (catName === prevNorm) {
          errors.push(`Category theme repeated exactly: "${cat.name}"`);
          break;
        }
        const sim = this.jaccardSimilarity(catName, prevNorm);
        if (sim >= SIM_THRESHOLD) {
          errors.push(`Category theme too similar to recent: "${cat.name}" ~ "${prevName}"`);
          break;
        }
      }
    }

    return errors;
  }

  async generatePuzzle(targetDifficulty?: 'easy' | 'medium' | 'hard'): Promise<GeneratedPuzzle> {
    this.checkAndResetDailyLimit();

    if (this.dailyGenerationCount >= this.MAX_DAILY_GENERATIONS) {
      logger.warn('Daily puzzle generation limit reached');
      throw new TooManyRequestsError(
        `Daily puzzle generation limit of ${this.MAX_DAILY_GENERATIONS} reached. Limit resets at midnight UTC.`
      );
    }

    const systemPrompt = `You generate NYT-Connections-style puzzles.

HARD RULES:
- Output MUST be JSON only (no markdown, no extra text).
- 4 categories, 4 words each, total 16 UNIQUE words.
- Words should be single tokens (no spaces), 3-14 chars, letters only, returned in UPPERCASE.
- Every word should plausibly fit at least 2 categories (misedirection).
- Avoid hyper-obvious groups (e.g. four planets, four colors, four US states) unless made tricky via wordplay.
- Prefer cleverness over trivia; no more than one proper-noun-heavy category, and only for BLUE/PURPLE.

COLOR/TIER (EXACTLY ONE OF EACH PER PUZZLE):
- YELLOW: easiest, tier="easy"
- GREEN: medium, tier="medium"
- BLUE: hard, tier="hard"
- PURPLE: hardest, tier="difficult"

Return JSON with this exact structure:
{
  "categories": [
    {
      "color": "yellow|green|blue|purple",
      "tier": "easy|medium|hard|difficult",
      "name": "Category name",
      "words": ["WORD1","WORD2","WORD3","WORD4"],
      "reasoning": "One sentence"
    }
  ],
  "overall_reasoning": "1-2 sentences on why the puzzle is tricky but fair and varied"
}`;

    try {
      logger.info('Generating puzzle with OpenAI API');

      const varietyPrompts = [
        'Create a puzzle that explores unexpected connections from different knowledge domains.',
        'Generate a puzzle that would surprise someone who has played many word games.',
        'Design a puzzle that showcases creative and diverse category types.',
        'Build a puzzle with categories from completely different areas of human knowledge.',
        'Craft a puzzle where each category feels distinct and memorable.',
      ];
      const randomPrompt = varietyPrompts[Math.floor(Math.random() * varietyPrompts.length)];

      const recentPuzzles = await this.puzzleRepo.findRecent(this.RECENT_PUZZLES_FOR_PROMPT);
      const { recentCategoryNames, recentWords } = this.getRecentAvoidanceContext(
        recentPuzzles.map((p) => ({ words: (p as any).words, categories: (p as any).categories }))
      );

      let avoidanceMessage = '';
      if (recentCategoryNames.length > 0 || recentWords.length > 0) {
        avoidanceMessage = `\n\nAVOID REPEATS:\n- Do NOT reuse any of these recent WORDS:\n${recentWords.join(', ')}\n- Do NOT reuse these category themes or close variants:\n${recentCategoryNames.join(' | ')}`;
      }

      let userPrompt = `Generate a highly original NYT-style Connections puzzle. ${randomPrompt}
Make the four categories clearly different domains AND different connection types (semantic / functional / contextual / wordplay or linguistic).
At least one category must be wordplay/structural (prefix/suffix, homophones, double meanings, spelling patterns).`;
      
      if (targetDifficulty) {
        userPrompt += `\n\nPUZZLE DIFFICULTY TARGET: ${targetDifficulty.toUpperCase()}.
This refers to overall trickiness/misdirection, NOT the color distribution (which must always be one of each color).`;
      }
      
      userPrompt += avoidanceMessage;

      const tryOnce = async (attempt: number) => {
        const response = await this.client.chat.completions.create({
          model: 'gpt-5.1',
          max_completion_tokens: 2000,
          temperature: 1.0,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        });

        const content = response.choices[0].message.content;
        if (!content) {
          throw new InternalServerError('Unexpected response format from OpenAI API');
        }

        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new InternalServerError('Failed to parse JSON from OpenAI response');
        }

        const parsedResponse = JSON.parse(jsonMatch[0]);

        const words: string[] = [];
        const categories: PuzzleCategory[] = parsedResponse.categories.map((cat: {
          color: PuzzleCategoryColor;
          tier: PuzzleCategoryTier;
          name: string;
          words: string[];
          reasoning: string;
        }) => {
          const color = cat.color;
          const tier = cat.tier;
          const normalizedWords = (cat.words || []).map((w) => this.normalizeWord(String(w)));
          words.push(...normalizedWords);
          return {
            color,
            tier,
            name: cat.name,
            words: normalizedWords,
            difficulty: COLOR_TO_LEGACY_DIFFICULTY[color],
            reasoning: cat.reasoning,
          };
        });

        const validationErrors = validateGeneratedPuzzle({
          words,
          categories: categories as any,
        });
        if (validationErrors.length > 0) {
          throw new InternalServerError(
            `Generated puzzle failed validation (attempt ${attempt}): ${validationErrors.join('; ')}`
          );
        }

        const dupErrors = await this.checkForNearDuplicates(words, categories);
        if (dupErrors.length > 0) {
          throw new InternalServerError(
            `Generated puzzle failed anti-repeat checks (attempt ${attempt}): ${dupErrors.join('; ')}`
          );
        }

        return { words, categories, overall_reasoning: parsedResponse.overall_reasoning as string | undefined };
      };

      const MAX_ATTEMPTS = 3;
      let lastError: unknown;
      let generated: Awaited<ReturnType<typeof tryOnce>> | undefined;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        try {
          generated = await tryOnce(attempt);
          break;
        } catch (e) {
          lastError = e;
          logger.warn('Puzzle generation attempt failed; retrying', { attempt, error: e });
        }
      }
      if (!generated) {
        throw lastError instanceof Error
          ? new InternalServerError(lastError.message)
          : new InternalServerError('Failed to generate a valid puzzle after retries');
      }

      // With a fixed NYT-style one-of-each color distribution, category tiers no longer determine puzzle difficulty.
      // Keep the puzzle-level difficulty as the requested target (or default to 'medium').
      const overallDifficulty = targetDifficulty || 'medium';

      const categories = generated.categories;
      const words = generated.words;

      categories.forEach(cat => {
        this.recentCategories.push(cat.name);
      });
      if (this.recentCategories.length > this.MAX_RECENT_CATEGORIES) {
        this.recentCategories = this.recentCategories.slice(-this.MAX_RECENT_CATEGORIES);
      }

      this.dailyGenerationCount++;
      logger.info('Puzzle generated successfully', {
        remainingGenerations: this.getRemainingGenerations(),
        recentCategoriesCount: this.recentCategories.length,
        targetDifficulty: targetDifficulty || 'auto',
        finalDifficulty: overallDifficulty,
      });

      return {
        words,
        categories,
        ai_reasoning: generated.overall_reasoning || 'AI-generated puzzle with diverse categories.',
        difficulty: overallDifficulty,
      };
    } catch (error) {
      if (error instanceof TooManyRequestsError || error instanceof InternalServerError) {
        throw error;
      }
      logger.error('Failed to generate puzzle', { error });
      throw new InternalServerError('Failed to generate puzzle. Please try again.');
    }
  }
}
