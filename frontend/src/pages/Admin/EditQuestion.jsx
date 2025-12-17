import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API, { setAuthToken } from "../../api";

export default function EditQuestion(){
  const { id } = useParams();
  const navigate = useNavigate();
  const [question, setQuestion] = useState(null);
  const [text, setText] = useState("");
  const [levelId, setLevelId] = useState(1);
  const [options, setOptions] = useState([]);
  const [jsonErrors, setJsonErrors] = useState({}); // idx -> true when invalid
  const [majors, setMajors] = useState([]);
  const majorCodeSet = new Set((majors || []).map(m => m.code).filter(Boolean));

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
    // Load question and majors in parallel
    Promise.all([
      API.get(`/admin/questions/${id}`),
      API.get(`/admin/majors`)
    ]).then(([qr, mr]) => {
      const item = qr.data;
      setQuestion(item);
      setText(item.text || "");
      setLevelId(item.levelId || 1);
      setOptions((item.Options || []).map(o => ({ id: o.id, text: o.text, scoring: o.scoring || {} })));
      setMajors(mr.data || []);
    });
  }, [id]);

  const save = async () => {
    await API.put(`/admin/questions/${id}`, { text, levelId, options });
    alert("Saved");
    navigate(-1);
  };

  if (!question) return <div>Loading...</div>;
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h3 className="text-xl font-semibold mb-4">Edit Question #{id}</h3>
      <div className="space-y-4 bg-white border border-slate-200 rounded-xl p-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Text</label>
          <input className="w-full border border-slate-300 rounded-lg px-3 py-2" value={text} onChange={e=>setText(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">LevelId</label>
          <input className="w-32 border border-slate-300 rounded-lg px-3 py-2" type="number" value={levelId} onChange={e=>setLevelId(Number(e.target.value))} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold">Options</h4>
            <button className="px-3 py-1 rounded bg-primary-700 text-white text-sm" onClick={()=>setOptions(opts=>[...opts, { text: '', scoring: {} }])}>Add option</button>
          </div>
          <div className="space-y-3">
            {options.map((o, idx) => (
              <div key={o.id || idx} className="rounded-lg border border-slate-200 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <input className="flex-1 border border-slate-300 rounded-lg px-3 py-2" placeholder="Answer text" value={o.text} onChange={e=>{ const c=[...options]; c[idx].text=e.target.value; setOptions(c); }} />
                  <button className="px-2 py-1 rounded bg-red-100 text-red-700 text-xs border border-red-300" onClick={async()=>{
                    if (!confirm('Delete this option?')) return;
                    // If option has id, delete from backend too
                    if (o.id) {
                      try { await API.delete(`/admin/options/${o.id}`); } catch {}
                    }
                    setOptions(opts=>opts.filter((_,i)=>i!==idx));
                  }}>Remove</button>
                </div>
                {Number(levelId) === 1 ? (
                  <div className="space-y-2">
                    <div className="text-xs text-slate-600 mb-1">Scoring (Level 1 uses Major codes only)</div>
                    {/* Existing entries */}
                    <div className="space-y-2">
                      {Object.entries(o.scoring || {}).length === 0 && (
                        <div className="text-xs text-slate-500">No scores yet.</div>
                      )}
                      {Object.entries(o.scoring || {}).map(([code, pts]) => {
                        const isMajor = majorCodeSet.has(code);
                        return (
                          <div key={code} className={`flex items-center gap-2 p-2 rounded border ${isMajor ? 'border-slate-200 bg-slate-50' : 'border-amber-300 bg-amber-50'}`}>
                            <span className={`text-xs font-semibold ${isMajor ? 'text-slate-700' : 'text-amber-800'}`}>{code}</span>
                            {isMajor ? (
                              <input type="number" className="w-24 border border-slate-300 rounded px-2 py-1 text-sm" value={Number(pts) || 0}
                                onChange={e=>{
                                  const c=[...options];
                                  const v = Number(e.target.value) || 0;
                                  c[idx].scoring = { ...(c[idx].scoring||{}), [code]: v };
                                  setOptions(c);
                                }} />
                            ) : (
                              <>
                                <span className="text-xs">→</span>
                                <select className="border border-amber-300 rounded px-2 py-1 text-xs"
                                  onChange={e=>{
                                    const target = e.target.value;
                                    if (!target) return;
                                    const c=[...options];
                                    const value = Number(pts) || 0;
                                    const next = { ...(c[idx].scoring||{}) };
                                    delete next[code];
                                    next[target] = (Number(next[target]) || 0) + value;
                                    c[idx].scoring = next;
                                    setOptions(c);
                                  }}
                                  defaultValue=""
                                >
                                  <option value="" disabled>Select Major</option>
                                  {(majors||[]).map(m => (
                                    <option key={m.code} value={m.code}>{m.code}</option>
                                  ))}
                                </select>
                                <span className="text-xs text-amber-800">(convert {Number(pts)||0})</span>
                              </>
                            )}
                            <button className="ml-auto text-xs text-red-700 border border-red-300 bg-red-100 hover:bg-red-200 px-2 py-1 rounded"
                              onClick={()=>{
                                const c=[...options];
                                const next = { ...(c[idx].scoring||{}) };
                                delete next[code];
                                c[idx].scoring = next;
                                setOptions(c);
                              }}
                            >Remove</button>
                          </div>
                        );
                      })}
                    </div>
                    {/* Add new major score */}
                    <div className="flex items-center gap-2">
                      <select className="border border-slate-300 rounded px-2 py-1 text-sm" defaultValue="" onChange={e=>{
                        const sel = e.target.value;
                        if (!sel) return;
                        const c=[...options];
                        const next = { ...(c[idx].scoring||{}) };
                        next[sel] = Number(next[sel]) || 0;
                        c[idx].scoring = next;
                        setOptions(c);
                        e.target.value = "";
                      }}>
                        <option value="" disabled>Add Major code…</option>
                        {(majors||[]).map(m => (
                          <option key={m.code} value={m.code}>{m.code}</option>
                        ))}
                      </select>
                      <span className="text-xs text-slate-500">Enter points in the field above after adding.</span>
                    </div>
                    {/* Warning if non-major codes present */}
                    {Object.keys(o.scoring||{}).some(k=>!majorCodeSet.has(k)) && (
                      <div className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-2">Detected non-Major codes. Please convert them to Major codes for Level 1.</div>
                    )}
                  </div>
                ) : (
                  <>
                    <label className="block text-xs text-slate-600 mb-1">Scoring (JSON: {`{"SE":2,"AI":1}`})</label>
                    <textarea className={`w-full rounded-lg px-3 py-2 text-sm border ${jsonErrors[idx] ? 'border-red-400 focus:ring-red-200' : 'border-slate-300 focus:ring-primary-200'}`} rows={3} value={JSON.stringify(o.scoring || {})}
                      onChange={e=>{
                        const v = e.target.value;
                        const c=[...options];
                        try {
                          const parsed = JSON.parse(v);
                          c[idx].scoring = parsed;
                          setJsonErrors(prev => ({ ...prev, [idx]: false }));
                        } catch {
                          setJsonErrors(prev => ({ ...prev, [idx]: true }));
                        }
                        setOptions(c);
                      }} />
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 rounded bg-primary-700 text-white disabled:opacity-50" disabled={Object.values(jsonErrors).some(Boolean)} onClick={async()=>{
            // Create any new options without id in backend before saving question updates
            for (let i=0;i<options.length;i++) {
              const o = options[i];
              if (!o.id) {
                try {
                  const resp = await API.post(`/admin/questions/${id}/options`, { text: o.text, scoring: o.scoring || {} });
                  options[i] = { ...o, id: resp.data.id };
                } catch {}
              }
            }
            await save();
          }}>Save</button>
          <button className="px-4 py-2 rounded border border-slate-300" onClick={()=>navigate(-1)}>Back</button>
        </div>
      </div>
    </div>
  );
}
