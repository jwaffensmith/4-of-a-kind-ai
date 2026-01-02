import React, { useEffect } from 'react';
import Confetti from 'react-confetti';
import { motion } from 'framer-motion';
import type { Puzzle, Category } from '../../types';

interface GameCompleteProps {
  isWon: boolean;
  puzzle: Puzzle;
  foundGroups: Category[];
  onPlayAgain: () => void;
}

export const GameComplete: React.FC<GameCompleteProps> = ({
  isWon,
  puzzle,
  foundGroups,
  onPlayAgain,
}) => {
  const [showConfetti, setShowConfetti] = React.useState(isWon);
  const [windowSize, setWindowSize] = React.useState({ width: window.innerWidth, height: window.innerHeight });

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
        className="bg-white rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        <h2 id="game-complete-title" className="text-3xl font-bold text-center mb-6">
          {isWon ? '🎉 Congratulations!' : '😔 Game Over'}
        </h2>

        <div className="space-y-4 mb-6">
          <h3 className="text-xl font-semibold">Categories & AI Reasoning:</h3>
          
          {puzzle.categories.map((category) => (
            <div key={category.name} className="border-l-4 border-gray-800 pl-4">
              <h4 className="font-bold text-lg">{category.name}</h4>
              <p className="text-sm text-gray-600 mb-2">{category.words.join(', ')}</p>
              {category.reasoning && (
                <p className="text-sm text-gray-700 italic">{category.reasoning}</p>
              )}
            </div>
          ))}

          <div className="mt-6 p-4 bg-gray-100 rounded-lg">
            <h4 className="font-semibold mb-2">Overall Puzzle Insight:</h4>
            <p className="text-sm text-gray-700">{puzzle.ai_reasoning}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={onPlayAgain}
          className="w-full py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
        >
          Play Again
        </button>
      </motion.div>
    </div>
  );
};
