import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { statsApi } from '../../services/statsApi';
import type { UserStats } from '../../types';

interface UserStatsModalProps {
  isOpen: boolean;
  username: string;
  onClose: () => void;
}

export const UserStatsModal = ({ isOpen, username, onClose }: UserStatsModalProps) => {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && username) {
      loadStats();
    }
  }, [isOpen, username]);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await statsApi.getUserStats(username);
      setStats(data);
    } catch (err: any) {
      // If user not found (404), they just haven't played games yet
      if (err?.statusCode === 404 || err?.message?.includes('not found')) {
        setStats(null);
      } else {
        setError('Unable to load stats');
        console.error('Failed to load stats:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const winRate = stats && stats.total_games > 0
    ? ((stats.total_wins / stats.total_games) * 100).toFixed(1)
    : '0';

  const avgTime = stats?.avg_time_seconds
    ? Math.floor(stats.avg_time_seconds / 60) + 'm ' + Math.floor(stats.avg_time_seconds % 60) + 's'
    : 'N/A';

  const avgMistakes = stats?.avg_mistakes?.toFixed(1) ?? 'N/A';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="text-4xl">📊</div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Stats</h2>
                <p className="text-sm text-gray-600">Performance overview for {username}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading stats...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">😕</div>
              <p className="text-gray-600">{error}</p>
            </div>
          )}

          {!stats && !loading && !error && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🎮</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Stats Yet</h3>
              <p className="text-gray-600 mb-4">
                Complete your first game to start tracking your stats!
              </p>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-sm text-gray-700">
                <span>💡</span>
                <span>Your stats will appear here after you finish a game</span>
              </div>
            </div>
          )}

          {stats && !loading && (
            <div className="space-y-6">
              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                  <div className="text-2xl mb-1">🎮</div>
                  <div className="text-3xl font-bold text-blue-900">{stats.total_games}</div>
                  <div className="text-xs text-blue-700 font-medium">Games Played</div>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                  <div className="text-2xl mb-1">🏆</div>
                  <div className="text-3xl font-bold text-green-900">{stats.total_wins}</div>
                  <div className="text-xs text-green-700 font-medium">Total Wins</div>
                </div>

                <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                  <div className="text-2xl mb-1">💎</div>
                  <div className="text-3xl font-bold text-purple-900">{stats.perfect_games}</div>
                  <div className="text-xs text-purple-700 font-medium">Perfect Games</div>
                </div>

                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl border border-orange-200">
                  <div className="text-2xl mb-1">🔥</div>
                  <div className="text-3xl font-bold text-orange-900">{stats.best_streak}</div>
                  <div className="text-xs text-orange-700 font-medium">Best Streak</div>
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">📈</span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Win Rate</div>
                        <div className="text-2xl font-bold text-gray-900">{winRate}%</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {stats.total_wins} of {stats.total_games} games
                    </div>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">⏱️</span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Average Time</div>
                        <div className="text-2xl font-bold text-gray-900">{avgTime}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Per completed game
                    </div>
                  </div>

                  <div className="h-px bg-gray-200"></div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                        <span className="text-lg">❌</span>
                      </div>
                      <div>
                        <div className="text-sm text-gray-600">Average Mistakes</div>
                        <div className="text-2xl font-bold text-gray-900">{avgMistakes}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      Out of 4 allowed
                    </div>
                  </div>
                </div>
              </div>

              {/* Current Streak */}
              {stats.current_streak > 0 && (
                <div className="bg-gradient-to-r from-orange-100 to-yellow-100 rounded-xl p-4 border border-orange-200">
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">🔥</div>
                    <div>
                      <div className="text-sm text-orange-800 font-medium">Current Win Streak</div>
                      <div className="text-2xl font-bold text-orange-900">{stats.current_streak} games</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Achievements */}
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border border-yellow-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span className="text-2xl">🏅</span>
                  Achievements
                </h3>
                <div className="space-y-2">
                  {stats.total_games >= 10 && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-lg">✅</span>
                      <span>Played 10+ games</span>
                    </div>
                  )}
                  {stats.perfect_games > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-lg">✅</span>
                      <span>Achieved perfect game (no mistakes)</span>
                    </div>
                  )}
                  {stats.best_streak >= 5 && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-lg">✅</span>
                      <span>Win streak of 5+ games</span>
                    </div>
                  )}
                  {parseFloat(winRate) >= 70 && stats.total_games >= 5 && (
                    <div className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-lg">✅</span>
                      <span>70%+ win rate</span>
                    </div>
                  )}
                  {stats.total_games === 0 || (stats.total_games < 10 && stats.perfect_games === 0 && stats.best_streak < 5) && (
                    <div className="text-sm text-gray-500 italic">
                      Keep playing to unlock achievements!
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={onClose}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

