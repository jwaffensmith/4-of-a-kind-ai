import React, { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import type { Puzzle } from '../../types';

export const PuzzleList: React.FC = () => {
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [filter, setFilter] = useState<'all' | 'approved' | 'pending'>('all');

  useEffect(() => {
    loadPuzzles();
  }, []);

  const loadPuzzles = async () => {
    try {
      const data = await adminApi.getAllPuzzles();
      setPuzzles(data);
    } catch (error) {
      console.error('Failed to load puzzles:', error);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await adminApi.approvePuzzle(id);
      loadPuzzles();
    } catch (error) {
      console.error('Failed to approve puzzle:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      await adminApi.rejectPuzzle(id);
      loadPuzzles();
    } catch (error) {
      console.error('Failed to reject puzzle:', error);
    }
  };

  const filteredPuzzles = puzzles.filter((p) => {
    if (filter === 'approved') return p.is_reviewed;
    if (filter === 'pending') return !p.is_reviewed;
    return true;
  });

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Puzzles</h1>
      
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg ${filter === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
        >
          All ({puzzles.length})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-4 py-2 rounded-lg ${filter === 'approved' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
        >
          Approved ({puzzles.filter(p => p.is_reviewed).length})
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-4 py-2 rounded-lg ${filter === 'pending' ? 'bg-gray-800 text-white' : 'bg-gray-200'}`}
        >
          Pending ({puzzles.filter(p => !p.is_reviewed).length})
        </button>
      </div>

      <div className="space-y-4">
        {filteredPuzzles.map((puzzle) => (
          <div key={puzzle.id} className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-lg">Puzzle {puzzle.id.slice(0, 8)}</h3>
                <p className="text-sm text-gray-600">Difficulty: {puzzle.difficulty}</p>
                <p className="text-sm text-gray-600">
                  Status: {puzzle.is_reviewed ? '✅ Approved' : '⏳ Pending'}
                </p>
              </div>
              <div className="flex gap-2">
                {!puzzle.is_reviewed && (
                  <>
                    <button
                      onClick={() => handleApprove(puzzle.id)}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(puzzle.id)}
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Reject
                    </button>
                  </>
                )}
              </div>
            </div>
            <div className="text-sm space-y-2">
              {puzzle.categories.map((cat) => (
                <div key={cat.name} className="border-l-4 border-gray-300 pl-3">
                  <strong>{cat.name}</strong>: {cat.words.join(', ')}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
