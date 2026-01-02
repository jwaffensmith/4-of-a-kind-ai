import React from 'react';

interface GameControlsProps {
  onShuffle: () => void;
  onDeselect: () => void;
  onSubmit: () => void;
  canSubmit: boolean;
  disabled: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  onShuffle,
  onDeselect,
  onSubmit,
  canSubmit,
  disabled,
}) => {
  return (
    <div className="flex justify-center gap-3 my-6" role="group" aria-label="Game controls">
      <button
        type="button"
        onClick={onShuffle}
        disabled={disabled}
        className="px-6 py-2 bg-white border-2 border-gray-800 text-gray-800 rounded-full font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
        aria-label="Shuffle remaining words"
      >
        Shuffle
      </button>
      <button
        type="button"
        onClick={onDeselect}
        disabled={disabled}
        className="px-6 py-2 bg-white border-2 border-gray-800 text-gray-800 rounded-full font-semibold hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
        aria-label="Deselect all words"
      >
        Deselect All
      </button>
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit || disabled}
        className="px-8 py-2 bg-gray-800 text-white rounded-full font-semibold hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
        aria-label="Submit selected words"
      >
        Submit
      </button>
    </div>
  );
};

