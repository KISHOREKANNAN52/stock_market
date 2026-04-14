import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart2, Download, ArrowUpDown, TrendingUp, TrendingDown } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import api from '../utils/api';
import { StockSummary } from '../types';

type SortKey = 'changePercent' | 'price' | 'rsi' | 'volatility' | 'volume';

const getSignal = (s: StockSummary): { label: string; cls: string } => {
  if (s.rsi > 70) return { label: 'OVERBOUGHT', cls: 'badge-red' };
  if (s.rsi < 30) return { label: 'OVERSOLD', cls: 'badge-green' };
  if (s.changePercent > 2) return { label: 'STRONG BUY', cls: 'badge-green' };
  if (s.changePercent < -2) return { label: 'STRONG SELL', cls: 'badge-red' };
  if (s.changePercent > 0.5) return { label: 'BUY', cls: 'badge-blue' };
  if (s.changePercent < -0.5) return { label: 'SELL', cls: 'badge-red' };
  return { label: 'HOLD', cls: 'badge-amber' };
};

const MarketReportPage: React.FC = () => {
  const navigate = useNavigate();
  const [stocks, setStocks] = useState<StockSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortKey, setSortKey] = useState<SortKey>('changePercent');
  const [sortAsc, setSortAsc] = useState(false);

  useEffect(() => {
    api.get('/stocks').then(r => setStocks(r.data.stocks)).finally(() => setLoading(false));
  }, []);

  const sorted = [...stocks].sort((a, b) => {
    const d = a[sortKey] - b[sortKey];
    return sortAsc ? d : -d;
  });

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(false); }
  };

  const exportCSV = () => {
    const rows = [
      ['Symbol', 'Name', 'Sector', 'Price', 'Change%', 'RSI', 'Volatility', 'Volume', 'Signal'],
      ...sorted.map(s => [s.symbol, s.name, s.sector, s.price.toFixed(2), s.changePercent, s.rsi, s.volatility, s.volume, getSignal(s).label])
    ];
    const blob = new Blob([rows.map(r => r.join(',')).join('\n')], { type: 'text/csv' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'market_report.csv'; a.click();
  };

  // Sector performance bar
  const sectorPerf: Record<string, { total: number; count: number }> = {};
  stocks.forEach(s => {
    if (!sectorPerf[s.sector]) sectorPerf[s.sector] = { total: 0, count: 0 };
    sectorPerf[s.sector].total += s.changePercent;
    sectorPerf[s.sector].count++;
  });
  const sectorBars = Object.entries(sectorPerf)
    .map(([name, d]) => ({ name, avg: +(d.total / d.count).toFixed(2) }))
    .sort((a, b) => b.avg - a.avg);

  const Th: React.FC<{ label: string; k?: SortKey }> = ({ label, k }) => (
    <th onClick={() => k && toggleSort(k)}
      className={`text-left py-2 px-3 text-slate-500 font-medium whitespace-nowrap text-xs ${k ? 'cursor-pointer hover:text-white select-none' : ''}`}>
      <span className="flex items-center gap-1">{label}{k && <ArrowUpDown size={10} />}</span>
    </th>
  );

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-slate-400 animate-pulse text-sm">Loading report...</div></div>;

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><BarChart2 size={18} className="text-blue-400" /> Market Report</h1>
          <p className="text-xs text-slate-500 mt-0.5">Full NIFTY 50 quantitative report with signals</p>
        </div>
        <button onClick={exportCSV}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-900/40 text-slate-400 text-xs hover:text-white transition-all">
          <Download size={12} /> Export CSV
        </button>
      </div>

      {/* Sector performance chart */}
      <div className="card p-4">
        <h3 className="text-sm font-semibold text-white mb-4">Sector Performance (Avg Change%)</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={sectorBars} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" horizontal={false} />
            <XAxis type="number" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
            <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} width={110} />
            <Tooltip
              contentStyle={{ background: '#101f35', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 11 }}
              formatter={(v: any) => [`${Number(v).toFixed(2)}%`, 'Avg Change']}
            />
            <Bar dataKey="avg" radius={[0, 3, 3, 0]}>
              {sectorBars.map(entry => (
                <Cell key={entry.name} fill={entry.avg >= 0 ? '#10b981' : '#ef4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Full table */}
      <div className="card p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-blue-900/30">
                <Th label="Symbol" />
                <Th label="Sector" />
                <Th label="Price (₹)" k="price" />
                <Th label="Change%" k="changePercent" />
                <Th label="RSI" k="rsi" />
                <Th label="Vol%" k="volatility" />
                <Th label="Volume" k="volume" />
                <Th label="Signal" />
              </tr>
            </thead>
            <tbody>
              {sorted.map(s => {
                const sig = getSignal(s);
                return (
                  <tr key={s.symbol}
                    onClick={() => navigate(`/stock/${s.symbol}`)}
                    className="border-b border-blue-900/10 hover:bg-white/5 cursor-pointer transition-colors">
                    <td className="py-2.5 px-3 font-bold text-blue-400 font-mono">{s.symbol}</td>
                    <td className="py-2.5 px-3"><span className="badge badge-blue text-[10px]">{s.sector}</span></td>
                    <td className="py-2.5 px-3 font-mono text-white">₹{s.price.toFixed(2)}</td>
                    <td className="py-2.5 px-3">
                      <span className={`flex items-center gap-1 font-mono font-semibold ${s.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {s.changePercent >= 0 ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
                        {s.changePercent >= 0 ? '+' : ''}{s.changePercent}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`font-mono ${s.rsi > 70 ? 'text-red-400' : s.rsi < 30 ? 'text-green-400' : 'text-slate-300'}`}>{s.rsi}</span>
                    </td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{s.volatility}%</td>
                    <td className="py-2.5 px-3 text-slate-400 font-mono">{(s.volume / 1e5).toFixed(1)}L</td>
                    <td className="py-2.5 px-3"><span className={`badge ${sig.cls}`}>{sig.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MarketReportPage;
