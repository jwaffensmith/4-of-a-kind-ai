import { fetchApi } from './api';
import type { UserStats } from '../types';

export const statsApi = {
  getUserStats: (username: string) =>
    fetchApi<UserStats>(`/api/stats/${username}`),

  getLeaderboard: (limit: number = 10) =>
    fetchApi<UserStats[]>(`/api/stats/leaderboard/top?limit=${limit}`),

  syncLocalStats: (stats: Partial<UserStats>) =>
    fetchApi<UserStats>('/api/stats/sync', {
      method: 'POST',
      body: JSON.stringify(stats),
    }),

  deleteUserStats: (username: string) =>
    fetchApi<{ message: string }>(`/api/stats/${username}`, {
      method: 'DELETE',
    }),
};

