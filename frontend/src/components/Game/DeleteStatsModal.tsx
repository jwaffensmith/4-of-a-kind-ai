import { motion, AnimatePresence } from 'framer-motion';

interface DeleteStatsModalProps {
  isOpen: boolean;
  username: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteStatsModal = ({ isOpen, username, onConfirm, onCancel }: DeleteStatsModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8"
        >
          <div className="text-center mb-6">
            <div className="text-5xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Delete Your Stats?
            </h2>
            <p className="text-gray-600">
              This action cannot be undone. All your game statistics will be permanently deleted.
            </p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-red-900 mb-2">This will delete:</h3>
            <ul className="text-sm text-red-800 space-y-1">
              <li>• Username: <span className="font-semibold">{username}</span></li>
              <li>• All game history and sessions</li>
              <li>• Total wins, perfect games, and streaks</li>
              <li>• Your position on the leaderboard</li>
              <li>• Average completion times and stats</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={onConfirm}
              className="w-full px-6 py-3 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
            >
              Yes, Delete My Stats
            </button>
            
            <button
              onClick={onCancel}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              You can create a new username and start fresh anytime
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

