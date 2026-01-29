import React, { useEffect, useState } from 'react';
import API, { setAuthToken } from '../../api';

export default function CriteriaAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setAuthToken(token);
    API.get('/admin/criteria')
      .then((r) => setItems(r.data || []))
      .catch((e) => setError(e?.response?.data?.message || e.message || 'Failed to load criteria'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-sm">Loading...</div>;
  if (error) return <div className="p-6 text-sm text-red-700">{error}</div>;

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Criteria</h3>
      <div className="grid gap-3">
        {items.length === 0 && <div className="text-sm text-slate-500">No criteria found.</div>}
        {items.map(c => (
          <div key={c.id} className="p-3 border rounded-lg bg-white">
            <div className="text-sm font-medium">{c.name} <span className="text-xs text-slate-400">({c.code})</span></div>
            {c.description && <div className="text-xs text-slate-600 mt-1">{c.description}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}
