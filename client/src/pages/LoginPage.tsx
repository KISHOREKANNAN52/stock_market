import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../context/authStore';
import { Activity, Eye, EyeOff, TrendingUp, BarChart2, BrainCircuit } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, register, loginAsGuest, loading } = useAuthStore();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) await login(form.email, form.password);
      else await register(form.name, form.email, form.password);
      navigate('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  const handleGuestBypass = () => {
    loginAsGuest();
    navigate('/');
  };

  const features = [
    { icon: TrendingUp,   label: 'Real-time Market Data',      desc: 'Live NIFTY 50 tracking' },
    { icon: BrainCircuit, label: 'AI-Powered Predictions',     desc: 'BUY/HOLD/SELL signals' },
    { icon: BarChart2,    label: 'Portfolio Simulator',        desc: 'Track P&L in real-time' },
  ];

  return (
    <div className="min-h-screen bg-navy-900 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 bg-gradient-to-br from-navy-800 via-navy-900 to-[#020812] border-r border-blue-900/30 relative overflow-hidden">
        {/* Background grid */}
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'linear-gradient(rgba(59,130,246,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(59,130,246,0.3) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

        {/* Glowing orb */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-xl shadow-blue-600/40">
              <Activity size={20} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-white tracking-wide">NIFTY 50</div>
              <div className="text-[10px] text-blue-400 tracking-widest">ANALYTICS PRO</div>
            </div>
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Professional-grade<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
              Stock Intelligence
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed mb-12">
            Quantitative analytics, AI predictions, and portfolio management for India's top 50 stocks.
          </p>

          <div className="space-y-4">
            {features.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-blue-900/30">
                <div className="w-9 h-9 rounded-lg bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                  <Icon size={16} className="text-blue-400" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">{label}</div>
                  <div className="text-xs text-slate-500">{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-600">
          © 2025 Nifty50 Analytics Pro — For educational purposes only
        </div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <Activity size={18} className="text-white" />
            </div>
            <span className="font-bold text-white">NIFTY 50 Analytics Pro</span>
          </div>

          <div className="card p-8 glow-blue">
            {/* Toggle */}
            <div className="flex rounded-lg bg-navy-900 p-1 mb-6">
              {['Login', 'Register'].map((label) => (
                <button
                  key={label}
                  onClick={() => { setIsLogin(label === 'Login'); setError(''); }}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                    (isLogin ? 'Login' : 'Register') === label
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <h2 className="text-xl font-bold text-white mb-1">
              {isLogin ? 'Welcome back' : 'Create account'}
            </h2>
            <p className="text-xs text-slate-500 mb-6">
              {isLogin ? 'Sign in to your analytics dashboard' : 'Start analyzing NIFTY 50 stocks today'}
            </p>

            {error && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block font-medium">Full Name</label>
                  <input
                    type="text" required placeholder="Rahul Sharma"
                    value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-navy-900 border border-blue-900/40 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              )}
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">Email</label>
                <input
                  type="email" required placeholder="you@example.com"
                  value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  className="w-full px-4 py-3 rounded-lg bg-navy-900 border border-blue-900/40 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 mb-1.5 block font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showPass ? 'text' : 'password'} required placeholder="••••••••"
                    value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    className="w-full px-4 py-3 pr-11 rounded-lg bg-navy-900 border border-blue-900/40 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full py-3 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <button
              type="button"
              onClick={handleGuestBypass}
              className="w-full py-3 rounded-lg border border-blue-600 text-blue-300 hover:text-white hover:bg-blue-600/10 text-sm font-medium transition-all mt-4"
            >
              Continue as Guest
            </button>

            <p className="text-center text-xs text-slate-500 mt-6">
              {isLogin ? "Don't have an account? " : 'Already registered? '}
              <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="text-blue-400 hover:underline">
                {isLogin ? 'Register' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
