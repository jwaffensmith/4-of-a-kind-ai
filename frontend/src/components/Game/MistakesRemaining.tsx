interface MistakesRemainingProps {
  mistakes: number;
}

export const MistakesRemaining = ({ mistakes }: MistakesRemainingProps) => {
  return (
    <div className="flex items-center justify-center gap-2 my-4" role="status" aria-live="polite">
      <span className="text-sm font-medium text-gray-700">Mistakes remaining:</span>
      <div className="flex gap-1">
        {[...Array(4)].map((_, index) => (
          <div
            key={index}
            className={`w-3 h-3 rounded-full ${
              index < mistakes ? 'bg-gray-800' : 'bg-gray-300'
            }`}
            aria-hidden="true"
          />
        ))}
      </div>
      <span className="sr-only">{mistakes} out of 4 mistakes remaining</span>
    </div>
  );
};
