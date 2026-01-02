import React from 'react';
import { WordButton } from './WordButton';
import { motion } from 'framer-motion';

interface WordGridProps {
  words: string[];
  selectedWords: string[];
  foundGroups: Array<{ words: string[]; difficulty: string }>;
  onWordClick: (word: string) => void;
  disabled: boolean;
}

export const WordGrid: React.FC<WordGridProps> = ({
  words,
  selectedWords,
  foundGroups,
  onWordClick,
  disabled,
}) => {
  const isWordFound = (word: string) => {
    return foundGroups.some((group) => group.words.includes(word));
  };

  const getWordDifficulty = (word: string) => {
    const group = foundGroups.find((g) => g.words.includes(word));
    return group?.difficulty;
  };

  return (
    <div
      className="grid grid-cols-4 gap-2 md:gap-3 max-w-2xl mx-auto"
      role="grid"
      aria-label="Word selection grid"
    >
      {words.map((word, index) => (
        <motion.div
          key={word}
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.03 }}
        >
          <WordButton
            word={word}
            isSelected={selectedWords.includes(word)}
            isFound={isWordFound(word)}
            difficulty={getWordDifficulty(word)}
            onClick={() => onWordClick(word)}
            disabled={disabled}
          />
        </motion.div>
      ))}
    </div>
  );
};
