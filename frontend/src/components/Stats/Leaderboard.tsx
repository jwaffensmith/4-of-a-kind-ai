import { useEffect, useState } from 'react';
import { statsApi } from '../../services/statsApi';
import type { UserStats } from '../../types';

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await statsApi.getLeaderboard(10);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-4">Leaderboard</h2>
      <div className="space-y-2">
        {leaderboard.map((player, index) => (
          <div
            key={player.username}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <span className="text-lg font-bold text-gray-500 w-8">#{index + 1}</span>
              <span className="font-semibold">{player.username}</span>
            </div>
            <div className="text-right">
              <div className="font-bold">{player.total_wins} wins</div>
              <div className="text-sm text-gray-600">{player.total_games} games</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
