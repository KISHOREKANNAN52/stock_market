import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './context/authStore';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import StockDetail from './pages/StockDetail';
import PortfolioPage from './pages/PortfolioPage';
import PredictionPage from './pages/PredictionPage';
import NewsPage from './pages/NewsPage';
import WatchlistPage from './pages/WatchlistPage';
import AlertsPage from './pages/AlertsPage';
import MarketReportPage from './pages/MarketReportPage';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthStore();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const App: React.FC = () => {
  const { user } = useAuthStore();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="stock/:symbol" element={<StockDetail />} />
        <Route path="portfolio" element={<PortfolioPage />} />
        <Route path="predict" element={<PredictionPage />} />
        <Route path="news" element={<NewsPage />} />
        <Route path="watchlist" element={<WatchlistPage />} />
        <Route path="alerts" element={<AlertsPage />} />
        <Route path="report" element={<MarketReportPage />} />
      </Route>
    </Routes>
  );
};

export default App;
