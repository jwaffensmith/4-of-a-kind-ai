import { createContext, useContext, useState, ReactNode } from 'react';
import { gameApi } from '../services/gameApi';
import { statsApi } from '../services/statsApi';
import { useLocalStats } from '../hooks/useLocalStats';
import type { GamePuzzle, Category, GameResult } from '../types';

interface GameState {
  puzzle: GamePuzzle | null;
  sessionId: string | null;
  selectedWords: string[];
  foundGroups: Category[];
  mistakesRemaining: number;
  isComplete: boolean;
  isWon: boolean;
  showOneAway: boolean;
  showWrongGuess: boolean;
  startTime: number | null;
  isLoading: boolean;
  error: string | null;
  username: string | null;
}

interface GameContextValue extends GameState {
  startNewGame: (puzzleId: string, username?: string) => Promise<void>;
  selectWord: (word: string) => void;
  deselectAll: () => void;
  shuffleWords: () => void;
  submitGuess: () => Promise<void>;
  revealAllAnswers: () => void;
  setUsername: (username: string) => void;
  clearUsername: () => void;
  deleteUserStats: () => Promise<void>;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const { addGameSession } = useLocalStats();
  
  // Load username from localStorage on mount
  const [state, setState] = useState<GameState>(() => {
    const savedUsername = localStorage.getItem('connections_username');
    return {
      puzzle: null,
      sessionId: null,
      selectedWords: [],
      foundGroups: [],
      mistakesRemaining: 4,
      isComplete: false,
      isWon: false,
      showOneAway: false,
      showWrongGuess: false,
      startTime: null,
      isLoading: false,
      error: null,
      username: savedUsername,
    };
  });

  const startNewGame = async (puzzleId: string, username?: string) => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Use provided username or the stored username
      const usernameToUse = username || state.username || undefined;
      const response = await gameApi.startGame(puzzleId, usernameToUse);
      const fullPuzzle = response.puzzle;
      
      const shuffledWords = [...fullPuzzle.words].sort(() => Math.random() - 0.5);
      
      setState((prev) => ({
        puzzle: { ...fullPuzzle, words: shuffledWords },
        sessionId: response.session_id,
        selectedWords: [],
        foundGroups: [],
        mistakesRemaining: 4,
        isComplete: false,
        isWon: false,
        showOneAway: false,
        showWrongGuess: false,
        startTime: Date.now(),
        isLoading: false,
        error: null,
        username: prev.username, // Keep username in state
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to start game',
      }));
    }
  };

  const setUsername = (username: string) => {
    localStorage.setItem('connections_username', username);
    setState((prev) => ({ ...prev, username }));
  };

  const clearUsername = () => {
    localStorage.removeItem('connections_username');
    setState((prev) => ({ ...prev, username: null }));
  };

  const deleteUserStats = async () => {
    if (!state.username) {
      throw new Error('No username set');
    }

    try {
      await statsApi.deleteUserStats(state.username);
      
      // Clear ALL localStorage data
      localStorage.removeItem('connections_username');
      localStorage.removeItem('4oak_local_stats');
      
      // Reset entire game state to start fresh
      setState({
        puzzle: null,
        sessionId: null,
        selectedWords: [],
        foundGroups: [],
        mistakesRemaining: 4,
        isComplete: false,
        isWon: false,
        showOneAway: false,
        showWrongGuess: false,
        startTime: null,
        isLoading: false,
        error: null,
        username: null,
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Failed to delete stats');
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

      return { ...prev, selectedWords: newSelected, showOneAway: false, showWrongGuess: false };
    });
  };

  const deselectAll = () => {
    setState((prev) => ({ ...prev, selectedWords: [], showOneAway: false, showWrongGuess: false }));
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

    setState((prev) => ({ ...prev, isLoading: true, showOneAway: false, showWrongGuess: false }));

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
          mistakesRemaining: result.mistakes_remaining,
          showOneAway: result.is_one_away || false,
          showWrongGuess: true,
          isComplete: result.is_complete,
          isWon: result.is_won,
          isLoading: false,
        }));

        setTimeout(() => {
          setState((prev) => ({
            ...prev,
            showWrongGuess: false,
          }));
        }, 800);

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

  const revealAllAnswers = () => {
    if (!state.puzzle || state.isWon) return;
    
    setState((prev) => ({
      ...prev,
      foundGroups: prev.puzzle?.categories || [],
    }));
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
        revealAllAnswers,
        setUsername,
        clearUsername,
        deleteUserStats,
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
