import React, { createContext, useContext, useState, ReactNode } from 'react';
import { gameApi } from '../services/gameApi';
import { useLocalStats } from '../hooks/useLocalStats';
import type { Puzzle, Category, GameResult } from '../types';

interface GameState {
  puzzle: Puzzle | null;
  sessionId: string | null;
  selectedWords: string[];
  foundGroups: Category[];
  mistakesRemaining: number;
  isComplete: boolean;
  isWon: boolean;
  showOneAway: boolean;
  startTime: number | null;
  isLoading: boolean;
  error: string | null;
}

interface GameContextValue extends GameState {
  startNewGame: (puzzleId: string, username?: string) => Promise<void>;
  selectWord: (word: string) => void;
  deselectAll: () => void;
  shuffleWords: () => void;
  submitGuess: () => Promise<void>;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { addGameSession } = useLocalStats();
  const [state, setState] = useState<GameState>({
    puzzle: null,
    sessionId: null,
    selectedWords: [],
    foundGroups: [],
    mistakesRemaining: 4,
    isComplete: false,
    isWon: false,
    showOneAway: false,
    startTime: null,
    isLoading: false,
    error: null,
  });

  const startNewGame = async (puzzleId: string, username?: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const response = await gameApi.startGame(puzzleId, username);
      const fullPuzzle = await gameApi.getDailyPuzzle();
      
      setState({
        puzzle: fullPuzzle,
        sessionId: response.session_id,
        selectedWords: [],
        foundGroups: [],
        mistakesRemaining: 4,
        isComplete: false,
        isWon: false,
        showOneAway: false,
        startTime: Date.now(),
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to start game',
      }));
    }
  };

  const selectWord = (word: string) => {
    if (state.isComplete) return;

    setState((prev) => {
      const isSelected = prev.selectedWords.includes(word);
      const newSelected = isSelected
        ? prev.selectedWords.filter((w) => w !== word)
        : prev.selectedWords.length < 4
        ? [...prev.selectedWords, word]
        : prev.selectedWords;

      return { ...prev, selectedWords: newSelected, showOneAway: false };
    });
  };

  const deselectAll = () => {
    setState((prev) => ({ ...prev, selectedWords: [], showOneAway: false }));
  };

  const shuffleWords = () => {
    if (!state.puzzle) return;

    const remainingWords = state.puzzle.words.filter(
      (word) => !state.foundGroups.some((group) => group.words.includes(word))
    );

    const shuffled = [...remainingWords].sort(() => Math.random() - 0.5);
    const foundWords = state.puzzle.words.filter((word) =>
      state.foundGroups.some((group) => group.words.includes(word))
    );

    setState((prev) => ({
      ...prev,
      puzzle: prev.puzzle
        ? { ...prev.puzzle, words: [...foundWords, ...shuffled] }
        : null,
      selectedWords: [],
      showOneAway: false,
    }));
  };

  const submitGuess = async () => {
    if (!state.sessionId || state.selectedWords.length !== 4) return;

    setState((prev) => ({ ...prev, isLoading: true, showOneAway: false }));

    try {
      const result: GameResult = await gameApi.submitGuess(
        state.sessionId,
        state.selectedWords
      );

      if (result.success && result.category) {
        setState((prev) => ({
          ...prev,
          foundGroups: [...prev.foundGroups, result.category!],
          selectedWords: [],
          isComplete: result.is_complete,
          isWon: result.is_won,
          mistakesRemaining: result.mistakes_remaining,
          isLoading: false,
        }));

        if (result.is_complete && state.startTime) {
          const timeTaken = Math.floor((Date.now() - state.startTime) / 1000);
          const mistakeCount = 4 - result.mistakes_remaining;
          addGameSession(state.puzzle!.id, result.is_won, mistakeCount, timeTaken);
        }
      } else {
        setState((prev) => ({
          ...prev,
          selectedWords: [],
          mistakesRemaining: result.mistakes_remaining,
          showOneAway: result.is_one_away || false,
          isComplete: result.is_complete,
          isWon: result.is_won,
          isLoading: false,
        }));

        if (result.is_complete && state.startTime) {
          const timeTaken = Math.floor((Date.now() - state.startTime) / 1000);
          const mistakeCount = 4 - result.mistakes_remaining;
          addGameSession(state.puzzle!.id, false, mistakeCount, timeTaken);
        }
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to submit guess',
      }));
    }
  };

  return (
    <GameContext.Provider
      value={{
        ...state,
        startNewGame,
        selectWord,
        deselectAll,
        shuffleWords,
        submitGuess,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
