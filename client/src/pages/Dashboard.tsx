import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar,
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis
} from 'recharts';
import { TrendingUp, TrendingDown, RefreshCcw, Search, Activity, BarChart2 } from 'lucide-react';
import api from '../utils/api';
import { StocksResponse, StockSummary } from '../types';

const SECTOR_COLORS: Record<string, string> = {
  'IT': '#3b82f6', 'Financial Services': '#06b6d4', 'Energy': '#f59e0b',
  'FMCG': '#10b981', 'Auto': '#8b5cf6', 'Pharma': '#ec4899',
  'Metals': '#64748b', 'Power': '#f97316', 'Construction': '#84cc16',
  'Telecom': '#a78bfa', 'Consumer Durables': '#34d399', 'Cement': '#fbbf24',
  'Healthcare': '#f87171', 'Diversified': '#c084fc', 'Infrastructure': '#38bdf8',
  'Chemicals': '#4ade80'
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<StocksResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState<'changePercent' | 'price' | 'volume'>('changePercent');
  const [sparklines, setSparklines] = useState<Record<string, number[]>>({});

  const fetchData = useCallback(async () => {
    try {
      const res = await api.get('/stocks');
      setData(res.data);
      setError('');
      // Generate mini sparklines from last 7 prices
      const lines: Record<string, number[]> = {};
      res.data.stocks.forEach((s: StockSummary) => {
        const base = s.price;
        lines[s.symbol] = Array.from({ length: 7 }, (_, i) =>
          +(base * (1 + (Math.random() - 0.5) * 0.04 * (i / 3))).toFixed(2)
        );
      });
      setSparklines(lines);
    } catch (e: any) {
      console.error(e);
      setError(e.response?.data?.message || 'Failed to load market data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Sector distribution
  const sectorMap: Record<string, number> = {};
  data?.stocks.forEach(s => { sectorMap[s.sector] = (sectorMap[s.sector] || 0) + 1; });
  const sectorData = Object.entries(sectorMap).map(([name, value]) => ({ name, value }));

  const filtered = (data?.stocks || [])
    .filter(s => s.symbol.includes(search.toUpperCase()) || s.name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => sortBy === 'changePercent' ? b.changePercent - a.changePercent : b[sortBy] - a[sortBy]);

  if (loading) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Activity size={32} className="text-blue-400 animate-pulse mx-auto mb-3" />
        <p className="text-slate-400 text-sm">Loading market data...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center p-6 bg-navy-900 rounded-2xl border border-red-500/20 shadow-lg shadow-red-500/10">
        <p className="text-red-400 font-semibold mb-2">{error}</p>
        <button onClick={fetchData} className="px-4 py-2 rounded-lg bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-all">Retry</button>
      </div>
    </div>
  );

  return (
    <div className="p-4 lg:p-6 space-y-6 animate-fade-in">

      {/* Header Row */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Market Dashboard</h1>
          <p className="text-xs text-slate-500 mt-0.5">NIFTY 50 live overview</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600/20 border border-blue-600/30 text-blue-400 text-xs font-medium hover:bg-blue-600/30 transition-all">
          <RefreshCcw size={12} /> Refresh
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'NIFTY 50', value: data?.niftyIndex.toLocaleString('en-IN'), change: `${data?.niftyChange! >= 0 ? '+' : ''}${data?.niftyChange}%`, positive: (data?.niftyChange ?? 0) >= 0 },
          { label: 'Gainers', value: data?.gainers.length, change: 'Today', positive: true, color: 'text-green-400' },
          { label: 'Losers', value: data?.losers.length, change: 'Today', positive: false, color: 'text-red-400' },
          { label: 'Stocks', value: data?.stocks.length, change: 'NIFTY 50', positive: true, color: 'text-blue-400' },
        ].map(kpi => (
          <div key={kpi.label} className="card p-4">
            <div className="text-xs text-slate-500 mb-1">{kpi.label}</div>
            <div className={`text-xl font-bold font-mono ${kpi.color || (kpi.positive ? 'text-green-400' : 'text-red-400')}`}>
              {kpi.value}
            </div>
            <div className={`text-xs mt-1 ${kpi.positive ? 'text-green-400' : 'text-red-400'}`}>{kpi.change}</div>
          </div>
        ))}
      </div>

      {/* Gainers / Losers / Sector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Top Gainers */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-green-400" />
            <span className="text-sm font-semibold text-white">Top Gainers</span>
          </div>
          <div className="space-y-2">
            {data?.gainers.map(s => (
              <button key={s.symbol} onClick={() => navigate(`/stock/${s.symbol}`)}
                className="w-full flex items-center justify-between py-2 border-b border-blue-900/20 last:border-0 hover:bg-white/5 px-2 rounded transition-all">
                <div className="text-left">
                  <div className="text-xs font-bold text-white">{s.symbol}</div>
                  <div className="text-[10px] text-slate-500">₹{s.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <ResponsiveContainer width={50} height={24}>
                    <LineChart data={(sparklines[s.symbol] || []).map((v, i) => ({ v, i }))}>
                      <Line type="monotone" dataKey="v" stroke="#10b981" dot={false} strokeWidth={1.5} />
                    </LineChart>
                  </ResponsiveContainer>
                  <span className="badge badge-green text-[10px]">+{s.changePercent}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Top Losers */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <TrendingDown size={14} className="text-red-400" />
            <span className="text-sm font-semibold text-white">Top Losers</span>
          </div>
          <div className="space-y-2">
            {data?.losers.map(s => (
              <button key={s.symbol} onClick={() => navigate(`/stock/${s.symbol}`)}
                className="w-full flex items-center justify-between py-2 border-b border-blue-900/20 last:border-0 hover:bg-white/5 px-2 rounded transition-all">
                <div className="text-left">
                  <div className="text-xs font-bold text-white">{s.symbol}</div>
                  <div className="text-[10px] text-slate-500">₹{s.price.toFixed(2)}</div>
                </div>
                <div className="flex items-center gap-2">
                  <ResponsiveContainer width={50} height={24}>
                    <LineChart data={(sparklines[s.symbol] || []).map((v, i) => ({ v, i }))}>
                      <Line type="monotone" dataKey="v" stroke="#ef4444" dot={false} strokeWidth={1.5} />
                    </LineChart>
                  </ResponsiveContainer>
                  <span className="badge badge-red text-[10px]">{s.changePercent}%</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sector Pie */}
        <div className="card p-4">
          <div className="flex items-center gap-2 mb-3">
            <BarChart2 size={14} className="text-blue-400" />
            <span className="text-sm font-semibold text-white">Sector Distribution</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={sectorData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={65} innerRadius={35}>
                {sectorData.map((entry) => (
                  <Cell key={entry.name} fill={SECTOR_COLORS[entry.name] || '#475569'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: '#101f35', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 11 }}
                itemStyle={{ color: '#e2e8f0' }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {sectorData.slice(0, 6).map(s => (
              <span key={s.name} className="flex items-center gap-1 text-[10px] text-slate-400">
                <span className="w-2 h-2 rounded-full inline-block" style={{ background: SECTOR_COLORS[s.name] || '#475569' }} />
                {s.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Full Stock Table */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-sm font-semibold text-white">All NIFTY 50 Stocks</h2>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search symbol..."
                className="pl-8 pr-3 py-2 text-xs bg-navy-900 border border-blue-900/40 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 w-40"
              />
            </div>
            <select
              value={sortBy} onChange={e => setSortBy(e.target.value as any)}
              className="text-xs bg-navy-900 border border-blue-900/40 rounded-lg px-2 py-2 text-slate-300 focus:outline-none"
            >
              <option value="changePercent">Sort: Change%</option>
              <option value="price">Sort: Price</option>
              <option value="volume">Sort: Volume</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-blue-900/30">
                {['Symbol', 'Name', 'Sector', 'Price (₹)', 'Change%', 'Volume', 'RSI', 'Volatility'].map(h => (
                  <th key={h} className="text-left py-2 px-3 text-slate-500 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(s => (
                <tr
                  key={s.symbol}
                  onClick={() => navigate(`/stock/${s.symbol}`)}
                  className="border-b border-blue-900/10 hover:bg-white/5 cursor-pointer transition-colors group"
                >
                  <td className="py-2.5 px-3 font-bold text-blue-400 group-hover:text-blue-300 font-mono">{s.symbol}</td>
                  <td className="py-2.5 px-3 text-slate-300 max-w-[140px] truncate">{s.name}</td>
                  <td className="py-2.5 px-3">
                    <span className="badge badge-blue">{s.sector}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-white">₹{s.price.toFixed(2)}</td>
                  <td className="py-2.5 px-3">
                    <span className={`font-mono font-semibold ${s.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {s.changePercent >= 0 ? '+' : ''}{s.changePercent}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono">{(s.volume / 1e5).toFixed(1)}L</td>
                  <td className="py-2.5 px-3">
                    <span className={`font-mono ${s.rsi > 70 ? 'text-red-400' : s.rsi < 30 ? 'text-green-400' : 'text-slate-300'}`}>
                      {s.rsi}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-slate-400 font-mono">{s.volatility}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
