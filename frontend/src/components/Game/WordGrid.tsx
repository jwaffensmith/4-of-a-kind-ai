import { WordButton } from './WordButton';
import { motion } from 'framer-motion';

interface WordGridProps {
  words: string[];
  selectedWords: string[];
  foundGroups: Array<{ words: string[]; difficulty: string }>;
  onWordClick: (word: string) => void;
  disabled: boolean;
  showWrongGuess: boolean;
}

export const WordGrid = ({
  words,
  selectedWords,
  foundGroups,
  onWordClick,
  disabled,
  showWrongGuess,
}: WordGridProps) => {
  const isWordFound = (word: string) => {
    return foundGroups.some((group) => group.words.includes(word));
  };

  const remainingWords = words.filter((word) => !isWordFound(word));

  return (
    <div
      className="grid grid-cols-4 gap-2 md:gap-3 max-w-2xl mx-auto mb-3"
      role="grid"
      aria-label="Word selection grid"
    >
      {remainingWords.map((word, index) => (
        <motion.div
          key={word}
          layout
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3, delay: index * 0.03 }}
        >
          <WordButton
            word={word}
            isSelected={selectedWords.includes(word)}
            isFound={false}
            difficulty={undefined}
            onClick={() => onWordClick(word)}
            disabled={disabled}
            showWrongGuess={showWrongGuess}
          />
        </motion.div>
      ))}
    </div>
  );
};
