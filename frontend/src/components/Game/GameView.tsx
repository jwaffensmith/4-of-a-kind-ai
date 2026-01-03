import { useEffect, useState } from 'react';
import { useGame } from '../../contexts/GameContext';
import { WordGrid } from './WordGrid';
import { FoundGroups } from './FoundGroups';
import { MistakesRemaining } from './MistakesRemaining';
import { GameControls } from './GameControls';
import { GameComplete } from './GameComplete';
import { gameApi } from '../../services/gameApi';
import { motion, AnimatePresence } from 'framer-motion';

export const GameView = () => {
  const game = useGame();
  const [localError, setLocalError] = useState<string | null>(null);
  const [localLoading, setLocalLoading] = useState(true);

  useEffect(() => {
    loadDailyPuzzle();
  }, []);

  const loadDailyPuzzle = async () => {
    setLocalLoading(true);
    setLocalError(null);
    try {
      const puzzle = await gameApi.getDailyPuzzle();
      await game.startNewGame(puzzle.id);
    } catch (error) {
      console.error('Failed to load puzzle:', error);
      setLocalError(error instanceof Error ? error.message : 'Failed to load puzzle');
    } finally {
      setLocalLoading(false);
    }
  };

  const handlePlayAgain = () => {
    loadDailyPuzzle();
  };

  if (localLoading && !game.puzzle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading puzzle...</p>
        </div>
      </div>
    );
  }

  if (localError || game.error) {
    const errorMessage = localError || game.error;
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="mb-6">
            <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oops!</h2>
          <p className="text-gray-600 mb-6">{errorMessage}</p>
          {errorMessage?.includes('No approved puzzles') && (
            <p className="text-sm text-gray-500 mb-6">
              The admin needs to generate and approve puzzles first.
            </p>
          )}
          <button
            type="button"
            onClick={loadDailyPuzzle}
            className="px-6 py-3 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!game.puzzle) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading puzzle...</p>
        </div>
      </div>
    );
  }

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
            onPlayAgain={handlePlayAgain}
          />
        )}
      </div>
    </div>
  );
};

