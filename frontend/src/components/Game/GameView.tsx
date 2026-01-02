import React, { useEffect } from 'react';
import { useGame } from '../../contexts/GameContext';
import { WordGrid } from './WordGrid';
import { FoundGroups } from './FoundGroups';
import { MistakesRemaining } from './MistakesRemaining';
import { GameControls } from './GameControls';
import { GameComplete } from './GameComplete';
import { gameApi } from '../../services/gameApi';
import { motion, AnimatePresence } from 'framer-motion';

export const GameView: React.FC = () => {
  const game = useGame();

  useEffect(() => {
    loadDailyPuzzle();
  }, []);

  const loadDailyPuzzle = async () => {
    try {
      const puzzle = await gameApi.getDailyPuzzle();
      await game.startNewGame(puzzle.id);
    } catch (error) {
      console.error('Failed to load puzzle:', error);
    }
  };

  const handlePlayAgain = () => {
    loadDailyPuzzle();
  };

  if (game.isLoading && !game.puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl font-semibold">Loading puzzle...</div>
      </div>
    );
  }

  if (game.error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{game.error}</p>
          <button
            type="button"
            onClick={loadDailyPuzzle}
            className="px-6 py-2 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!game.puzzle) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Connections</h1>
          <p className="text-gray-600">Find groups of four words that share something in common</p>
        </header>

        <AnimatePresence mode="wait">
          {game.showOneAway && (
            <motion.div
              key="one-away"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-4 p-3 bg-yellow-100 border-2 border-yellow-400 rounded-lg text-center"
              role="alert"
            >
              <p className="text-yellow-800 font-semibold">One away! Try again.</p>
            </motion.div>
          )}
        </AnimatePresence>

        <FoundGroups groups={game.foundGroups} />

        <WordGrid
          words={game.puzzle.words}
          selectedWords={game.selectedWords}
          foundGroups={game.foundGroups}
          onWordClick={game.selectWord}
          disabled={game.isLoading || game.isComplete}
        />

        <MistakesRemaining mistakes={game.mistakesRemaining} />

        <GameControls
          onShuffle={game.shuffleWords}
          onDeselect={game.deselectAll}
          onSubmit={game.submitGuess}
          canSubmit={game.selectedWords.length === 4}
          disabled={game.isLoading || game.isComplete}
        />

        {game.isComplete && (
          <GameComplete
            isWon={game.isWon}
            puzzle={game.puzzle}
            foundGroups={game.foundGroups}
            onPlayAgain={handlePlayAgain}
          />
        )}
      </div>
    </div>
  );
};

