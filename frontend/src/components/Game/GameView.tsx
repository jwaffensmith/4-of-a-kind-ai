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
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showOneAwayBanner, setShowOneAwayBanner] = useState(false);

  useEffect(() => {
    loadDailyPuzzle();
  }, []);

  useEffect(() => {
    if (game.isComplete) {
      setShowCompleteModal(true);
    }
  }, [game.isComplete]);

  useEffect(() => {
    if (game.showOneAway) {
      setShowOneAwayBanner(true);
      const timer = setTimeout(() => {
        setShowOneAwayBanner(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [game.showOneAway]);

  const handleCloseModal = () => {
    if (!game.isWon) {
      game.revealAllAnswers();
    }
    setShowCompleteModal(false);
  };

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
    <div className="min-h-screen bg-gray-50 pt-4 pb-8 px-4">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-6 relative">
          <div className="flex items-center justify-center gap-4 mb-2">
            <img src="/logo.svg" alt="Logo" className="w-32 h-32" />
          </div>
          <p className="text-gray-600">Find groups of four words that share something in common</p>
          
          <AnimatePresence mode="wait">
            {showOneAwayBanner && (
              <motion.div
                key="one-away"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="absolute left-1/2 -translate-x-1/2 -bottom-4 py-2.5 px-8 bg-gray-900 border-2 border-gray-900 rounded-lg shadow-lg"
                role="alert"
              >
                <p className="text-white text-base font-bold">One away!</p>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        <FoundGroups groups={game.foundGroups} />

        <WordGrid
          words={game.puzzle.words}
          selectedWords={game.selectedWords}
          foundGroups={game.foundGroups}
          onWordClick={game.selectWord}
          disabled={game.isLoading || game.isComplete}
          showWrongGuess={game.showWrongGuess}
        />

        <MistakesRemaining mistakes={game.mistakesRemaining} />

        <GameControls
          onShuffle={game.shuffleWords}
          onDeselect={game.deselectAll}
          onSubmit={game.submitGuess}
          canSubmit={game.selectedWords.length === 4}
          disabled={game.isLoading || game.isComplete}
        />

        {showCompleteModal && game.isComplete && (
          <GameComplete
            isWon={game.isWon}
            puzzle={game.puzzle}
            foundGroups={game.foundGroups}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
};

