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
  private recentCategories: string[] = [];
  private readonly MAX_RECENT_CATEGORIES = 20;

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

1. PRIORITIZE VARIETY AND ROTATION:
   - Imagine you're generating one of many puzzles in a series
   - Actively vary your category choices to create a diverse collection
   - Don't default to the easiest or most obvious connections
   - Push yourself to explore different corners of knowledge and culture
   - Each category should make solvers think "Oh, that's clever!" when revealed

2. MAXIMIZE DIVERSITY ACROSS DOMAINS:
   The 4 categories MUST span completely different thematic domains:
   - NEVER use similar domains (e.g., all nature, all household, all actions, all descriptors)
   - Mix abstract and concrete concepts
   - Combine different fields: science, arts, history, pop culture, language, geography, etc.

3. VARY CONNECTION TYPES (use all 4 different types per puzzle):
   - Semantic (categories/classifications)
   - Functional (what they do/how they're used)
   - Contextual (where/when found)
   - Structural (word patterns/wordplay)
   - Cultural (references/proper nouns)
   - Linguistic (language features)

4. INSPIRATION - CREATIVE CATEGORY TYPES TO EXPLORE:
   - Historical figures, events, or eras
   - Scientific concepts, elements, or phenomena
   - Literary works, characters, or authors
   - Musical terms, composers, or genres
   - Geographic locations or features
   - Mathematical or logical concepts
   - Mythology or folklore references
   - Word structure patterns (rhymes, anagrams, prefixes, suffixes)
   - Pop culture references (films, TV, games)
   - Professional jargon or technical terms
   - Abstract concepts or emotions
   
   Example puzzles (FOR CONCEPT ONLY - NEVER COPY):
   Set 1: Card suits, Musical keys, Greek letters, Words that follow "green"
   Set 2: US presidents, Constellations, Words ending in "-ology", Poker hands
   Set 3: Shakespeare plays, Programming languages, Minerals, Words with 3 vowels in a row

5. ENSURE WORD AMBIGUITY:
   - Each word should plausibly fit into 2+ categories
   - Avoid obvious groupings where all 4 words clearly belong together
   - Create misdirection through clever word choice

6. THINK STEP-BY-STEP BEFORE GENERATING:
   Before creating categories, ask yourself:
   - Are these 4 categories truly from different domains?
   - Have I used this type of category recently? If yes, pick something different.
   - Would this puzzle stand out in a collection of 50+ puzzles?
   - Does each category use a different connection type?
   - Am I defaulting to easy, obvious groupings? If yes, push further.
   - Would this puzzle surprise and delight solvers?

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

      const varietyPrompts = [
        'Create a puzzle that explores unexpected connections from different knowledge domains.',
        'Generate a puzzle that would surprise someone who has played many word games.',
        'Design a puzzle that showcases creative and diverse category types.',
        'Build a puzzle with categories from completely different areas of human knowledge.',
        'Craft a puzzle where each category feels distinct and memorable.',
      ];
      const randomPrompt = varietyPrompts[Math.floor(Math.random() * varietyPrompts.length)];

      let avoidanceMessage = '';
      if (this.recentCategories.length > 0) {
        avoidanceMessage = `\n\nRECENTLY USED CATEGORIES (DO NOT REPEAT THESE OR SIMILAR THEMES):\n${this.recentCategories.join(', ')}\n\nUse completely different category types from this list.`;
      }

      const response = await this.client.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 2000,
        temperature: 1.0,
        messages: [
          {
            role: 'user',
            content: `Generate a highly original word connections puzzle. ${randomPrompt} Ensure maximum variety - the 4 categories must span completely different thematic domains and connection types. Rotate through different topic areas to keep puzzles fresh and interesting.${avoidanceMessage}`,
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
