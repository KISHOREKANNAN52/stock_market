// ============================================================
// NewsPage.tsx
// ============================================================
import React, { useEffect, useState } from 'react';
import { Newspaper, ExternalLink } from 'lucide-react';
import api from '../utils/api';
import { NewsItem } from '../types';

const CATEGORIES = ['All', 'Markets', 'Corporate', 'Macro', 'Sector', 'Regulatory', 'Commodity'];
const SENT_COLOR: Record<string, string> = { positive: 'badge-green', negative: 'badge-red', neutral: 'badge-gray' };

export const NewsPage: React.FC = () => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [cat, setCat] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/news${cat !== 'All' ? `?category=${cat}` : ''}`)
      .then(r => setNews(r.data))
      .finally(() => setLoading(false));
  }, [cat]);

  return (
    <div className="p-4 lg:p-6 space-y-5 animate-fade-in">
      <div>
        <h1 className="text-xl font-bold text-white flex items-center gap-2"><Newspaper size={18} className="text-blue-400" /> Market News</h1>
        <p className="text-xs text-slate-500 mt-0.5">Latest updates from Indian equity markets</p>
      </div>
      {/* Category filter */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${cat === c ? 'bg-blue-600 text-white' : 'bg-navy-800 text-slate-400 border border-blue-900/30 hover:text-white'}`}>
            {c}
          </button>
        ))}
      </div>
      {loading ? <div className="text-slate-400 text-sm animate-pulse p-8">Loading news...</div> : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {news.map(n => (
            <div key={n.id} className="card p-4 hover:border-blue-600/30 transition-all group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`badge ${SENT_COLOR[n.sentiment]}`}>{n.sentiment}</span>
                    <span className="badge badge-blue text-[10px]">{n.category}</span>
                  </div>
                  <h3 className="text-sm font-medium text-white leading-snug group-hover:text-blue-300 transition-colors">{n.title}</h3>
                  <div className="flex items-center gap-2 mt-2 text-[10px] text-slate-500">
                    <span className="font-medium text-slate-400">{n.source}</span>
                    <span>·</span>
                    <span>{n.time}</span>
                  </div>
                </div>
                <a href={n.url} target="_blank" rel="noreferrer"
                  className="flex-shrink-0 p-1.5 text-slate-600 hover:text-blue-400 transition-colors">
                  <ExternalLink size={13} />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewsPage;
