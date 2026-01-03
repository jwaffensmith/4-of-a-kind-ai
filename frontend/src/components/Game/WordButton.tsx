interface WordButtonProps {
  word: string;
  isSelected: boolean;
  isFound: boolean;
  difficulty?: string;
  onClick: () => void;
  disabled: boolean;
}

const difficultyColors = {
  easy: 'bg-difficulty-easy text-black',
  medium: 'bg-difficulty-medium text-black',
  tricky: 'bg-difficulty-tricky text-white',
  hard: 'bg-difficulty-hard text-white',
};

export const WordButton = ({
  word,
  isSelected,
  isFound,
  difficulty,
  onClick,
  disabled,
}: WordButtonProps) => {
  const baseClasses = 'px-4 py-6 rounded-lg font-semibold text-sm md:text-base transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500';
  
  const stateClasses = isFound
    ? `${difficultyColors[difficulty as keyof typeof difficultyColors] || 'bg-gray-400'} cursor-default`
    : isSelected
    ? 'bg-gray-800 text-white scale-95'
    : 'bg-gray-200 hover:bg-gray-300 text-gray-900 hover:scale-105';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || isFound}
      className={`${baseClasses} ${stateClasses}`}
      aria-pressed={isSelected}
      aria-label={`Word: ${word}${isSelected ? ', selected' : ''}${isFound ? ', found' : ''}`}
    >
      {word}
    </button>
  );
};
