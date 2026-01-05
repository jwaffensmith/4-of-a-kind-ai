import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const samplePuzzles = [
  {
    words: ['BASS', 'TROUT', 'SALMON', 'TUNA', 'APPLE', 'CHERRY', 'BOARD', 'FLOOR', 'MAPLE', 'OAK', 'PINE', 'BIRCH', 'KEYBOARD', 'SURFBOARD', 'CARDBOARD', 'DASHBOARD'],
    categories: [
      { name: 'Types of Fish', words: ['BASS', 'TROUT', 'SALMON', 'TUNA'], difficulty: 'easy' },
      { name: 'Types of Berries', words: ['APPLE', 'CHERRY', 'BOARD', 'FLOOR'], difficulty: 'medium' },
      { name: 'Types of Trees', words: ['MAPLE', 'OAK', 'PINE', 'BIRCH'], difficulty: 'tricky' },
      { name: 'Words ending in BOARD', words: ['KEYBOARD', 'SURFBOARD', 'CARDBOARD', 'DASHBOARD'], difficulty: 'hard' }
    ],
    ai_reasoning: 'Easy: Common fish species. Medium: Berry types with some red herrings. Tricky: Tree species that could be confused with other wood-related words. Hard: Compound words all ending in BOARD, requiring pattern recognition.',
    difficulty: 'medium',
    is_reviewed: true
  },
  {
    words: ['SPIN', 'ROTATE', 'TURN', 'WHIRL', 'ANGRY', 'FURIOUS', 'MAD', 'IRATE', 'PARIS', 'LONDON', 'BERLIN', 'ROME', 'CHICAGO', 'BOSTON', 'SEATTLE', 'MIAMI'],
    categories: [
      { name: 'Words meaning to rotate', words: ['SPIN', 'ROTATE', 'TURN', 'WHIRL'], difficulty: 'easy' },
      { name: 'Words meaning angry', words: ['ANGRY', 'FURIOUS', 'MAD', 'IRATE'], difficulty: 'easy' },
      { name: 'European capitals', words: ['PARIS', 'LONDON', 'BERLIN', 'ROME'], difficulty: 'medium' },
      { name: 'US cities', words: ['CHICAGO', 'BOSTON', 'SEATTLE', 'MIAMI'], difficulty: 'medium' }
    ],
    ai_reasoning: 'Two semantic categories (rotation and anger) paired with two geography categories (European capitals and US cities). Provides good variety between abstract concepts and concrete places.',
    difficulty: 'easy',
    is_reviewed: true
  },
  {
    words: ['BANK', 'POOL', 'WAVE', 'CURRENT', 'IRON', 'PRESS', 'STEAM', 'WRINKLE', 'JAVA', 'PYTHON', 'SWIFT', 'RUBY', 'RING', 'BELL', 'HORN', 'WHISTLE'],
    categories: [
      { name: 'River-related words', words: ['BANK', 'POOL', 'WAVE', 'CURRENT'], difficulty: 'medium' },
      { name: 'Ironing-related', words: ['IRON', 'PRESS', 'STEAM', 'WRINKLE'], difficulty: 'medium' },
      { name: 'Programming languages', words: ['JAVA', 'PYTHON', 'SWIFT', 'RUBY'], difficulty: 'tricky' },
      { name: 'Things that make noise', words: ['RING', 'BELL', 'HORN', 'WHISTLE'], difficulty: 'easy' }
    ],
    ai_reasoning: 'Mixes functional contexts (river, ironing) with technical knowledge (programming languages) and sensory concepts (noise-making objects). Each word has multiple meanings creating interesting ambiguity.',
    difficulty: 'tricky',
    is_reviewed: true
  }
];

async function main() {
  console.log('Starting seed...');

  for (const puzzleData of samplePuzzles) {
    await prisma.puzzle.create({
      data: puzzleData
    });
  }

  console.log('Created sample puzzles');

  await prisma.gameStat.createMany({
    data: [
      {
        username: 'Alice',
        total_games: 15,
        total_wins: 12,
        perfect_games: 3,
        current_streak: 5,
        best_streak: 7,
        avg_time_seconds: 245.5,
        avg_mistakes: 1.2
      },
      {
        username: 'Bob',
        total_games: 8,
        total_wins: 5,
        perfect_games: 1,
        current_streak: 2,
        best_streak: 3,
        avg_time_seconds: 312.8,
        avg_mistakes: 2.1
      }
    ]
  });

  console.log('Created sample stats');

  const firstPuzzle = await prisma.puzzle.findFirst({
    where: { is_reviewed: true }
  });

  if (firstPuzzle) {
    const today = new Date().toISOString().split('T')[0];
    await prisma.dailyPuzzle.create({
      data: {
        puzzle_date: today,
        puzzle_id: firstPuzzle.id
      }
    });
    console.log('Created daily puzzle');
  }

  console.log('Seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

