import { useState } from 'react';
import { adminApi } from '../../services/adminApi';

type DifficultyOption = 'auto' | 'easy' | 'medium' | 'hard';

export const PuzzleGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<DifficultyOption>('auto');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setMessage('');

    try {
      const targetDifficulty = selectedDifficulty === 'auto' ? undefined : selectedDifficulty;
      const result = await adminApi.generatePuzzle(targetDifficulty);
      setMessage(`Puzzle generated with difficulty: ${result.puzzle.difficulty}!`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Failed to generate puzzle');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Generate Puzzle</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="mb-4 text-gray-700">
          Generate a new AI-powered puzzle with diverse categories.
        </p>
        
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Target Difficulty
          </label>
          <div className="flex flex-wrap gap-3">
            {(['auto', 'easy', 'medium', 'hard'] as DifficultyOption[]).map((difficulty) => (
              <button
                key={difficulty}
                onClick={() => setSelectedDifficulty(difficulty)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDifficulty === difficulty
                    ? 'bg-gray-800 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {difficulty === 'auto' ? 'Auto (AI decides)' : difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-gray-500">
            {selectedDifficulty === 'auto' 
              ? 'AI will automatically determine the best difficulty distribution'
              : `AI will target ${selectedDifficulty} difficulty with appropriate category distribution`
            }
          </p>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="px-6 py-3 bg-gray-800 text-white rounded-lg font-semibold hover:bg-gray-700 disabled:opacity-50"
        >
          {isGenerating ? 'Generating...' : 'Generate Puzzle'}
        </button>
        {message && (
          <div className="mt-4 p-3 bg-blue-100 border border-blue-400 text-blue-700 rounded-lg">
            {message}
          </div>
        )}
      </div>
    </div>
  );
};
