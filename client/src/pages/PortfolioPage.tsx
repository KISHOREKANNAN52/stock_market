import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Plus, Trash2, Download, TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import api from '../utils/api';
import { PortfolioData, PortfolioItem } from '../types';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

const NIFTY_SYMBOLS = [
  'RELIANCE','TCS','HDFCBANK','INFY','ICICIBANK','HINDUNILVR','ITC','SBIN',
  'BHARTIARTL','KOTAKBANK','LT','HCLTECH','ASIANPAINT','AXISBANK','MARUTI',
  'WIPRO','TITAN','SUNPHARMA','BAJFINANCE','TATAMOTORS','NESTLEIND','ONGC',
];

const PortfolioPage: React.FC = () => {
  const navigate = useNavigate();
  const [pf, setPf] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ symbol: 'RELIANCE', qty: '', buyPrice: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const fetchPortfolio = async () => {
    try {
      const r = await api.get('/portfolio');
      setPf(r.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchPortfolio(); }, []);

  const addStock = async () => {
    setError('');
    const qty = parseInt(form.qty);
    const buyPrice = parseFloat(form.buyPrice);
    if (!qty || !buyPrice || qty <= 0 || buyPrice <= 0) {
      setError('Please enter valid qty and buy price'); return;
    }
    setSubmitting(true);
    try {
      await api.post('/portfolio', { symbol: form.symbol, qty, buyPrice });
      await fetchPortfolio();
      setShowForm(false);
      setForm({ symbol: 'RELIANCE', qty: '', buyPrice: '' });
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to add stock');
    } finally { setSubmitting(false); }
  };

  const removeStock = async (symbol: string) => {
    if (!confirm(`Remove ${symbol} from portfolio?`)) return;
    await api.delete(`/portfolio/${symbol}`);
    fetchPortfolio();
  };

  const exportCSV = () => {
    if (!pf?.items.length) return;
    const rows = [
      ['Symbol', 'Qty', 'Buy Price', 'CMP', 'P&L', 'P&L%'],
      ...pf.items.map(i => [
        i.symbol, i.qty, i.buyPrice.toFixed(2), i.cmp.toFixed(2),
        i.pnl.toFixed(2), ((i.pnl / (i.buyPrice * i.qty)) * 100).toFixed(2) + '%'
      ])
    ];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'portfolio.csv'; a.click();
  };

  const sectorData = (() => {
    const map: Record<string, number> = {};
    pf?.items.forEach(i => { map[i.sector || 'Other'] = (map[i.sector || 'Other'] || 0) + i.cmp * i.qty; });
    return Object.entries(map).map(([name, value]) => ({ name, value: +value.toFixed(0) }));
  })();

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-slate-400 animate-pulse">Loading portfolio...</div></div>;

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Briefcase size={18} className="text-blue-400" /> Portfolio</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track your NIFTY 50 investments</p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-blue-900/40 text-slate-400 text-xs hover:text-white transition-all">
            <Download size={12} /> Export
          </button>
          <button onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-all">
            <Plus size={12} /> Add Stock
          </button>
        </div>
      </div>

      {/* Add Stock Form */}
      {showForm && (
        <div className="card p-5 border-blue-600/30 animate-slide-up">
          <h3 className="text-sm font-semibold text-white mb-4">Add Stock to Portfolio</h3>
          {error && <div className="mb-3 text-xs text-red-400 bg-red-500/10 px-3 py-2 rounded-lg">{error}</div>}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Symbol</label>
              <select value={form.symbol} onChange={e => setForm(f => ({ ...f, symbol: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg bg-navy-900 border border-blue-900/40 text-white text-sm focus:outline-none focus:border-blue-500">
                {NIFTY_SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Quantity</label>
              <input type="number" min="1" placeholder="e.g. 10"
                value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg bg-navy-900 border border-blue-900/40 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
            <div>
              <label className="text-xs text-slate-400 mb-1 block">Buy Price (₹)</label>
              <input type="number" min="0.01" step="0.01" placeholder="e.g. 2500"
                value={form.buyPrice} onChange={e => setForm(f => ({ ...f, buyPrice: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg bg-navy-900 border border-blue-900/40 text-white text-sm focus:outline-none focus:border-blue-500" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={addStock} disabled={submitting}
              className="px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-all disabled:opacity-50">
              {submitting ? 'Adding...' : 'Add to Portfolio'}
            </button>
            <button onClick={() => setShowForm(false)}
              className="px-4 py-2 rounded-lg border border-blue-900/40 text-slate-400 text-sm hover:text-white transition-all">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Summary KPIs */}
      {pf && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[
            { label: 'Total Invested', value: `₹${(pf.totalInvested || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-white' },
            { label: 'Current Value', value: `₹${pf.totalValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: 'text-white' },
            { label: 'Total P&L', value: `${pf.totalPnl >= 0 ? '+' : ''}₹${pf.totalPnl.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`, color: pf.totalPnl >= 0 ? 'text-green-400' : 'text-red-400' },
            { label: 'P&L %', value: `${pf.totalInvested ? ((pf.totalPnl / pf.totalInvested) * 100).toFixed(2) : 0}%`, color: pf.totalPnl >= 0 ? 'text-green-400' : 'text-red-400' },
          ].map(k => (
            <div key={k.label} className="card p-4">
              <div className="text-xs text-slate-500 mb-1">{k.label}</div>
              <div className={`text-lg font-bold font-mono ${k.color}`}>{k.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Charts + Holdings */}
      {pf?.items.length ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Sector pie */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-white mb-3">Allocation by Sector</h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={sectorData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={40}>
                  {sectorData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#101f35', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, '']} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* P&L bar */}
          <div className="card p-4 lg:col-span-2">
            <h3 className="text-sm font-semibold text-white mb-3">P&L by Stock</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={pf.items.slice(0, 8).map(i => ({ name: i.symbol, pnl: +i.pnl.toFixed(0) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v}`} width={55} />
                <Tooltip contentStyle={{ background: '#101f35', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: any) => [`₹${Number(v).toLocaleString('en-IN')}`, 'P&L']} />
                <Bar dataKey="pnl" radius={[3, 3, 0, 0]}
                  fill="#3b82f6"
                  // Color bars by positive/negative
                  label={false}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : null}

      {/* Holdings table */}
      {!pf?.items.length ? (
        <div className="card p-12 text-center">
          <Briefcase size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Your portfolio is empty.</p>
          <p className="text-xs text-slate-600 mt-1">Add stocks to start tracking your investments.</p>
          <button onClick={() => setShowForm(true)}
            className="mt-4 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-all">
            + Add First Stock
          </button>
        </div>
      ) : (
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Holdings</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-blue-900/30">
                  {['Symbol', 'Qty', 'Buy Price', 'CMP', 'Invested', 'Current Value', 'P&L', 'P&L%', ''].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-slate-500 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {pf?.items.map(item => {
                  const invested = item.buyPrice * item.qty;
                  const current = item.cmp * item.qty;
                  const pnlPct = ((item.pnl / invested) * 100).toFixed(2);
                  const pos = item.pnl >= 0;
                  return (
                    <tr key={item.symbol} className="border-b border-blue-900/10 hover:bg-white/5 transition-colors">
                      <td className="py-2.5 px-3">
                        <button onClick={() => navigate(`/stock/${item.symbol}`)} className="font-bold text-blue-400 hover:underline font-mono">{item.symbol}</button>
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">{item.qty}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-300">₹{item.buyPrice.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-mono text-white">₹{item.cmp.toFixed(2)}</td>
                      <td className="py-2.5 px-3 font-mono text-slate-400">₹{invested.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="py-2.5 px-3 font-mono text-white">₹{current.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</td>
                      <td className="py-2.5 px-3">
                        <span className={`flex items-center gap-1 font-mono font-semibold ${pos ? 'text-green-400' : 'text-red-400'}`}>
                          {pos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {pos ? '+' : ''}₹{item.pnl.toFixed(0)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className={`badge ${pos ? 'badge-green' : 'badge-red'}`}>{pos ? '+' : ''}{pnlPct}%</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <button onClick={() => removeStock(item.symbol)} className="text-slate-600 hover:text-red-400 transition-colors">
                          <Trash2 size={12} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PortfolioPage;
