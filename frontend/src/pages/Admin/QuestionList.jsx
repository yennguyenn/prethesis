import React, { useEffect, useState } from "react";
import API, { setAuthToken } from "../../api";

export default function QuestionList(){
  const [questionsL1, setQuestionsL1] = useState([]);
  const [questionsL2, setQuestionsL2] = useState([]);
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
  const [openListGroup, setOpenListGroup] = useState('l1');
  const availableList = Number(level) === 2 ? (submajors || []) : (majors || []);
  const firstCode = (availableList && availableList.length > 0) ? (availableList[0].code || "") : "";
  useEffect(()=> {
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
    setLoading(true);
    setError("");
    Promise.all([
      API.get('/admin/questions?levelId=1'),
      API.get('/admin/questions?levelId=2'),
      API.get('/admin/majors'),
      API.get('/submajors')
    ])
      .then(([q1r, q2r, mr, sr])=>{
        setQuestionsL1(q1r.data.items || q1r.data);
        setQuestionsL2(q2r.data.items || q2r.data);
        const majorsList = mr.data || [];
        const subsList = sr.data || [];
        setMajors(majorsList);
        setSubmajors(subsList);
        if (majorsList.length > 0) setOptions(opts => opts.map(o => ({ ...o, code: o.code || (majorsList[0].code || "") })));
      })
      .catch(e=>setError(e?.response?.data?.message || e.message || "Không thể tải câu hỏi"))
      .finally(()=>setLoading(false));
  }, []);
  const create = async () => {
    try {
      // Basic validation: require codes for all options
      const missing = options.find(o => !o.code);
      if (missing) {
        alert('Vui lòng chọn mã ngành cho tất cả lựa chọn.');
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
      if (Number(level) === 2) setQuestionsL2(r.data.items || r.data);
      else setQuestionsL1(r.data.items || r.data);
      setOpenListGroup(Number(level) === 2 ? 'l2' : 'l1');
      setToast("Tạo câu hỏi thành công");
      setTimeout(()=>setToast(""), 2000);
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Tạo thất bại");
    }
  }
  const remove = async (id, lvl) => {
    if (!confirm(`Xóa câu hỏi #${id}?`)) return;
    await API.delete(`/admin/questions/${id}`);
    if (lvl === 2) setQuestionsL2(qs => qs.filter(q => q.id !== id));
    else setQuestionsL1(qs => qs.filter(q => q.id !== id));
  }
  return (
    <div className="space-y-6">
      <div style={{ borderRadius: 20, background: '#fff', border: '2px solid #ede9fe', boxShadow: '0 4px 24px rgba(139,92,246,0.08)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 22, height: 22 }}>
                <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#fff' }}>Tạo câu hỏi mới</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>Thêm câu hỏi và điểm cho từng lựa chọn</div>
            </div>
          </div>
          {/* Level toggle */}
          <div style={{ display: 'flex', background: 'rgba(255,255,255,0.15)', borderRadius: 10, padding: 3, gap: 3 }}>
            {[{ v: '1', label: 'Vòng 1 – Ngành' }, { v: '2', label: 'Vòng 2 – Chuyên ngành' }].map(({ v, label }) => (
              <button key={v}
                onClick={async () => {
                  setLevel(v);
                  const [qr, mr, sr] = await Promise.all([API.get(`/admin/questions?levelId=${v}`), API.get(`/admin/majors`), API.get(`/submajors`)]);
                  setQuestions(qr.data.items || qr.data);
                  setMajors(mr.data || []);
                  setSubmajors(sr.data || []);
                  const list = Number(v) === 2 ? (sr.data || []) : (mr.data || []);
                  if (list.length > 0) setOptions(opts => opts.map(o => ({ ...o, code: list[0].code || '' })));
                }}
                style={{
                  padding: '6px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.18s',
                  background: String(level) === v ? '#fff' : 'transparent',
                  color: String(level) === v ? '#7c3aed' : 'rgba(255,255,255,0.85)',
                  boxShadow: String(level) === v ? '0 2px 8px rgba(0,0,0,0.12)' : 'none',
                }}
              >{label}</button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 28px' }}>
          {toast && (
            <div style={{ marginBottom: 16, padding: '10px 16px', borderRadius: 10, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16, flexShrink: 0 }}><polyline points="20 6 9 17 4 12"/></svg>
              {toast}
            </div>
          )}

          {/* Question input */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#7c3aed', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Nội dung câu hỏi</label>
            <textarea
              rows={2}
              style={{ width: '100%', border: '1.5px solid #ddd6fe', borderRadius: 12, padding: '10px 14px', fontSize: 14, color: '#1e293b', resize: 'vertical', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color 0.15s' }}
              placeholder="Nhập nội dung câu hỏi..."
              value={qtext}
              onChange={e => setQtext(e.target.value)}
              onFocus={e => e.target.style.borderColor = '#8b5cf6'}
              onBlur={e => e.target.style.borderColor = '#ddd6fe'}
            />
          </div>

          {/* Column headers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 90px 36px', gap: 8, marginBottom: 8, paddingLeft: 40 }}>
            {['Nội dung đáp án', 'Ngành / Chuyên ngành', 'Điểm', ''].map((h, i) => (
              <div key={i} style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</div>
            ))}
          </div>

          {/* Option rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {options.map((o, idx) => (
              <div key={idx} style={{ display: 'grid', gridTemplateColumns: '32px 1fr 160px 90px 36px', gap: 8, alignItems: 'center' }}>
                {/* Index badge */}
                <div style={{ width: 28, height: 28, borderRadius: 8, background: '#f3f0ff', color: '#7c3aed', fontSize: 12, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{String.fromCharCode(65 + idx)}</div>
                <input
                  style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '8px 12px', fontSize: 13, color: '#334155', outline: 'none', transition: 'border-color 0.15s' }}
                  placeholder="Nội dung đáp án..."
                  value={o.text}
                  onChange={e => { const c = [...options]; c[idx].text = e.target.value; setOptions(c); }}
                  onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                <select
                  style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '8px 10px', fontSize: 13, color: '#334155', outline: 'none', background: '#fff', transition: 'border-color 0.15s' }}
                  value={o.code || firstCode}
                  onChange={e => { const c = [...options]; c[idx].code = e.target.value; setOptions(c); }}
                  onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                >
                  {(availableList || []).map(item => (
                    <option key={item.code} value={item.code}>{item.code}</option>
                  ))}
                </select>
                <input
                  type="number"
                  style={{ border: '1.5px solid #e2e8f0', borderRadius: 10, padding: '8px 10px', fontSize: 13, color: '#334155', outline: 'none', textAlign: 'center', transition: 'border-color 0.15s' }}
                  value={o.points}
                  onChange={e => { const c = [...options]; c[idx].points = Number(e.target.value); setOptions(c); }}
                  onFocus={e => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
                {options.length > 2 ? (
                  <button onClick={() => setOptions(opts => opts.filter((_, i) => i !== idx))}
                    style={{ width: 28, height: 28, borderRadius: 8, border: 'none', background: '#fef2f2', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14 }}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                  </button>
                ) : <div />}
              </div>
            ))}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={() => setOptions(opts => [...opts, { text: '', code: firstCode, points: 1 }])}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 10, border: '1.5px dashed #c4b5fd', background: '#faf5ff', color: '#7c3aed', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              Thêm lựa chọn
            </button>
            <button
              onClick={create}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '9px 22px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)', color: '#fff', fontSize: 14, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(109,40,217,0.35)' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}><polyline points="20 6 9 17 4 12"/></svg>
              Tạo câu hỏi
            </button>
          </div>
        </div>
      </div>

      <div style={{ borderRadius: 20, background: '#fff', border: '2px solid #ede9fe', boxShadow: '0 4px 24px rgba(139,92,246,0.08)', overflow: 'hidden' }}>
        <div style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)', padding: '16px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: 'rgba(255,255,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 20, height: 20 }}>
                <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/>
                <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>
              </svg>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}>Ngân hàng câu hỏi</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.18)', color: '#fff' }}>{questionsL1.length} Vòng 1</span>
            <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20, background: 'rgba(255,255,255,0.18)', color: '#fff' }}>{questionsL2.length} Vòng 2</span>
            {loading && <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>Đang tải...</span>}
          </div>
        </div>
        {error && <div style={{ margin: '12px 20px', padding: '10px 14px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fecaca', color: '#dc2626', fontSize: 13 }}>{error}</div>}

        {/* Render a collapsible group */}
        {[{ key: 'l1', label: 'Vòng 1 – Tiêu chí chọn Ngành', color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0', questions: questionsL1, lvl: 1 },
          { key: 'l2', label: 'Vòng 2 – Tiêu chí chọn Chuyên ngành', color: '#2563eb', bg: '#dbeafe', border: '#bfdbfe', questions: questionsL2, lvl: 2 }
        ].map(({ key, label, color, bg, border, questions, lvl }) => (
          <div key={key} style={{ borderBottom: key === 'l1' ? '1px solid #f1f5f9' : 'none' }}>
            <button
              onClick={() => setOpenListGroup(openListGroup === key ? null : key)}
              style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 24px', border: 'none', background: openListGroup === key ? bg : '#fff', cursor: 'pointer', textAlign: 'left', transition: 'background 0.15s' }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 14, fontWeight: 700, color }}>{label}</span>
              <span style={{ fontSize: 12, fontWeight: 600, padding: '2px 10px', borderRadius: 20, background: bg, color }}>{questions.length} câu</span>
              <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                style={{ width: 16, height: 16, transform: openListGroup === key ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            {openListGroup === key && (
              <div style={{ padding: '0 24px 16px' }}>
                {questions.length === 0 && <div style={{ fontSize: 13, color: '#94a3b8', padding: '16px 0', textAlign: 'center' }}>Chưa có câu hỏi nào.</div>}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {questions.map((q, qi) => (
                    <div key={q.id} style={{ borderRadius: 12, border: `1.5px solid ${border}`, background: '#fafafa', overflow: 'hidden' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 16px', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flex: 1, minWidth: 0 }}>
                          <div style={{ width: 24, height: 24, borderRadius: 8, background: bg, color, fontSize: 11, fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1 }}>{qi + 1}</div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', lineHeight: 1.4 }}>{q.text}</div>
                            {(q.Options || []).length > 0 && (
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6, marginTop: 8 }}>
                                {(q.Options || []).map((opt, oi) => (
                                  <div key={opt.id} style={{ fontSize: 11, color: '#475569', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <span style={{ fontWeight: 700, color }}>{String.fromCharCode(65 + oi)}.</span> {opt.text}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                          <a href={`/admin/questions/edit/${q.id}`} style={{ padding: '5px 12px', borderRadius: 8, border: '1.5px solid #e2e8f0', background: '#fff', color: '#475569', fontSize: 12, fontWeight: 600, textDecoration: 'none' }}>Sửa</a>
                          <button onClick={() => remove(q.id, lvl)} style={{ padding: '5px 12px', borderRadius: 8, border: 'none', background: '#fef2f2', color: '#ef4444', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Xóa</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
