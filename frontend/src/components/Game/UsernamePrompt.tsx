import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface UsernamePromptProps {
  isOpen: boolean;
  onSubmit: (username: string) => void;
  onSkip: () => void;
  onCancel?: () => void;
  isChanging?: boolean;
}

export const UsernamePrompt = ({ isOpen, onSubmit, onSkip, onCancel, isChanging = false }: UsernamePromptProps) => {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');
  const [agreed, setAgreed] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    const trimmedUsername = username.trim();
    
    if (!trimmedUsername) {
      setError('Please enter a username');
      return;
    }
    
    if (trimmedUsername.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    
    if (trimmedUsername.length > 20) {
      setError('Username must be less than 20 characters');
      return;
    }
    
    if (!/^[a-zA-Z0-9_-]+$/.test(trimmedUsername)) {
      setError('Username can only contain letters, numbers, hyphens, and underscores');
      return;
    }
    
    if (!agreed) {
      setError('Please agree to have your stats stored');
      return;
    }
    
    onSubmit(trimmedUsername);
  };

  const handleSkip = () => {
    onSkip();
  };

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
            {onCancel && (
              <button
                onClick={onCancel}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Close"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            <div className="text-5xl mb-4">👤</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isChanging ? 'Change Username' : 'Welcome to Connections!'}
            </h2>
            <p className="text-gray-600">
              {isChanging ? 'Enter a new username' : 'Enter a username to track your stats and progress'}
            </p>
            <div className="mt-3 px-4 py-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800 font-medium">
                💡 No real name required - choose any username!
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  setError('');
                }}
                placeholder="e.g., PuzzleMaster, WordWizard123"
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                  error
                    ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
                }`}
                autoFocus
                maxLength={20}
              />
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
            </div>

            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => {
                    setAgreed(e.target.checked);
                    setError('');
                  }}
                  className="mt-1 h-4 w-4 text-gray-900 focus:ring-gray-900 border-gray-300 rounded"
                />
                <span className="ml-3 text-sm text-gray-700">
                  I understand that my username and game statistics (wins, streaks, completion times) will be stored. 
                  <span className="font-medium"> I can view and delete my data anytime.</span>
                </span>
              </label>
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
              >
                {isChanging ? 'Update Username' : 'Start Playing'}
              </button>
              
              {!isChanging && (
                <button
                  type="button"
                  onClick={handleSkip}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Skip (Play as Guest)
                </button>
              )}

              {isChanging && onCancel && (
                <button
                  type="button"
                  onClick={onCancel}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="text-xs text-gray-500 space-y-1">
              <p>✓ Your username is stored locally and on our server</p>
              <p>✓ Track your wins, streaks, and completion times</p>
              <p>✓ View your personal stats anytime</p>
              <p>✓ Delete your data anytime from the game menu</p>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

