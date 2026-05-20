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
    alert("Đã lưu");
    navigate(-1);
  };

  if (!question) return <div>Đang tải...</div>;
  return (
    <div className="max-w-3xl mx-auto p-6">
      <h3 className="text-xl font-semibold mb-4" style={{ color: "var(--brand-blue)" }}>Sửa câu hỏi #{id}</h3>
      <div className="space-y-4 bg-white border rounded-xl p-4" style={{ borderColor: 'var(--border-soft)' }}>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-700)' }}>Nội dung</label>
          <input className="w-full rounded-lg px-3 py-2" style={{ border: '1px solid var(--border-soft)', color: 'var(--ink-900)' }} value={text} onChange={e=>setText(e.target.value)} />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: 'var(--ink-700)' }}>Mức (LevelId)</label>
          <input className="w-32 rounded-lg px-3 py-2" style={{ border: '1px solid var(--border-soft)', color: 'var(--ink-900)' }} type="number" value={levelId} onChange={e=>setLevelId(Number(e.target.value))} />
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-semibold" style={{ color: 'var(--ink-700)' }}>Lựa chọn</h4>
            <button className="px-3 py-1 rounded text-white text-sm" style={{ background: "var(--brand-blue)" }} onClick={()=>setOptions(opts=>[...opts, { text: '', scoring: {} }])}>Thêm lựa chọn</button>
          </div>
          <div className="space-y-3">
            {options.map((o, idx) => (
              <div key={o.id || idx} className="rounded-lg border p-3" style={{ borderColor: 'var(--border-soft)' }}>
                <div className="flex items-center gap-2 mb-2">
                  <input className="flex-1 rounded-lg px-3 py-2" style={{ border: '1px solid var(--border-soft)', color: 'var(--ink-900)' }} placeholder="Nội dung đáp án" value={o.text} onChange={e=>{ const c=[...options]; c[idx].text=e.target.value; setOptions(c); }} />
                  <button className="px-2 py-1 rounded text-white text-xs" style={{ background: "var(--brand-red)" }} onClick={async()=>{
                    if (!confirm('Xóa lựa chọn này?')) return;
                    // If option has id, delete from backend too
                    if (o.id) {
                      try {
                        await API.delete(`/admin/options/${o.id}`);
                      } catch (error) {
                        console.warn('Failed to delete option', error);
                      }
                    }
                    setOptions(opts=>opts.filter((_,i)=>i!==idx));
                  }}>Xóa</button>
                </div>
                {Number(levelId) === 1 ? (
                  <div className="space-y-2">
                    <div className="text-xs mb-1" style={{ color: 'var(--ink-500)' }}>Chấm điểm (Mức 1 chỉ dùng mã Ngành)</div>
                    {/* Existing entries */}
                    <div className="space-y-2">
                      {Object.entries(o.scoring || {}).length === 0 && (
                        <div className="text-xs" style={{ color: 'var(--ink-500)' }}>Chưa có điểm.</div>
                      )}
                      {Object.entries(o.scoring || {}).map(([code, pts]) => {
                        const isMajor = majorCodeSet.has(code);
                        return (
                          <div key={code} className={`flex items-center gap-2 p-2 rounded border ${isMajor ? '' : ''}`} style={{ borderColor: isMajor ? 'var(--border-soft)' : 'rgba(225, 177, 106, 0.45)', background: isMajor ? 'var(--surface-muted)' : 'rgba(225, 177, 106, 0.12)' }}>
                            <span className="text-xs font-semibold" style={{ color: isMajor ? 'var(--ink-700)' : 'var(--brand-warm)' }}>{code}</span>
                            {isMajor ? (
                              <input type="number" className="w-24 rounded px-2 py-1 text-sm" style={{ border: '1px solid var(--border-soft)', color: 'var(--ink-900)' }} value={Number(pts) || 0}
                                onChange={e=>{
                                  const c=[...options];
                                  const v = Number(e.target.value) || 0;
                                  c[idx].scoring = { ...(c[idx].scoring||{}), [code]: v };
                                  setOptions(c);
                                }} />
                            ) : (
                              <>
                                <span className="text-xs" style={{ color: 'var(--ink-500)' }}>→</span>
                                <select className="rounded px-2 py-1 text-xs" style={{ border: '1px solid rgba(225, 177, 106, 0.45)', color: 'var(--ink-900)', background: '#fff' }}
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
                                  <option value="" disabled>Chọn Ngành</option>
                                  {(majors||[]).map(m => (
                                    <option key={m.code} value={m.code}>{m.code}</option>
                                  ))}
                                </select>
                                <span className="text-xs" style={{ color: 'var(--brand-warm)' }}>(chuyển {Number(pts)||0})</span>
                              </>
                            )}
                            <button className="ml-auto text-xs text-white px-2 py-1 rounded" style={{ background: "var(--brand-red)" }}
                              onClick={()=>{
                                const c=[...options];
                                const next = { ...(c[idx].scoring||{}) };
                                delete next[code];
                                c[idx].scoring = next;
                                setOptions(c);
                              }}
                            >Xóa</button>
                          </div>
                        );
                      })}
                    </div>
                    {/* Add new major score */}
                    <div className="flex items-center gap-2">
                      <select className="rounded px-2 py-1 text-sm" style={{ border: '1px solid var(--border-soft)', color: 'var(--ink-900)' }} defaultValue="" onChange={e=>{
                        const sel = e.target.value;
                        if (!sel) return;
                        const c=[...options];
                        const next = { ...(c[idx].scoring||{}) };
                        next[sel] = Number(next[sel]) || 0;
                        c[idx].scoring = next;
                        setOptions(c);
                        e.target.value = "";
                      }}>
                        <option value="" disabled>Thêm mã Ngành…</option>
                        {(majors||[]).map(m => (
                          <option key={m.code} value={m.code}>{m.code}</option>
                        ))}
                      </select>
                      <span className="text-xs" style={{ color: 'var(--ink-500)' }}>Nhập điểm ở ô phía trên sau khi thêm.</span>
                    </div>
                    {/* Warning if non-major codes present */}
                    {Object.keys(o.scoring||{}).some(k=>!majorCodeSet.has(k)) && (
                      <div className="text-xs rounded p-2" style={{ color: 'var(--brand-warm)', background: 'rgba(225,177,106,0.12)', border: '1px solid rgba(225,177,106,0.25)' }}>Phát hiện mã không thuộc Ngành. Vui lòng chuyển chúng về mã Ngành cho Mức 1.</div>
                    )}
                  </div>
                ) : (
                  <>
                    <label className="block text-xs mb-1" style={{ color: 'var(--ink-500)' }}>Chấm điểm (JSON: {`{"SE":2,"AI":1}`})</label>
                    <textarea className={`w-full rounded-lg px-3 py-2 text-sm border ${jsonErrors[idx] ? '' : ''}`} style={{ borderColor: jsonErrors[idx] ? 'var(--brand-red)' : 'var(--border-soft)' }} rows={3} value={JSON.stringify(o.scoring || {})}
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
          <button className="px-4 py-2 rounded text-white disabled:opacity-50" style={{ background: "var(--brand-blue)" }} disabled={Object.values(jsonErrors).some(Boolean)} onClick={async()=>{
            // Create any new options without id in backend before saving question updates
            for (let i=0;i<options.length;i++) {
              const o = options[i];
              if (!o.id) {
                try {
                  const resp = await API.post(`/admin/questions/${id}/options`, { text: o.text, scoring: o.scoring || {} });
                  options[i] = { ...o, id: resp.data.id };
                } catch (error) {
                  console.warn('Failed to create option', error);
                }
              }
            }
            await save();
          }}>Lưu</button>
          <button className="px-4 py-2 rounded border" style={{ borderColor: 'var(--border-soft)', color: 'var(--ink-700)' }} onClick={()=>navigate(-1)}>Quay lại</button>
        </div>
      </div>
    </div>
  );
}
