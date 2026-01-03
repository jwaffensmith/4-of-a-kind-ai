import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { GameProvider } from './contexts/GameContext';
import { GameView } from './components/Game/GameView';
import { StatsPanel } from './components/Stats/StatsPanel';
import { Leaderboard } from './components/Stats/Leaderboard';
import { AdminLogin } from './components/Admin/AdminLogin';
import { AdminLayout } from './components/Admin/AdminLayout';
import { AdminStats } from './components/Admin/AdminStats';
import { PuzzleGenerator } from './components/Admin/PuzzleGenerator';
import { PuzzleList } from './components/Admin/PuzzleList';
import { useAdmin } from './hooks/useAdmin';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAdmin();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <GameProvider>
              <GameView />
            </GameProvider>
          }
        />
        
        <Route path="/stats" element={<StatsPanel />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        
        <Route path="/admin/login" element={<AdminLogin />} />
        
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminStats />} />
          <Route path="puzzles" element={<PuzzleList />} />
          <Route path="generate" element={<PuzzleGenerator />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
