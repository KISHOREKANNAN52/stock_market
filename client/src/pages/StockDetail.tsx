import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  AreaChart, Area, BarChart, Bar, ComposedChart, Line,
  XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid
} from 'recharts';
import { ArrowLeft, TrendingUp, BrainCircuit, Star, Bell, Plus } from 'lucide-react';
import api from '../utils/api';
import { StockDetail } from '../types';

const PERIODS = ['1W', '1M', '3M', '6M', '1Y'];

const StockDetailPage: React.FC = () => {
  const { symbol } = useParams<{ symbol: string }>();
  const navigate = useNavigate();
  const [stock, setStock] = useState<StockDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [period, setPeriod] = useState('1M');
  const [histData, setHistData] = useState<any[]>([]);
  const [alertPrice, setAlertPrice] = useState('');
  const [showAlert, setShowAlert] = useState(false);
  const [watchlisted, setWatchlisted] = useState(false);
  const [tab, setTab] = useState<'price' | 'volume' | 'indicators'>('price');

  useEffect(() => {
    if (!symbol) return;
    setLoading(true);
    setError('');
    api.get(`/stocks/${symbol}`)
      .then(r => {
        setStock(r.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.message || 'Unable to load stock details');
        setLoading(false);
      });
  }, [symbol]);

  useEffect(() => {
    if (!symbol) return;
    api.get(`/stocks/${symbol}/history?period=${period}`)
      .then(r => {
        const enriched = r.data.map((d: any, i: number, arr: any[]) => {
          const slice = arr.slice(Math.max(0, i - 19), i + 1).map((x: any) => x.close);
          const sma20 = +(slice.reduce((a: number, b: number) => a + b, 0) / slice.length).toFixed(2);
          return { ...d, sma20, label: d.date.slice(5) };
        });
        setHistData(enriched);
      })
      .catch(err => {
        console.error(err);
        setError(err.response?.data?.message || 'Unable to load history');
      });
  }, [symbol, period]);

  const addAlert = async () => {
    const price = parseFloat(alertPrice);
    if (!price || !stock) return;
    await api.post('/alerts', {
      symbol, targetPrice: price,
      condition: price >= stock.price ? 'GE' : 'LE'
    });
    setShowAlert(false);
    setAlertPrice('');
    alert(`Alert set for ${symbol} at ₹${price}`);
  };

  const toggleWatchlist = async () => {
    if (watchlisted) {
      await api.delete(`/watchlist/${symbol}`);
    } else {
      await api.post('/watchlist', { symbol });
    }
    setWatchlisted(!watchlisted);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="text-slate-400 animate-pulse text-sm">Loading {symbol}...</div>
    </div>
  );
  if (error) return (
    <div className="p-6 card text-red-400 bg-red-500/5 border border-red-500/20">
      <p>{error}</p>
      <button onClick={() => window.location.reload()} className="mt-3 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm">Reload</button>
    </div>
  );
  if (!stock) return <div className="p-6 text-red-400">Stock not found.</div>;

  const isPositive = stock.changePercent >= 0;

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fade-in">
      {/* Back + Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white font-mono">{symbol}</h1>
              <span className="badge badge-blue text-xs">{stock.sector}</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">{stock.name}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleWatchlist}
            className={`p-2 rounded-lg border transition-all ${watchlisted ? 'border-amber-500/40 bg-amber-500/10 text-amber-400' : 'border-blue-900/40 text-slate-400 hover:text-amber-400'}`}>
            <Star size={15} fill={watchlisted ? 'currentColor' : 'none'} />
          </button>
          <button onClick={() => navigate(`/predict?symbol=${symbol}`)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-all">
            <BrainCircuit size={12} /> Predict
          </button>
        </div>
      </div>

      {/* Price KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { label: 'Price', value: `₹${stock.price.toFixed(2)}`, highlight: true },
          { label: 'Change', value: `${isPositive ? '+' : ''}${stock.changePercent}%`, positive: isPositive },
          { label: 'Open',  value: `₹${stock.open.toFixed(2)}` },
          { label: 'High',  value: `₹${stock.high.toFixed(2)}`, green: true },
          { label: 'Low',   value: `₹${stock.low.toFixed(2)}`, red: true },
          { label: 'Volume', value: `${(stock.volume / 1e5).toFixed(1)}L` },
          { label: 'Market Cap', value: `₹${(stock.marketCap / 1e12).toFixed(2)}T` },
        ].map(kpi => (
          <div key={kpi.label} className="card p-3">
            <div className="text-[10px] text-slate-500 mb-1">{kpi.label}</div>
            <div className={`text-sm font-bold font-mono ${
              kpi.highlight ? 'text-white' :
              kpi.positive !== undefined ? (kpi.positive ? 'text-green-400' : 'text-red-400') :
              kpi.green ? 'text-green-400' : kpi.red ? 'text-red-400' : 'text-slate-200'
            }`}>{kpi.value}</div>
          </div>
        ))}
      </div>

      {/* Chart Card */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          {/* Tabs */}
          <div className="flex gap-1">
            {(['price', 'volume', 'indicators'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`px-3 py-1.5 text-xs rounded-lg font-medium capitalize transition-all ${tab === t ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                {t}
              </button>
            ))}
          </div>
          {/* Period */}
          <div className="flex gap-1">
            {PERIODS.map(p => (
              <button key={p} onClick={() => setPeriod(p)}
                className={`px-2.5 py-1 text-xs rounded font-mono transition-all ${period === p ? 'bg-blue-600/30 text-blue-400 border border-blue-600/40' : 'text-slate-500 hover:text-white'}`}>
                {p}
              </button>
            ))}
          </div>
        </div>

        {tab === 'price' && (
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={histData}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={isPositive ? '#10b981' : '#ef4444'} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v.toFixed(0)}`} width={65} domain={['auto', 'auto']} />
              <Tooltip
                contentStyle={{ background: '#101f35', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 11 }}
                formatter={(v: any) => [`₹${Number(v).toFixed(2)}`, 'Close']}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="close" stroke={isPositive ? '#10b981' : '#ef4444'} strokeWidth={2} fill="url(#priceGrad)" dot={false} />
              <Line type="monotone" dataKey="sma20" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        )}

        {tab === 'volume' && (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={histData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => `${(v / 1e5).toFixed(0)}L`} width={50} />
              <Tooltip
                contentStyle={{ background: '#101f35', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 11 }}
                formatter={(v: any) => [`${(Number(v) / 1e5).toFixed(1)}L`, 'Volume']}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="volume" fill="#3b82f6" opacity={0.8} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}

        {tab === 'indicators' && (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={200}>
              <ComposedChart data={histData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />
                <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} tickLine={false} axisLine={false} width={60} domain={['auto', 'auto']} />
                <Tooltip contentStyle={{ background: '#101f35', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 11 }} labelStyle={{ color: '#94a3b8' }} />
                <Line type="monotone" dataKey="close" stroke="#3b82f6" dot={false} strokeWidth={1.5} name="Price" />
                <Line type="monotone" dataKey="sma20" stroke="#f59e0b" dot={false} strokeWidth={1.5} name="SMA20" strokeDasharray="4 2" />
              </ComposedChart>
            </ResponsiveContainer>

            {/* Technicals Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: 'RSI (14)', value: stock.rsi, badge: stock.rsi > 70 ? 'Overbought' : stock.rsi < 30 ? 'Oversold' : 'Neutral', color: stock.rsi > 70 ? 'badge-red' : stock.rsi < 30 ? 'badge-green' : 'badge-gray' },
                { label: 'SMA 20', value: `₹${stock.sma20?.toFixed(2)}`, badge: stock.price > stock.sma20 ? 'Above' : 'Below', color: stock.price > stock.sma20 ? 'badge-green' : 'badge-red' },
                { label: 'SMA 50', value: `₹${stock.sma50?.toFixed(2)}`, badge: stock.price > stock.sma50 ? 'Above' : 'Below', color: stock.price > stock.sma50 ? 'badge-green' : 'badge-red' },
                { label: 'Volatility', value: `${stock.volatility}%`, badge: stock.volatility > 30 ? 'High' : 'Low', color: stock.volatility > 30 ? 'badge-amber' : 'badge-blue' },
              ].map(item => (
                <div key={item.label} className="bg-navy-900/60 rounded-lg p-3">
                  <div className="text-[10px] text-slate-500 mb-1">{item.label}</div>
                  <div className="text-sm font-bold font-mono text-white mb-1.5">{item.value}</div>
                  <span className={`badge text-[10px] ${item.color}`}>{item.badge}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fundamental + Alert row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Fundamentals */}
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-white mb-3">Fundamentals</h3>
          <div className="space-y-2.5">
            {[
              { label: 'P/E Ratio', value: stock.peRatio?.toFixed(1) },
              { label: 'EPS', value: `₹${stock.eps?.toFixed(2)}` },
              { label: 'Market Cap', value: `₹${(stock.marketCap / 1e9).toFixed(1)}B` },
              { label: '52W High', value: `₹${(stock.price * 1.25).toFixed(2)}` },
              { label: '52W Low', value: `₹${(stock.price * 0.72).toFixed(2)}` },
            ].map(f => (
              <div key={f.label} className="flex justify-between items-center py-1 border-b border-blue-900/20 last:border-0">
                <span className="text-xs text-slate-400">{f.label}</span>
                <span className="text-xs font-mono font-semibold text-white">{f.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Alert Panel */}
        <div className="card p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2"><Bell size={13} className="text-amber-400" /> Price Alert</h3>
            <button onClick={() => setShowAlert(!showAlert)}
              className="flex items-center gap-1 text-xs text-blue-400 hover:underline">
              <Plus size={12} /> Set Alert
            </button>
          </div>
          {showAlert && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400">Current price: <span className="text-white font-mono">₹{stock.price.toFixed(2)}</span></p>
              <input
                type="number" placeholder="Target price..."
                value={alertPrice} onChange={e => setAlertPrice(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-navy-900 border border-blue-900/40 rounded-lg text-white placeholder-slate-600 focus:outline-none focus:border-blue-500"
              />
              <button onClick={addAlert}
                className="w-full py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs transition-all">
                Confirm Alert
              </button>
            </div>
          )}
          {!showAlert && (
            <p className="text-xs text-slate-500">Get notified when {symbol} reaches your target price. Set above or below current price.</p>
          )}
          <div className="mt-4 pt-3 border-t border-blue-900/20">
            <button onClick={() => navigate('/predict')}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-blue-600/30 text-blue-400 text-xs font-medium hover:bg-blue-600/10 transition-all">
              <BrainCircuit size={12} /> Run AI Prediction for {symbol}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StockDetailPage;
