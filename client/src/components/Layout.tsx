import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import {
  LayoutDashboard, TrendingUp, Briefcase, BrainCircuit,
  Newspaper, Star, BarChart2, LogOut, Menu, X, ChevronRight,
  Activity, Bell, Sun, Moon
} from 'lucide-react';
import api from '../utils/api';

const NAV = [
  { to: '/',          icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/report',    icon: BarChart2,        label: 'Market Report' },
  { to: '/predict',   icon: BrainCircuit,     label: 'AI Prediction' },
  { to: '/portfolio', icon: Briefcase,        label: 'Portfolio' },
  { to: '/watchlist', icon: Star,             label: 'Watchlist' },
  { to: '/alerts',    icon: Bell,             label: 'Alerts' },
  { to: '/news',      icon: Newspaper,        label: 'News' },
];

const Layout: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('theme');
    return saved === 'light' || saved === 'dark' ? saved : 'dark';
  });
  const [niftyVal, setNiftyVal] = useState({ index: 24142.50, change: 0.45 });
  const [alertCount, setAlertCount] = useState(0);

  // Simulated live NIFTY ticker
  useEffect(() => {
    const id = setInterval(() => {
      setNiftyVal(prev => ({
        index: +(prev.index + (Math.random() - 0.48) * 8).toFixed(2),
        change: +((Math.random() - 0.48) * 0.3 + prev.change * 0.9).toFixed(2)
      }));
    }, 2000);
    return () => clearInterval(id);
  }, []);

  // Load alert count
  useEffect(() => {
    api.get('/alerts').then(r => setAlertCount(r.data.filter((a: any) => !a.triggered).length)).catch(() => {});
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove('light', 'dark');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = () => { logout(); navigate('/login'); };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-6 border-b border-blue-900/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Activity size={18} className="text-white" />
          </div>
          <div>
            <div className="font-bold text-white text-sm tracking-wide">NIFTY 50</div>
            <div className="text-[10px] text-blue-400 tracking-widest">ANALYTICS PRO</div>
          </div>
        </div>
      </div>

      {/* Live NIFTY */}
      <div className="mx-3 my-3 px-4 py-3 rounded-xl bg-navy-700 border border-blue-900/40">
        <div className="flex justify-between items-center">
          <span className="text-xs text-slate-400 font-mono">NIFTY 50</span>
          <span className="live-dot w-2 h-2 rounded-full bg-green-400 inline-block"></span>
        </div>
        <div className="text-lg font-bold text-white font-mono mt-0.5">
          {niftyVal.index.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </div>
        <div className={`text-xs font-medium ${niftyVal.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
          {niftyVal.change >= 0 ? '+' : ''}{niftyVal.change.toFixed(2)}%
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-2 space-y-0.5">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all group
              ${isActive
                ? 'bg-blue-600/20 text-blue-400 border border-blue-600/30'
                : 'text-slate-400 hover:bg-white/5 hover:text-white'}`
            }
          >
            {({ isActive }) => (
              <>
                <Icon size={16} className={isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-white'} />
                {label}
                {isActive && <ChevronRight size={12} className="ml-auto text-blue-400" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User section */}
      <div className="px-3 py-4 border-t border-blue-900/30">
        <div className="flex items-center gap-3 px-3 mb-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{user?.name}</div>
            <div className="text-[10px] text-slate-500 truncate">{user?.email}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-navy-900">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-shrink-0 flex-col bg-navy-800 border-r border-blue-900/30">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-64 bg-navy-800 flex flex-col border-r border-blue-900/30 animate-slide-up">
            <button onClick={() => setSidebarOpen(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
              <X size={18} />
            </button>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-14 flex-shrink-0 flex items-center justify-between px-4 bg-navy-800/80 backdrop-blur border-b border-blue-900/30">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:text-white">
            <Menu size={20} />
          </button>
          <div className="flex-1 lg:hidden" />
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/predict')}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600/20 border border-blue-600/30 text-blue-400 text-xs font-medium hover:bg-blue-600/30 transition-all"
            >
              <BrainCircuit size={12} /> AI Predict
            </button>
            <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-2 text-slate-400 hover:text-white transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => navigate('/alerts')} className="relative p-2 text-slate-400 hover:text-white">
              <Bell size={16} />
              {alertCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full" />
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
