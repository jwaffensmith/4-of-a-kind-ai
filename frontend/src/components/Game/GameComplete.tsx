import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import type { GamePuzzle, Category } from '../../types';

interface GameCompleteProps {
  isWon: boolean;
  puzzle: GamePuzzle;
  foundGroups: Category[];
  onClose: () => void;
}

const difficultyStyles = {
  easy: {
    backgroundColor: '#f9ca24',
    color: '#000000',
  },
  medium: {
    backgroundColor: '#6dd5a0',
    color: '#000000',
  },
  tricky: {
    backgroundColor: '#4a90e2',
    color: '#000000',
  },
  hard: {
    backgroundColor: '#a29bfe',
    color: '#000000',
  },
};

const colorStyles = {
  yellow: { backgroundColor: '#f9ca24', color: '#000000' },
  green: { backgroundColor: '#6dd5a0', color: '#000000' },
  blue: { backgroundColor: '#4a90e2', color: '#000000' },
  purple: { backgroundColor: '#a29bfe', color: '#000000' },
} as const;

function getCategoryStyle(category: Category) {
  if ((category as any).color && (category as any).color in colorStyles) {
    return colorStyles[(category as any).color as keyof typeof colorStyles];
  }
  if ((category as any).difficulty && (category as any).difficulty in difficultyStyles) {
    return difficultyStyles[(category as any).difficulty as keyof typeof difficultyStyles];
  }
  return { backgroundColor: '#e5e7eb', color: '#000000' };
}

export const GameComplete = ({
  isWon,
  puzzle,
  onClose,
}: GameCompleteProps) => {
  const [showConfetti, setShowConfetti] = useState(isWon);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isWon) {
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [isWon]);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="game-complete-title"
    >
      {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} />}
      
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 id="game-complete-title" className="text-3xl font-bold text-center mb-4">
          {isWon ? '🎉 Congratulations!' : '😔 Game Over'}
        </h2>

        <div className="text-center text-gray-600 mb-6">
          <p className="mb-2">{isWon ? 'You solved today\'s puzzle!' : 'Better luck next time!'}</p>
          <p className="text-sm">Come back tomorrow for a new puzzle!</p>
        </div>

        {/* Show all categories with reasoning */}
        <div className="mb-6">
          <div className="space-y-3">
            {puzzle.categories?.map((category) => (
              <div
                key={category.name}
                className="rounded-lg p-4"
                style={getCategoryStyle(category)}
              >
                <h4 className="font-bold text-base mb-1 uppercase tracking-wide text-center">{category.name}</h4>
                <p className="text-sm font-medium uppercase text-center mb-2">{category.words.join(', ')}</p>
                {category.reasoning && (
                  <div className="text-xs mt-2 pt-2 border-t border-black/20">
                    <p className="font-semibold text-center mb-1">AI Reasoning:</p>
                    <p className="text-center italic">{category.reasoning}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
