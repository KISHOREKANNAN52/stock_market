import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Star, Trash2, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import api from '../utils/api';
import { StockSummary } from '../types';

const ALL_SYMBOLS = [
  'RELIANCE','TCS','HDFCBANK','INFY','ICICIBANK','SBIN','BHARTIARTL','KOTAKBANK',
  'LT','HCLTECH','MARUTI','WIPRO','TITAN','SUNPHARMA','BAJFINANCE','TATAMOTORS',
  'NESTLEIND','ONGC','AXISBANK','HINDUNILVR','ITC',
];

const WatchlistPage: React.FC = () => {
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [stocks, setStocks] = useState<StockSummary[]>([]);
  const [adding, setAdding] = useState(false);
  const [newSymbol, setNewSymbol] = useState('RELIANCE');
  const [loading, setLoading] = useState(true);

  const fetchAll = async () => {
    try {
      const [wl, allStocks] = await Promise.all([api.get('/watchlist'), api.get('/stocks')]);
      setWatchlist(wl.data);
      setStocks(allStocks.data.stocks);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, []);

  const addSymbol = async () => {
    await api.post('/watchlist', { symbol: newSymbol });
    fetchAll();
    setAdding(false);
  };

  const removeSymbol = async (symbol: string) => {
    await api.delete(`/watchlist/${symbol}`);
    setWatchlist(prev => prev.filter(s => s !== symbol));
  };

  const watchedStocks = stocks.filter(s => watchlist.includes(s.symbol));

  if (loading) return <div className="flex items-center justify-center h-64"><div className="text-slate-400 animate-pulse text-sm">Loading watchlist...</div></div>;

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Star size={18} className="text-amber-400" /> Watchlist</h1>
          <p className="text-xs text-slate-500 mt-0.5">{watchlist.length} stocks tracked</p>
        </div>
        <button onClick={() => setAdding(!adding)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-medium hover:bg-blue-500 transition-all">
          <Plus size={12} /> Add Stock
        </button>
      </div>

      {adding && (
        <div className="card p-4 flex gap-3 items-end animate-slide-up">
          <div className="flex-1">
            <label className="text-xs text-slate-400 mb-1 block">Symbol</label>
            <select value={newSymbol} onChange={e => setNewSymbol(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-navy-900 border border-blue-900/40 text-white text-sm focus:outline-none focus:border-blue-500">
              {ALL_SYMBOLS.filter(s => !watchlist.includes(s)).map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <button onClick={addSymbol} className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-500 transition-all">Add</button>
          <button onClick={() => setAdding(false)} className="px-4 py-2.5 rounded-lg border border-blue-900/40 text-slate-400 text-sm hover:text-white transition-all">Cancel</button>
        </div>
      )}

      {watchedStocks.length === 0 ? (
        <div className="card p-16 text-center">
          <Star size={32} className="text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">Your watchlist is empty</p>
          <p className="text-xs text-slate-600 mt-1">Add stocks you want to monitor closely</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {watchedStocks.map(s => (
            <div key={s.symbol} className="card p-4 hover:border-blue-600/30 transition-all">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <button onClick={() => navigate(`/stock/${s.symbol}`)} className="font-bold text-blue-400 hover:underline font-mono text-sm">{s.symbol}</button>
                  <div className="text-[10px] text-slate-500 truncate max-w-[140px]">{s.name}</div>
                </div>
                <button onClick={() => removeSymbol(s.symbol)} className="text-slate-600 hover:text-red-400 transition-colors p-1">
                  <Trash2 size={12} />
                </button>
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-lg font-bold font-mono text-white">₹{s.price.toFixed(2)}</div>
                  <div className={`text-xs flex items-center gap-1 mt-0.5 ${s.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {s.changePercent >= 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                    {s.changePercent >= 0 ? '+' : ''}{s.changePercent}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-500">RSI</div>
                  <div className={`text-sm font-mono font-semibold ${s.rsi > 70 ? 'text-red-400' : s.rsi < 30 ? 'text-green-400' : 'text-white'}`}>{s.rsi}</div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-blue-900/20 grid grid-cols-2 gap-2">
                <div>
                  <div className="text-[10px] text-slate-500">Vol</div>
                  <div className="text-xs font-mono text-slate-300">{(s.volume / 1e5).toFixed(1)}L</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500">Volatility</div>
                  <div className="text-xs font-mono text-slate-300">{s.volatility}%</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WatchlistPage;
