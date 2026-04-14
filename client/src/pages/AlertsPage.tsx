import React, { useEffect, useState } from 'react';
import { Trash2, Bell } from 'lucide-react';
import api from '../utils/api';
import { PriceAlert } from '../types';

const AlertsPage: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/alerts')
      .then(r => {
        setAlerts(r.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Unable to load alerts. Please try again.');
        setLoading(false);
      });
  }, []);

  const deleteAlert = async (id: string) => {
    try {
      await api.delete(`/alerts/${id}`);
      setAlerts(current => current.filter(alert => alert._id !== id));
    } catch {
      setError('Failed to delete alert.');
    }
  };

  return (
    <div className="p-4 lg:p-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Notifications</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your price alerts and see which notifications are active.</p>
        </div>
        <div className="flex items-center gap-2 text-slate-400 text-xs">
          <Bell size={16} className="text-amber-400" />
          Alerts are synced with your account.
        </div>
      </div>

      {loading ? (
        <div className="card p-6 text-slate-400">Loading alerts...</div>
      ) : error ? (
        <div className="card p-6 text-red-400">{error}</div>
      ) : alerts.length === 0 ? (
        <div className="card p-6 text-slate-400">No alerts set yet. Create alerts from any stock detail page.</div>
      ) : (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div key={alert._id} className="card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{alert.symbol}</div>
                <div className="text-lg font-bold text-white">₹{alert.targetPrice.toFixed(2)}</div>
                <div className="text-xs text-slate-400">
                  Notify when price is {alert.condition === 'GE' ? 'at or above' : 'at or below'} target.
                </div>
                <div className="text-[11px] text-slate-500 mt-1">{new Date(alert.createdAt).toLocaleString()}</div>
              </div>
              <div className="flex items-center gap-2">
                {alert.triggered && <span className="badge badge-green">Triggered</span>}
                <button
                  onClick={() => alert._id && deleteAlert(alert._id)}
                  className="px-3 py-2 rounded-lg border border-red-500/30 text-red-400 text-xs font-medium hover:bg-red-500/10 transition-all"
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AlertsPage;
