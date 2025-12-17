import React, { useEffect, useState } from "react";
import API, { setAuthToken } from "../../api";

export default function QuestionList(){
  const [questions, setQuestions] = useState([]);
  const [qtext, setQtext] = useState("");
  const [level, setLevel] = useState(1);
  const [options, setOptions] = useState([
    { text: "", code: "", points: 1 },
    { text: "", code: "", points: 1 },
    { text: "", code: "", points: 1 },
    { text: "", code: "", points: 1 },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState("");
  const [majors, setMajors] = useState([]);
  const [submajors, setSubmajors] = useState([]);
  const availableList = Number(level) === 2 ? (submajors || []) : (majors || []);
  const firstCode = (availableList && availableList.length > 0) ? (availableList[0].code || "") : "";
  useEffect(()=> {
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
    setLoading(true);
    setError("");
    Promise.all([
      API.get(`/admin/questions${level ? `?levelId=${level}`: ''}`),
      API.get(`/admin/majors`),
      API.get(`/submajors`)
    ])
      .then(([qr, mr, sr])=>{
        setQuestions(qr.data.items || qr.data);
        const majorsList = mr.data || [];
        const subsList = sr.data || [];
        setMajors(majorsList);
        setSubmajors(subsList);
        // Backfill default codes for option rows if empty
        const defaultsFrom = Number(level) === 2 ? subsList : majorsList;
        if (defaultsFrom.length > 0) setOptions(opts => opts.map(o => ({ ...o, code: o.code || (defaultsFrom[0].code || "") })));
      })
      .catch(e=>setError(e?.response?.data?.message || e.message || "Failed to load questions"))
      .finally(()=>setLoading(false));
  }, []);
  const create = async () => {
    try {
      // Basic validation: require codes for all options
      const missing = options.find(o => !o.code);
      if (missing) {
        alert('Please select a Major code for all options.');
        return;
      }
      const payload = {
        text: qtext,
        level: Number(level) || 1,
        options: options.map(o => ({ text: o.text, scoring: { [o.code]: Number(o.points) || 0 } })),
      };
      await API.post("/admin/questions", payload);
      setQtext("");
      setOptions([
        { text: "", code: firstCode, points: 1 },
        { text: "", code: firstCode, points: 1 },
        { text: "", code: firstCode, points: 1 },
        { text: "", code: firstCode, points: 1 },
      ]);
      const r = await API.get(`/admin/questions?levelId=${level}`);
      setQuestions(r.data.items || r.data);
      setToast("Question created successfully");
      setTimeout(()=>setToast(""), 2000);
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Create failed");
    }
  }
  const remove = async (id) => {
    if (!confirm(`Delete question #${id}?`)) return;
    await API.delete(`/admin/questions/${id}`);
    setQuestions(qs => qs.filter(q => q.id !== id));
  }
  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-100 shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-primary-900">Create Question</h3>
            <p className="text-xs text-slate-600">Add questions and points for each option.</p>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-slate-600">Level</span>
            <select className="border border-slate-300 rounded-lg px-3 py-2" id="levelSel" value={level} onChange={async e=>{ const v=e.target.value; setLevel(v);
              const [qr, mr, sr] = await Promise.all([
                API.get(`/admin/questions?levelId=${v}`),
                API.get(`/admin/majors`),
                API.get(`/submajors`)
              ]);
              setQuestions(qr.data.items || qr.data);
              setMajors(mr.data || []);
              setSubmajors(sr.data || []);
              const list = Number(v) === 2 ? (sr.data || []) : (mr.data || []);
              if (list.length > 0) setOptions(opts => opts.map(o => ({ ...o, code: list[0].code || "" })));
            }}>
              <option value={1}>Level 1</option>
              <option value={2}>Level 2</option>
            </select>
          </div>
        </div>
        {toast && (<div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">{toast}</div>)}
        <div className="grid gap-4">
          <input className="w-full border border-slate-300 rounded-lg px-3 py-2" placeholder="Question text" value={qtext} onChange={e=>setQtext(e.target.value)} />
          {options.map((o,idx)=> (
            <div key={`${idx}-${o.code}`} className="grid md:grid-cols-3 gap-3">
              <input className="border border-slate-300 rounded-lg px-3 py-2" placeholder="Answer text" value={o.text} onChange={e=>{ const copy=[...options]; copy[idx].text=e.target.value; setOptions(copy);} } />
              <select className="border border-slate-300 rounded-lg px-3 py-2" value={o.code || firstCode} onChange={e=>{ const copy=[...options]; copy[idx].code=e.target.value; setOptions(copy);} }>
                {(availableList||[]).map(item => (
                  <option key={item.code} value={item.code}>{item.code}</option>
                ))}
              </select>
              <input className="border border-slate-300 rounded-lg px-3 py-2" placeholder="Points" type="number" value={o.points} onChange={e=>{ const copy=[...options]; copy[idx].points=Number(e.target.value); setOptions(copy);} } />
            </div>
          ))}
          <div className="flex items-center gap-3">
            <button onClick={()=>setOptions(opts=>[...opts,{ text: '', code: firstCode, points: 1 }])} className="px-4 py-2 rounded-xl border border-slate-300 bg-white text-slate-700 hover:bg-slate-50">Add option</button>
            <button onClick={create} className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-700 to-primary-500 text-white font-semibold shadow-md hover:shadow-lg">Create Question</button>
          </div>
        </div>
      </div>

      <div className="rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-100 shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-primary-900">All Questions</h3>
          {loading && <div className="text-xs text-slate-600">Loading...</div>}
        </div>
        {error && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}
        <div className="divide-y divide-slate-200">
          {questions.map(q => (
            <div key={q.id} className="py-4 flex items-start justify-between gap-4">
              <div>
                <div className="text-xs text-slate-500">#{q.id}</div>
                <div className="text-sm font-medium text-slate-900">{q.text}</div>
                <div className="mt-2 grid md:grid-cols-2 gap-2">
                  {(q.Options || []).map(opt => (
                    <div key={opt.id} className="text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1">• {opt.text}</div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <a href={`/admin/questions/edit/${q.id}`} className="px-3 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm">Edit</a>
                <button onClick={() => { if (!confirm(`Delete question #${q.id}?`)) return; remove(q.id); }} className="px-3 py-1 rounded-lg bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
