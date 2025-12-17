import React, { useEffect, useState } from "react";
import API, { setAuthToken } from "../../api";

export default function ResultsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
    API.get("/admin/submissions?page=1&pageSize=50")
      .then((r) => setItems((r.data.items || r.data || []).slice ? r.data.items : (r.data.items || [])))
      .catch((e) => setError(e?.response?.data?.message || e.message || "Failed to load submissions"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-sm text-slate-600">Loading...</div>;
  if (error) return <div className="p-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">{error}</div>;

  const filtered = items.filter(s => {
    if (!query) return true;
    const term = query.toLowerCase();
    return (
      String(s.id).includes(term) ||
      (s.user?.name || '').toLowerCase().includes(term) ||
      (s.user?.email || '').toLowerCase().includes(term) ||
      (s.majorName || s.majorCode || '').toLowerCase().includes(term) ||
      (s.subMajorName || s.subMajorCode || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-primary-900">User Results</h3>
        <input className="w-64 border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="Search by id, name, email..." value={query} onChange={e=>setQuery(e.target.value)} />
      </div>
      {filtered.map((s) => (
        <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <div className="text-[11px] text-slate-500">{new Date(s.createdAt).toLocaleString()}</div>
              <div className="text-sm font-semibold">Submission #{s.id}</div>
              {s.user && (
                <div className="text-xs text-slate-600">{s.user.name} · {s.user.email} · {s.user.role}</div>
              )}
            </div>
            <div className="px-2 py-1 rounded bg-primary-100 text-primary-700 text-xs border border-primary-300">Score: {s.score}</div>
          </div>
          <div className="grid md:grid-cols-2 gap-3 mt-3">
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-500">Major</div>
              <div className="text-sm font-medium">{s.majorName || s.majorCode || '—'}</div>
            </div>
            <div className="rounded-lg border border-slate-200 p-3">
              <div className="text-[11px] uppercase tracking-wide text-slate-500">Sub-major</div>
              <div className="text-sm font-medium">{s.subMajorName || s.subMajorCode || '—'}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
