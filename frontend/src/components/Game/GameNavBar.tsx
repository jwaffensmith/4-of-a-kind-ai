interface GameNavBarProps {
  username: string | null;
  onViewStats: () => void;
  onChangeUsername: () => void;
  onDeleteStats: () => void;
}

export const GameNavBar = ({ 
  username, 
  onViewStats, 
  onChangeUsername, 
  onDeleteStats 
}: GameNavBarProps) => {
  if (!username) return null;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-4">
          
            <div className="relative group">
              <button className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-900 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors">
                <span className="text-lg">👤</span>
                <span>{username}</span>
                <svg className="w-4 h-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-1">
                  <button
                    onClick={onChangeUsername}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                  >
                    <span>🔄</span>
                    <span>Change Username</span>
                  </button>
                  <button
                    onClick={onDeleteStats}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                  >
                    <span>🗑️</span>
                    <span>Delete Stats</span>
                  </button>
                </div>
              </div>
            </div>
            
            <button
              onClick={onViewStats}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span>📊</span>
              <span>My Stats</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

