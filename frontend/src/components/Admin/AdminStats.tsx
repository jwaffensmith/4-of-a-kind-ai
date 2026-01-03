import { useEffect, useState } from 'react';
import { adminApi } from '../../services/adminApi';
import type { AdminStats as AdminStatsType } from '../../types';

export const AdminStats = () => {
  const [stats, setStats] = useState<AdminStatsType | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const data = await adminApi.getAdminStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  if (!stats) return <div>Loading...</div>;

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold">{stats.totalPuzzles}</div>
          <div className="text-gray-600">Total Puzzles</div>
          <div className="text-sm text-gray-500 mt-2">
            {stats.approvedPuzzles} approved, {stats.pendingPuzzles} pending
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold">{stats.completedGames}</div>
          <div className="text-gray-600">Completed Games</div>
          <div className="text-sm text-gray-500 mt-2">
            {stats.totalGames} total games
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-3xl font-bold">{stats.remainingQuota}/100</div>
          <div className="text-gray-600">Generation Quota</div>
          <div className="text-sm text-gray-500 mt-2">
            Resets daily at midnight UTC
          </div>
        </div>
      </div>
    </div>
  );
};
