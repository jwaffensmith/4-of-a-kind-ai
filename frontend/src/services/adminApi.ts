import { fetchApi } from './api';
import type { Puzzle, AdminStats } from '../types';

const getToken = () => sessionStorage.getItem('admin_token');

export const adminApi = {
  login: (password: string) =>
    fetchApi<{ token: string; expiresIn: number }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify({ password }),
    }),

  logout: () =>
    fetchApi<{ message: string }>('/api/admin/logout', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  generatePuzzle: () =>
    fetchApi<{ puzzle: Puzzle; remainingQuota: number }>('/api/admin/puzzle/generate', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  getAllPuzzles: () =>
    fetchApi<Puzzle[]>('/api/admin/puzzle/all', {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  approvePuzzle: (puzzleId: string) =>
    fetchApi<Puzzle>(`/api/admin/puzzle/${puzzleId}/approve`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  rejectPuzzle: (puzzleId: string) =>
    fetchApi<{ message: string }>(`/api/admin/puzzle/${puzzleId}/reject`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  setDailyPuzzle: (date: string, puzzleId: string) =>
    fetchApi<unknown>('/api/admin/daily', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify({ date, puzzle_id: puzzleId }),
    }),

  getAdminStats: () =>
    fetchApi<AdminStats>('/api/admin/stats', {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),

  getQuota: () =>
    fetchApi<{ remainingQuota: number; maxQuota: number }>('/api/admin/quota', {
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    }),
};

