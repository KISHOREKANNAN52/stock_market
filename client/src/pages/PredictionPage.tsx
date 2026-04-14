import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, CartesianGrid, Legend } from 'recharts';
import { BrainCircuit, TrendingUp, TrendingDown, Minus, Zap } from 'lucide-react';
import api from '../utils/api';
import { PredictionResult } from '../types';

const SYMBOLS = [
  'RELIANCE','TCS','HDFCBANK','INFY','ICICIBANK','SBIN','HINDUNILVR','ITC',
  'BHARTIARTL','KOTAKBANK','LT','HCLTECH','MARUTI','WIPRO','TITAN',
  'SUNPHARMA','BAJFINANCE','TATAMOTORS','ONGC','AXISBANK',
];

const REC_STYLES: Record<string, string> = {
  BUY:  'border-green-500/40 bg-green-500/10 text-green-400',
  SELL: 'border-red-500/40 bg-red-500/10 text-red-400',
  HOLD: 'border-amber-500/40 bg-amber-500/10 text-amber-400',
};

const PredictionPage: React.FC = () => {
  const [params] = useSearchParams();
  const [symbol, setSymbol] = useState(params.get('symbol') || 'RELIANCE');
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const runPrediction = async () => {
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await api.post('/predict', { symbol });
      setResult(r.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Prediction failed');
    } finally { setLoading(false); }
  };

  // Auto-run if symbol comes from URL params
  useEffect(() => {
    if (params.get('symbol')) runPrediction();
  }, []);

  // Combine history + forecast for chart
  const chartData = result ? [
    ...result.history.map(h => ({ date: h.date.slice(5), actual: h.actual, predicted: undefined })),
    ...result.forecast.map(f => ({ date: f.date.slice(5), actual: undefined, predicted: f.predicted }))
  ] : [];

  const RecIcon = result?.recommendation === 'BUY' ? TrendingUp : result?.recommendation === 'SELL' ? TrendingDown : Minus;

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <BrainCircuit size={18} className="text-blue-400" /> AI Prediction Engine
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">Moving average crossover + RSI-based trend prediction</p>
      </div>

      {/* Input */}
      <div className="card p-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="text-xs text-slate-400 mb-1.5 block font-medium">Select Stock</label>
            <select value={symbol} onChange={e => setSymbol(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-navy-900 border border-blue-900/40 text-white text-sm focus:outline-none focus:border-blue-500">
              {SYMBOLS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={runPrediction} disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold text-sm transition-all disabled:opacity-50 shadow-lg shadow-blue-600/20">
              <Zap size={14} className={loading ? 'animate-spin' : ''} />
              {loading ? 'Analysing...' : 'Run Prediction'}
            </button>
          </div>
        </div>
        {error && <div className="mt-3 text-sm text-red-400 bg-red-500/10 px-4 py-2 rounded-lg">{error}</div>}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-5 animate-fade-in">
          {/* Recommendation Card */}
          <div className={`card p-5 border ${REC_STYLES[result.recommendation]}`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                  result.recommendation === 'BUY' ? 'bg-green-500/20' : result.recommendation === 'SELL' ? 'bg-red-500/20' : 'bg-amber-500/20'
                }`}>
                  <RecIcon size={28} className={
                    result.recommendation === 'BUY' ? 'text-green-400' : result.recommendation === 'SELL' ? 'text-red-400' : 'text-amber-400'
                  } />
                </div>
                <div>
                  <div className="text-xs text-slate-400 mb-0.5">{result.symbol} — AI Recommendation</div>
                  <div className={`text-3xl font-bold ${
                    result.recommendation === 'BUY' ? 'text-green-400' : result.recommendation === 'SELL' ? 'text-red-400' : 'text-amber-400'
                  }`}>{result.recommendation}</div>
                  <div className="text-xs text-slate-400 mt-1">
                    Trend: <span className={result.trend === 'UP' ? 'text-green-400' : 'text-red-400'}>{result.trend}</span>
                    &nbsp;·&nbsp;Score: <span className="text-white font-mono">{result.score > 0 ? '+' : ''}{result.score}/10</span>
                  </div>
                </div>
              </div>
              {/* Confidence ring */}
              <div className="text-center">
                <div className="text-3xl font-bold font-mono text-white">{result.confidence}%</div>
                <div className="text-xs text-slate-400 mt-0.5">Confidence</div>
                <div className="w-full bg-navy-900 rounded-full h-1.5 mt-2">
                  <div className="h-1.5 rounded-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all" style={{ width: `${result.confidence}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Price KPIs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Current Price', value: `₹${result.currentPrice.toFixed(2)}`, color: 'text-white' },
              { label: '30-Day Target', value: `₹${result.predictedPrice.toFixed(2)}`, color: result.growthPercent >= 0 ? 'text-green-400' : 'text-red-400' },
              { label: 'Growth %', value: `${result.growthPercent >= 0 ? '+' : ''}${result.growthPercent}%`, color: result.growthPercent >= 0 ? 'text-green-400' : 'text-red-400' },
              { label: 'RSI', value: result.rsi, color: result.rsi > 70 ? 'text-red-400' : result.rsi < 30 ? 'text-green-400' : 'text-white' },
            ].map(k => (
              <div key={k.label} className="card p-4">
                <div className="text-[10px] text-slate-500 mb-1">{k.label}</div>
                <div className={`text-lg font-bold font-mono ${k.color}`}>{k.value}</div>
              </div>
            ))}
          </div>

          {/* Forecast Chart */}
          <div className="card p-4">
            <h3 className="text-sm font-semibold text-white mb-4">60-Day History + 30-Day Forecast</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="histGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="foreGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={result.growthPercent >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={result.growthPercent >= 0 ? '#10b981' : '#ef4444'} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(59,130,246,0.08)" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} interval={14} />
                <YAxis tick={{ fontSize: 9, fill: '#64748b' }} tickLine={false} axisLine={false} tickFormatter={v => `₹${v.toFixed(0)}`} width={65} domain={['auto', 'auto']} />
                <Tooltip
                  contentStyle={{ background: '#101f35', border: '1px solid rgba(59,130,246,0.2)', borderRadius: 8, fontSize: 11 }}
                  formatter={(v: any, name: string) => [`₹${Number(v).toFixed(2)}`, name === 'actual' ? 'Actual' : 'Forecast']}
                  labelStyle={{ color: '#94a3b8' }}
                />
                <Legend wrapperStyle={{ fontSize: 11, color: '#94a3b8' }} />
                <Area type="monotone" dataKey="actual" stroke="#3b82f6" fill="url(#histGrad)" strokeWidth={2} dot={false} connectNulls />
                <Area type="monotone" dataKey="predicted" stroke={result.growthPercent >= 0 ? '#10b981' : '#ef4444'} fill="url(#foreGrad)" strokeWidth={2} dot={false} strokeDasharray="5 3" connectNulls />
                <ReferenceLine x={result.history[result.history.length - 1]?.date.slice(5)} stroke="#475569" strokeDasharray="4 2" label={{ value: 'Today', fontSize: 9, fill: '#64748b' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Signals + Technicals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Signals */}
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Signal Breakdown</h3>
              <div className="space-y-2">
                {result.signals.map((s, i) => (
                  <div key={i} className="flex items-center gap-3 py-1.5 border-b border-blue-900/20 last:border-0">
                    <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      s.type === 'bullish' ? 'bg-green-400' : s.type === 'bearish' ? 'bg-red-400' : 'bg-amber-400'
                    }`} />
                    <span className="text-xs text-slate-300 flex-1">{s.label}</span>
                    <span className={`badge text-[10px] ${
                      s.type === 'bullish' ? 'badge-green' : s.type === 'bearish' ? 'badge-red' : 'badge-amber'
                    }`}>{s.type}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Summary */}
            <div className="card p-4">
              <h3 className="text-sm font-semibold text-white mb-3">Technical Levels</h3>
              <div className="space-y-2.5">
                {[
                  { label: 'SMA 20', value: `₹${result.sma20.toFixed(2)}`, badge: result.currentPrice > result.sma20 ? 'Price Above ✓' : 'Price Below ✗', positive: result.currentPrice > result.sma20 },
                  { label: 'SMA 50', value: `₹${result.sma50.toFixed(2)}`, badge: result.currentPrice > result.sma50 ? 'Price Above ✓' : 'Price Below ✗', positive: result.currentPrice > result.sma50 },
                  { label: 'SMA 200', value: `₹${result.sma200.toFixed(2)}`, badge: result.currentPrice > result.sma200 ? 'Uptrend ✓' : 'Downtrend ✗', positive: result.currentPrice > result.sma200 },
                  { label: 'Volatility (Ann.)', value: `${result.volatility}%`, badge: result.volatility < 25 ? 'Low Risk' : 'High Risk', positive: result.volatility < 25 },
                ].map(item => (
                  <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-blue-900/20 last:border-0">
                    <div>
                      <div className="text-xs text-slate-500">{item.label}</div>
                      <div className="text-sm font-mono font-semibold text-white">{item.value}</div>
                    </div>
                    <span className={`badge ${item.positive ? 'badge-green' : 'badge-red'}`}>{item.badge}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {!result && !loading && (
        <div className="card p-16 text-center">
          <BrainCircuit size={40} className="text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-sm">Select a stock and click <strong className="text-white">Run Prediction</strong></p>
          <p className="text-xs text-slate-600 mt-2">Uses Moving Average Crossover + RSI analysis to generate BUY/HOLD/SELL signals</p>
        </div>
      )}
    </div>
  );
};

export default PredictionPage;
