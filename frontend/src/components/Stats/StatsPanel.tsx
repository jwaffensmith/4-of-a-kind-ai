import { useState } from 'react';
import { statsApi } from '../../services/statsApi';
import type { UserStats } from '../../types';

export const StatsPanel = () => {
  const [username, setUsername] = useState('');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [error, setError] = useState('');

  const loadStats = async () => {
    if (!username.trim()) return;
    
    try {
      const data = await statsApi.getUserStats(username);
      setStats(data);
      setError('');
    } catch (err) {
      setError('User not found');
      setStats(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Player Stats</h2>
      
      <div className="mb-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadStats()}
          placeholder="Enter username"
          className="px-4 py-2 border border-gray-300 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={loadStats}
          className="mt-2 w-full px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
        >
          Load Stats
        </button>
      </div>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold">{stats.total_games}</div>
            <div className="text-sm text-gray-600">Games Played</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold">{stats.total_wins}</div>
            <div className="text-sm text-gray-600">Wins</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold">{stats.current_streak}</div>
            <div className="text-sm text-gray-600">Current Streak</div>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="text-3xl font-bold">{stats.best_streak}</div>
            <div className="text-sm text-gray-600">Best Streak</div>
          </div>
        </div>
      )}
    </div>
  );
};
