import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import { statsApi } from '../../services/statsApi';
import type { AdminStats as AdminStatsType, UserStats } from '../../types';

export const AdminStats = () => {
  const [stats, setStats] = useState<AdminStatsType | null>(null);
  const [leaderboard, setLeaderboard] = useState<UserStats[]>([]);

  useEffect(() => {
    loadStats();
    loadLeaderboard();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminApi.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const loadLeaderboard = async () => {
    try {
      const data = await statsApi.getLeaderboard(10);
      setLeaderboard(data);
    } catch (error) {
      console.error('Failed to load leaderboard:', error);
    }
  };

  if (!stats) return <div className="text-gray-600">Loading...</div>;

  const completionRate = stats.totalGames > 0 
    ? ((stats.completedGames / stats.totalGames) * 100).toFixed(1)
    : '0';

  const quotaUsed = 100 - stats.remainingQuota;
  const quotaPercentage = quotaUsed;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-gray-600">Overview of all system statistics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Puzzles */}
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Total Puzzles</div>
            <div className="text-2xl">🧩</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalPuzzles}</div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-green-600">✓ Approved:</span>
              <span className="font-semibold text-green-700">{stats.approvedPuzzles}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-yellow-600">⏳ Pending:</span>
              <span className="font-semibold text-yellow-700">{stats.pendingPuzzles}</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Total Games</div>
            <div className="text-2xl">🎮</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalGames}</div>
          <div className="mt-3 space-y-1">
            <div className="flex justify-between text-sm">
              <span className="text-blue-600">Completed:</span>
              <span className="font-semibold text-blue-700">{stats.completedGames}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Completion Rate:</span>
              <span className="font-semibold text-gray-700">{completionRate}%</span>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <div className="text-sm font-medium text-gray-600">Total Players</div>
            <div className="text-2xl">👥</div>
          </div>
          <div className="text-3xl font-bold text-gray-900">{stats.totalPlayers}</div>
          <div className="mt-3 space-y-1">
            <div className="text-sm text-gray-600">
              Unique users with stats
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard Section */}
      {leaderboard.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Top Players</h2>
            <p className="text-sm text-gray-600 mt-1">Best performing players by total wins</p>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Username
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Games
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Wins
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Win Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Perfect Games
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Best Streak
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avg Mistakes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {leaderboard.map((player, index) => {
                  const winRate = player.total_games > 0 
                    ? ((player.total_wins / player.total_games) * 100).toFixed(1)
                    : '0';
                  const avgTime = player.avg_time_seconds 
                    ? Math.floor(player.avg_time_seconds / 60) + 'm ' + Math.floor(player.avg_time_seconds % 60) + 's'
                    : 'N/A';
                  const avgMistakes = player.avg_mistakes?.toFixed(1) ?? 'N/A';

                  return (
                    <tr key={player.username} className={index < 3 ? 'bg-yellow-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {index === 0 && <span className="text-xl mr-2">🥇</span>}
                          {index === 1 && <span className="text-xl mr-2">🥈</span>}
                          {index === 2 && <span className="text-xl mr-2">🥉</span>}
                          <span className="text-sm font-medium text-gray-900">#{index + 1}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{player.username}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {player.total_games}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-semibold text-green-600">{player.total_wins}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">{winRate}%</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-purple-600 font-semibold">{player.perfect_games}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-orange-600">{player.best_streak}</span>
                          {player.current_streak > 0 && (
                            <span className="ml-2 text-xs text-gray-500">(current: {player.current_streak})</span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {avgTime}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {avgMistakes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {leaderboard.length === 0 && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <div className="text-gray-400 text-5xl mb-4">📊</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Player Stats Yet</h3>
          <p className="text-gray-600">Stats will appear here once players start completing games.</p>
        </div>
      )}
    </div>
  );
};
