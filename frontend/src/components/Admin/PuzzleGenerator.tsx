import { useState } from 'react';
import { adminApi } from '../../services/adminApi';

export const PuzzleGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState('');

  const handleGenerate = async () => {
    setIsGenerating(true);
    setMessage('');

    try {
      await adminApi.generatePuzzle();
      setMessage('Puzzle generated!');
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
