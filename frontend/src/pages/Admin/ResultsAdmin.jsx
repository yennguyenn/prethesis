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
      .then((r) => {
        const data = r?.data?.items ?? r?.data ?? [];
        setItems(Array.isArray(data) ? data : []);
      })
      .catch((e) => setError(e?.response?.data?.message || e.message || "Failed to load submissions"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-sm text-slate-600">Loading...</div>;
  if (error) return <div className="p-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">{error}</div>;

  const filtered = items.filter((s) => {
    if (!query) return true;
    const term = query.toLowerCase();
    return (
      String(s.id || "").toLowerCase().includes(term) ||
      (s.user?.name || "").toLowerCase().includes(term) ||
      (s.user?.email || "").toLowerCase().includes(term) ||
      (s.majorName || s.majorCode || "").toLowerCase().includes(term) ||
      (s.subMajorName || s.subMajorCode || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-primary-900">User Results</h3>
        <input
          className="w-64 border border-slate-300 rounded-lg px-3 py-2 text-sm"
          placeholder="Search by id, name, email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {filtered.map((s) => {
        const details = s.details || {};
        const { decisionMatrix, normalizedMatrix, allScores } = details;

        // Build raw scores map
        const rawMap = {};
        if (decisionMatrix && typeof decisionMatrix === "object") {
          for (const [major, row] of Object.entries(decisionMatrix)) {
            const sum = Object.values(row).reduce((acc, v) => acc + (Number(v) || 0), 0);
            rawMap[major] = sum;
          }
        } else if (Array.isArray(allScores) && allScores.length > 0) {
          for (const r of allScores) {
            rawMap[r.code || r.name] = Number(r.raw ?? r.score) || 0;
          }
        }

        const rawEntries = Object.entries(rawMap).map(([major, score]) => ({ major, score }));
        rawEntries.sort((a, b) => b.score - a.score);

        const ranking = (Array.isArray(allScores) && allScores.length > 0)
          ? allScores.map((r) => ({ code: r.code || r.name, name: r.name || r.code, score: Number(r.score) || 0 }))
          : (details?.sawScores ? Object.entries(details.sawScores).map(([code, score]) => ({ code, name: code, score })) : []);
        ranking.sort((a, b) => b.score - a.score);

        return (
          <div key={s.id} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm mb-6">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-[11px] text-slate-500">{s.createdAt ? new Date(s.createdAt).toLocaleString() : "-"}</div>
                <div className="text-sm font-semibold">Submission #{s.id}</div>
                {s.user && (
                  <div className="text-xs text-slate-600">{s.user.name} · {s.user.email} · {s.user.role}</div>
                )}
              </div>
              <div className="px-2 py-1 rounded bg-primary-100 text-primary-700 text-xs border border-primary-300">Score: {s.score ?? '—'}</div>
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

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              {/* Left: Raw Scores + Decision Matrix */}
              <div className="flex flex-col gap-3">
                <div className="rounded-lg border border-slate-200 p-3">
                  {rawEntries.length === 0 ? (
                    <div className="text-sm text-slate-500">No raw scores available.</div>
                  ) : (
                    <div>
                      <h4 className="font-semibold text-primary-700 mb-2">Raw Scores</h4>
                      <table className="table-auto border mb-2 text-xs w-full">
                        <thead>
                          <tr>
                            <th className="border px-2">Major</th>
                            <th className="border px-2">Raw Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rawEntries.map((row, idx) => (
                            <tr key={row.major} className={idx === 0 ? 'bg-green-100 font-bold' : ''}>
                              <td className="border px-2">{row.major}</td>
                              <td className="border px-2">{row.score}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 p-3 overflow-auto">
                  {decisionMatrix ? (
                    <div>
                      <h4 className="font-semibold text-primary-700 mb-2">Decision Matrix</h4>
                      <table className="table-auto border mb-2 text-xs w-full">
                        <thead>
                          <tr>
                            <th className="border px-2">Major</th>
                            {Object.values(decisionMatrix)[0] && Object.keys(Object.values(decisionMatrix)[0]).map((c) => (
                              <th key={c} className="border px-2">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(decisionMatrix).map(([major, row]) => (
                            <tr key={major}>
                              <td className="border px-2">{major}</td>
                              {Object.values(row).map((v, i) => <td key={i} className="border px-2">{v}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">No decision matrix available.</div>
                  )}
                </div>
              </div>

              {/* Right: Normalized Matrix + Final Ranking */}
              <div className="flex flex-col gap-3">
                <div className="rounded-lg border border-slate-200 p-3 overflow-auto">
                  {normalizedMatrix ? (
                    <div>
                      <h4 className="font-semibold text-primary-700 mb-2">Normalized Matrix (0–1)</h4>
                      <table className="table-auto border mb-2 text-xs w-full">
                        <thead>
                          <tr>
                            <th className="border px-2">Major</th>
                            {Object.values(normalizedMatrix)[0] && Object.keys(Object.values(normalizedMatrix)[0]).map((c) => (
                              <th key={c} className="border px-2">{c}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {Object.entries(normalizedMatrix).map(([major, row]) => (
                            <tr key={major}>
                              <td className="border px-2">{major}</td>
                              {Object.values(row).map((v, i) => <td key={i} className="border px-2">{Number(v).toFixed(2)}</td>)}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">No normalized matrix available.</div>
                  )}
                </div>

                <div className="rounded-lg border border-slate-200 p-3 overflow-auto">
                  {ranking.length === 0 ? (
                    <div className="text-sm text-slate-500">No SAW ranking available.</div>
                  ) : (
                    <div>
                      <h4 className="font-semibold text-primary-700 mb-2">Final Ranking</h4>
                      <table className="table-auto border mb-2 text-xs w-full">
                        <thead>
                          <tr>
                            <th className="border px-2">Rank</th>
                            <th className="border px-2">Major</th>
                            <th className="border px-2">Score</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ranking.map((r, idx) => (
                            <tr key={r.code} className={idx === 0 ? 'bg-green-100 font-bold' : ''}>
                              <td className="border px-2">{idx + 1}</td>
                              <td className="border px-2">{r.name}</td>
                              <td className="border px-2">{Number(r.score).toFixed(4)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
