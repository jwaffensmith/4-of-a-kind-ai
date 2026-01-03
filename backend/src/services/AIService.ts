import Anthropic from '@anthropic-ai/sdk';
import env from '../config/Env';
import logger from '../utils/Logger';
import { TooManyRequestsError, InternalServerError } from '../utils/Errors';

interface PuzzleCategory {
  name: string;
  words: string[];
  difficulty: 'easy' | 'medium' | 'tricky' | 'hard';
  reasoning: string;
}

interface GeneratedPuzzle {
  words: string[];
  categories: PuzzleCategory[];
  ai_reasoning: string;
  difficulty: string;
}

export class AIService {
  private client: Anthropic;
  private dailyGenerationCount: number = 0;
  private lastResetDate: string = new Date().toISOString().split('T')[0];
  private readonly MAX_DAILY_GENERATIONS = 100;

  constructor() {
    this.client = new Anthropic({
      apiKey: env.CLAUDE_API_KEY,
    });
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

  async generatePuzzle(): Promise<GeneratedPuzzle> {
    this.checkAndResetDailyLimit();

    if (this.dailyGenerationCount >= this.MAX_DAILY_GENERATIONS) {
      logger.warn('Daily puzzle generation limit reached');
      throw new TooManyRequestsError(
        `Daily puzzle generation limit of ${this.MAX_DAILY_GENERATIONS} reached. Limit resets at midnight UTC.`
      );
    }

    const systemPrompt = `You are a puzzle generator creating word connection puzzles. Each puzzle has:
- 16 words divided into 4 hidden groups of 4 words each
- Each group shares a specific connection or theme
- 4 difficulty levels: Easy, Medium, Tricky, Hard

CRITICAL REQUIREMENTS:
1. MAXIMIZE DIVERSITY: The 4 categories in each puzzle MUST span different thematic domains and connection types. Never create puzzles where all categories are similar (e.g., all animals, all food-related, all colors).

2. VARY CONNECTION TYPES: Mix different connection types:
   - Semantic (types/categories)
   - Functional (purpose/use)
   - Contextual (where found/when used)
   - Structural (word patterns)
   - Cultural (references)
   - Linguistic (wordplay)

3. GOOD DIVERSITY EXAMPLE:
   - Easy: Types of fish (semantic)
   - Medium: Things you plug in (functional)
   - Tricky: Netflix shows (cultural)
   - Hard: Words that can follow "fire" (structural)

4. BAD EXAMPLE (avoid):
   - Easy: Types of birds (all nature)
   - Medium: Types of trees
   - Tricky: Types of flowers
   - Hard: Types of fish

5. Each puzzle should feel distinct from previous ones
6. Words should have potential ambiguity (could fit multiple categories)
7. Provide clear, insightful reasoning for each category connection

Return your response as valid JSON with this exact structure:
{
  "categories": [
    {
      "name": "Category name",
      "words": ["WORD1", "WORD2", "WORD3", "WORD4"],
      "difficulty": "easy|medium|tricky|hard",
      "reasoning": "Brief explanation of the connection"
    }
  ],
  "overall_reasoning": "Explanation of how this puzzle achieves diversity across domains and connection types"
}`;

    try {
      logger.info('Generating puzzle with Claude API');

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: 'Generate a new word connections puzzle with maximum category diversity. Ensure the 4 categories span different domains and use different connection types.',
          },
        ],
        system: systemPrompt,
      });

      const content = response.content[0];
      if (content.type !== 'text') {
        throw new InternalServerError('Unexpected response format from Claude API');
      }

      const jsonMatch = content.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new InternalServerError('Failed to parse JSON from Claude response');
      }

      const parsedResponse = JSON.parse(jsonMatch[0]);

      const words: string[] = [];
      const categories: PuzzleCategory[] = parsedResponse.categories.map((cat: {
        name: string;
        words: string[];
        difficulty: 'easy' | 'medium' | 'tricky' | 'hard';
        reasoning: string;
      }) => {
        words.push(...cat.words);
        return {
          name: cat.name,
          words: cat.words,
          difficulty: cat.difficulty,
          reasoning: cat.reasoning,
        };
      });

      if (words.length !== 16) {
        throw new InternalServerError('Generated puzzle does not have exactly 16 words');
      }

      const overallDifficulty = this.calculateOverallDifficulty(categories);

      this.dailyGenerationCount++;
      logger.info('Puzzle generated successfully', {
        remainingGenerations: this.getRemainingGenerations(),
      });

      return {
        words,
        categories,
        ai_reasoning: parsedResponse.overall_reasoning || 'AI-generated puzzle with diverse categories.',
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

  private calculateOverallDifficulty(categories: PuzzleCategory[]): string {
    const difficultyScores = {
      easy: 1,
      medium: 2,
      tricky: 3,
      hard: 4,
    };

    const avgScore =
      categories.reduce((sum, cat) => sum + difficultyScores[cat.difficulty], 0) / categories.length;

    if (avgScore <= 1.5) return 'easy';
    if (avgScore <= 2.5) return 'medium';
    if (avgScore <= 3.5) return 'tricky';
    return 'hard';
  }
}


