import React, { useEffect, useState } from 'react';
import API, { setAuthToken } from '../../api';

export default function ResponsesAdmin(){
  const [data, setData] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(()=>{
    const token = localStorage.getItem('token');
    if (token) setAuthToken(token);
    API.get('/admin/responses?page=1&pageSize=50')
      .then(r => setData(r.data || { items: [], total: 0 }))
      .catch(e => setError(e?.response?.data?.message || e.message || 'Không thể tải phản hồi'))
      .finally(()=>setLoading(false));
  },[]);

  if (loading) return <div className="p-6 text-sm">Đang tải...</div>;
  if (error) return <div className="p-6 text-sm text-red-700">{error}</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Phản hồi ({data.total})</h3>
      </div>
      {data.items.length === 0 && <div className="text-sm text-slate-500">Chưa có phản hồi.</div>}
      {data.items.map(r => (
        <div key={r.id} className="p-3 border rounded-lg bg-white">
          <div className="text-sm font-medium">Phản hồi #{r.id} · {new Date(r.createdAt).toLocaleString()}</div>
          <div className="text-xs text-slate-600">Người dùng: {r.User ? `${r.User.name} · ${r.User.email}` : 'ẩn danh'}</div>
          <div className="mt-2 text-sm">Câu hỏi: {r.Question ? r.Question.text : r.questionId || '—'}</div>
          <div className="text-sm">Lựa chọn: {r.Option ? r.Option.text : r.optionId || '—'}</div>
          {r.answer && <pre className="text-xs mt-2 bg-gray-50 p-2 rounded text-slate-700 overflow-auto">{JSON.stringify(r.answer, null, 2)}</pre>}
        </div>
      ))}
    </div>
  );
}
