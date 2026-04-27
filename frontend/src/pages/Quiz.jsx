import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API, { setAuthToken } from "../api";
// Navbar & Footer come from global Layout

export default function Quiz() {
  // Mapping sub-major code -> full name
  const SUBMAJOR_LABELS = {
    SE: 'Kỹ thuật phần mềm',
    IS: 'Hệ thống thông tin',
    UIUX: 'Thiết kế UI/UX',
    AI: 'Trí tuệ nhân tạo',
    CS: 'Khoa học máy tính',
    DS: 'Khoa học dữ liệu',
    NET: 'Mạng máy tính',
    CY: 'An ninh mạng',
    EMB: 'Hệ thống nhúng'
  };
  // Display standardized IT major
  // Normalize certain major names (optional)
  const MAJOR_NORMALIZE = {
    IT: 'Công nghệ thông tin - IT',
    'Information Technology': 'Công nghệ thông tin - IT'
  };

  // Pre-selected option IDs that maximise CIT's SAW score at Level 1
  // (mirrors the scenario in backend/tests/quizService.saw.test.js)
  const CIT_DEMO_ANSWERS = {
    1: 4, 2: 6, 3: 12, 4: 15, 5: 17,
    6: 23, 7: 25, 8: 29, 9: 36, 10: 37,
    11: 44, 12: 48, 13: 51, 14: 55, 15: 60,
    16: 61, 17: 66, 18: 71, 19: 76, 20: 78,
    21: 82, 22: 86, 23: 90, 24: 94, 25: 97,
    26: 102, 27: 105, 28: 110, 29: 113, 30: 117,
  };
  const LEVEL2_BRANCH_CODES = ['CIT', 'IT', 'ICT'];
  const supportsLevel2 = (code) => !!code && LEVEL2_BRANCH_CODES.includes(String(code).toUpperCase());

  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [majorResult, setMajorResult] = useState(null);
  const [subResult, setSubResult] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [level, setLevel] = useState(1);
  const [majors, setMajors] = useState([]); // for descriptions and mapping
  const [selectedMajor, setSelectedMajor] = useState(null); // code of chosen major for Level 2

  // Detect admin role from persisted user object
  const isAdmin = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}')?.role === 'admin'; }
    catch { return false; }
  })();

  const loadQuestions = useCallback(async (targetLevel, majorCode) => {
    setLoading(true);
    setError("");
    try {
      const effectiveLevel = targetLevel ?? level;
      const token = localStorage.getItem("token");
      if (token) setAuthToken(token);
      const query = effectiveLevel === 2 && majorCode ? `?major=${encodeURIComponent(majorCode)}` : '';
      const res = await API.get(`/quiz/${effectiveLevel}${query}`);
      setQuestions(res.data || []);
      setCurrentIndex(0);
      setAnswers({});
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Không thể tải câu hỏi");
    } finally {
      setLoading(false);
    }
  }, [level]);

  useEffect(() => {
    // load majors for descriptions
    (async () => {
      try {
        const r = await API.get('/majors');
        setMajors(Array.isArray(r.data) ? r.data : []);
      } catch (error) {
        console.warn('Failed to load majors metadata', error);
      }
    })();
    loadQuestions(1);
  }, [loadQuestions]);
  // No admin detection

  const currentQuestion = questions[currentIndex];
  const isAnswered = currentQuestion && answers[currentQuestion.id] !== undefined && answers[currentQuestion.id] !== '';

  const fillDemoAnswers = () => {
    const mapped = {};
    for (const q of questions) {
      if (CIT_DEMO_ANSWERS[q.id] !== undefined) {
        mapped[q.id] = CIT_DEMO_ANSWERS[q.id];
      }
    }
    setAnswers(mapped);
    setCurrentIndex(questions.length - 1);
  };

  const choose = (optionId) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
  };

  const goToLevel2 = async (code) => {
    if (!supportsLevel2(code)) return;
    setSelectedMajor(code);
    setLevel(2);
    await loadQuestions(2, code);
  };

  const next = () => currentIndex < questions.length - 1 && setCurrentIndex(i => i + 1);
  const prev = () => currentIndex > 0 && setCurrentIndex(i => i - 1);

  // Admin actions removed per request

  const submit = async () => {
    const unanswered = questions.filter(q => !answers[q.id]);
    if (unanswered.length) {
      setError(`Còn ${unanswered.length} câu chưa trả lời.`);
      return;
    }
    setSubmitting(true);
    setError("");
    const payload = {
      answers: Object.entries(answers).map(([qid, val]) => ({
        questionId: Number(qid),
        ...(typeof val === 'string' ? { text: val } : { optionId: Number(val) })
      }))
    };
    try {
      if (level === 1) {
        const r = await API.post('/quiz/major/submit', payload);
        const data = r.data || {};
        setMajorResult(data);

        const scores = Array.isArray(data.allScores) ? data.allScores.slice().sort((a,b)=>b.score-a.score) : [];
        const top = scores[0];
        const second = scores[1];
        const gap = top && second ? (top.score - second.score) : (top ? top.score : 0);
        const CONFIDENCE_GAP = 0.05;
        const canBranchToLevel2 = top && gap >= CONFIDENCE_GAP && supportsLevel2(top.code);
        if (canBranchToLevel2) {
          await goToLevel2(top.code);
          return;
        }
      } else {
        const r = await API.post('/quiz/submit', payload);
        setSubResult(r.data);
        // If user is logged in, redirect to consolidated results page for consistency
        const token = localStorage.getItem('token');
        if (token) {
          // Navigate to saved results; backend persists submission when authenticated
          navigate('/results');
          return;
        }
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || 'Gửi bài thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải câu hỏi...</p>
        </div>
      </div>
    );
  }

  // Level 1 finished (no auto-branch to Level 2)
  if (majorResult && level === 1 && !majorResult.nextLevel) {
    const scores = Array.isArray(majorResult.allScores) ? majorResult.allScores.slice().sort((a, b) => b.score - a.score) : [];
    const top3 = scores.slice(0, 3);
    const majorsByCode = majors.reduce((acc, m) => { if (m.code) acc[m.code] = m; return acc; }, {});
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm border border-slate-100 rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold" style={{ color: "#8b5cf6" }}>Kết quả định hướng</h2>
            <p className="mt-2 text-slate-600 text-sm">Ngành phù hợp nhất dựa trên 30 câu hỏi.</p>
          </div>
          {/* Top 3 majors recommendation */}
          <div className="grid gap-4 mb-6">
            {top3.map((m, i) => {
              const meta = majorsByCode[m.code] || {};
              const name = m.name || meta.name || m.code;
              const desc = m.description || meta.description || '';
              const level2Ready = supportsLevel2(m.code);
              return (
                <div key={m.code || i} className="bg-white border border-slate-200 rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Gợi ý #{i + 1}</div>
                      <h3 className="text-lg font-semibold mb-1" style={{ color: "#8b5cf6" }}>{name}</h3>
                      <p className="text-sm text-slate-700 mb-2 leading-relaxed line-clamp-3">{desc}</p>
                      <div className="text-xs font-semibold" style={{ color: "#8b5cf6" }}>Tỉ lệ phù hợp: {m.percentage}%</div>
                      <div className="text-[10px] text-slate-500">Điểm SAW: {m.score}</div>
                    </div>
                    <button
                      onClick={() => goToLevel2(m.code)}
                      disabled={!level2Ready}
                      className="px-5 py-2.5 rounded-xl text-white font-semibold text-sm shadow hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition shrink-0"
                      style={{ background: "#8b5cf6" }}
                    >
                      {level2Ready ? 'Làm Mức 2' : 'Chưa hỗ trợ Mức 2'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          {majorResult.allScores?.length > 1 && (
            <div className="space-y-3 mb-8">
              {majorResult.allScores.map((m, i) => (
                <div key={i}>
                  <div className="flex justify-between text-[10px] mb-1">
                    <span className="font-medium text-slate-700 truncate" title={m.name}>{m.name}</span>
                    <span className="text-slate-500">{m.percentage}% ({m.score})</span>
                  </div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-700" style={{ width: `${(m.score / (majorResult.topScore || 1)) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-4">
            <button onClick={() => { setMajorResult(null); loadQuestions(1); }} className="flex-1 px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition">Làm lại</button>
            <button onClick={() => navigate('/')} className="flex-1 px-5 py-3 rounded-xl text-white font-semibold shadow transition" style={{ background: "#3b82f6" }}>Về trang chủ</button>
          </div>
        </div>
      </div>
    );
  }

  // Level 2 finished (subResult)
  if (subResult) {
    return (
      <div className="min-h-screen bg-slate-50 py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm border border-slate-100 rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold" style={{ color: "#8b5cf6" }}>Kết quả chuyên ngành {selectedMajor || ''}</h2>
            <p className="mt-2 text-slate-600 text-sm">Chuyên ngành phù hợp nhất dựa trên bài đánh giá Mức 2.</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-2xl p-6 mb-6">
            <div className="grid gap-4">
              <div className="rounded-xl bg-white/80 border border-primary-300 p-4">
                <p className="text-xs uppercase tracking-wide text-primary-700 font-medium mb-1">Ngành gợi ý</p>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "#8b5cf6" }}>{MAJOR_NORMALIZE[subResult.recommendedMajor?.code] || MAJOR_NORMALIZE[subResult.recommendedMajor?.name] || subResult.recommendedMajor?.name}</h3>
                <p className="text-xs text-slate-700 mb-2 leading-relaxed">{subResult.recommendedMajor?.description}</p>
              </div>
              <div className="rounded-xl bg-white/80 border border-primary-300 p-4">
                <p className="text-xs uppercase tracking-wide text-primary-700 font-medium mb-1">Chuyên ngành gợi ý</p>
                <h3 className="text-lg font-semibold mb-1" style={{ color: "#8b5cf6" }}>
                  <Link to={`/careers/${subResult.recommendedSubmajor?.code}`} className="hover:underline decoration-primary-500 underline-offset-4">
                    {SUBMAJOR_LABELS[subResult.recommendedSubmajor?.code] || subResult.recommendedSubmajor?.name || subResult.recommended?.name}
                  </Link>
                </h3>
                <p className="text-xs text-slate-700 mb-2 leading-relaxed">{subResult.recommendedSubmajor?.description || subResult.recommended?.description}</p>
                {subResult.recommendedSubmajor?.studyGroup && (
                  <div className="mt-1 text-[11px] text-slate-600"><span className="font-semibold text-primary-700">Khối học:</span> {subResult.recommendedSubmajor.studyGroup}</div>
                )}
                <div className="mt-2 flex items-center gap-4">
                  <div className="text-xs font-semibold" style={{ color: "#8b5cf6" }}>Tỉ lệ phù hợp: {subResult.recommendedSubmajor?.percentage || subResult.recommended?.percentage}%</div>
                  <div className="text-[10px] text-slate-500">Điểm SAW: {subResult.topScore}</div>
                </div>
              </div>
            </div>
          </div>
          {subResult.allScores?.length > 0 && (
            <div className="space-y-3 mb-8">
              {subResult.allScores.slice(0, 3).map((m, i) => {
                const displayName = SUBMAJOR_LABELS[m.code] || SUBMAJOR_LABELS[m.name] || m.name;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 truncate" title={displayName}>
                        <Link to={`/careers/${m.code}`} className="hover:text-primary-700 hover:underline decoration-primary-500 underline-offset-4">{displayName}</Link>
                      </span>
                      <span className="text-slate-500 text-[10px]">{m.percentage}% ({m.score})</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary-700" style={{ width: `${(m.score / (subResult.topScore || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex gap-4">
            <button onClick={() => { setSubResult(null); setMajorResult(null); setLevel(1); loadQuestions(1); }} className="flex-1 px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition">Làm lại</button>
            <button onClick={() => navigate('/')} className="flex-1 px-5 py-3 rounded-xl text-white font-semibold shadow transition" style={{ background: "#3b82f6" }}>Về trang chủ</button>
          </div>
        </div>
      </div>
    );
  }

  // Main quiz view
  const featuredMajor = majorResult?.recommendedMajor || majorResult?.recommended || majorResult?.allScores?.[0] || null;
  const featuredMajorScore = typeof majorResult?.topScore === 'number' && majorResult.topScore > 0
    ? majorResult.topScore
    : (featuredMajor?.score || 0);

  return (
    <div className="min-h-screen px-4 py-10 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {level === 2 && majorResult && (
          <aside className="lg:w-80 w-full backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl rounded-3xl p-6 h-fit sticky top-8">
            <h3 className="text-sm font-semibold mb-3" style={{ color: "#8b5cf6" }}>Kết quả Mức 1</h3>
            <div style={{ borderRadius: 12, background: 'linear-gradient(135deg, #ede9fe 0%, #ddd6fe 100%)', padding: 16, border: '1.5px solid #c4b5fd' }}>
              <p style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#7c3aed', fontWeight: 600, marginBottom: 4 }}>Ngành nổi bật</p>
              <p style={{ fontWeight: 700, color: '#4c1d95', marginBottom: 4, fontSize: 13, lineHeight: 1.4 }}>{featuredMajor?.name || 'Chưa xác định'}</p>
              <p style={{ fontSize: 11, color: '#475569', display: '-webkit-box', WebkitLineClamp: 5, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{featuredMajor?.description || 'Điểm các ngành đang khá sát nhau, vui lòng xem bảng xếp hạng phía dưới để so sánh.'}</p>
              <div style={{ marginTop: 8, fontSize: 11, color: '#7c3aed', fontWeight: 700 }}>Tỉ lệ: {featuredMajor?.percentage}% | Điểm: {featuredMajorScore}</div>
            </div>
            <details className="text-xs mt-5">
              <summary className="cursor-pointer select-none mb-2 text-slate-600 font-medium">Điểm của tất cả ngành</summary>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {majorResult.allScores.map((m, i) => (
                  <div key={i} className="flex flex-col">
                    <div className="flex justify-between text-[10px] mb-1">
                      <span className="font-medium text-slate-700 truncate" title={m.name}>{m.name}</span>
                      <span className="text-slate-500">{m.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-200 rounded">
                      <div className="h-1.5 rounded" style={{ width: `${(m.score / (majorResult.topScore || 1)) * 100}%`, background: 'linear-gradient(90deg,#8b5cf6,#6d28d9)' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
            <button onClick={() => { setLevel(1); setMajorResult(null); loadQuestions(1); }} className="mt-6 w-full text-center px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 transition">Làm lại</button>
          </aside>
        )}

        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-100 p-6 lg:p-8">
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight" style={{ color: "#8b5cf6" }}>
                  Định hướng ngành
                </h2>
                <p className="mt-2 text-sm text-slate-600 max-w-prose">
                  Trả lời 30 câu hỏi để xác định nhóm ngành phù hợp.
                </p>
              </div>
              <div className="flex items-center gap-4">
                {isAdmin && level === 1 && (
                  <button
                    onClick={fillDemoAnswers}
                    title="[Admin] Tự động chọn đáp án kịch bản CIT điểm cao nhất"
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200 transition"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Demo CIT
                  </button>
                )}
                <button onClick={() => navigate('/')} className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  <span className="sr-only">Đóng</span>
                </button>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 text-xs font-medium text-slate-600">
              <div className={`px-3 py-1 rounded-full border text-white border-transparent shadow-sm`} style={{ background: '#8b5cf6' }}>Bài đánh giá</div>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-start gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3a1 1 0 00.553.894l2 1a1 1 0 10.894-1.788L11 10.382V7z" clipRule="evenodd" /></svg>
              <span>{error}</span>
            </div>
          )}

          {currentQuestion && (
            <div key={currentQuestion.id} className="rounded-3xl bg-white/80 backdrop-blur-sm border border-slate-100 shadow-lg p-6 md:p-8 fade-in dark:bg-slate-800/70 dark:border-slate-700">
              <div className="flex items-start justify-between gap-4 mb-6">
                <h3 className="text-xl md:text-2xl font-semibold leading-relaxed" style={{ color: "#8b5cf6" }}>{currentQuestion.text}</h3>
                {/* Admin actions removed */}
              </div>
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                <div className="grid gap-4">
                  {currentQuestion.options.map((opt, idx) => {
                    const active = answers[currentQuestion.id] === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className={`group relative flex items-center gap-4 rounded-2xl border px-5 py-4 cursor-pointer transition-all ${active ? 'shadow-md' : 'border-slate-200 hover:border-[#c4b5fd] hover:bg-[#f5f3ff]'}`}
                        style={active ? { borderColor: '#8b5cf6', background: 'rgba(139,92,246,0.08)', boxShadow: '0 0 0 2px rgba(139,92,246,0.25)' } : {}}
                      >
                        <input
                          type="radio"
                          name={`q_${currentQuestion.id}`}
                          checked={active}
                          onChange={() => choose(opt.id)}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${active ? 'text-white' : 'bg-white text-slate-500 border-slate-300 group-hover:border-[#8b5cf6] group-hover:text-[#8b5cf6]'}`}
                          style={active ? { background: '#8b5cf6', borderColor: '#8b5cf6' } : {}}
                        >{String.fromCharCode(65 + idx)}</span>
                        <span className={`text-sm md:text-base font-medium ${active ? '' : 'text-slate-700'}`} style={active ? { color: '#6d28d9' } : {}}>{opt.text}</span>
                        {active && (
                          <span className="absolute right-5 top-1/2 -translate-y-1/2" style={{ color: '#8b5cf6' }}>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                          </span>
                        )}
                      </label>
                    );
                  })}
                </div>
              ) : (
                <div className="mt-2">
                  <textarea
                    value={answers[currentQuestion.id] || ''}
                    onChange={e => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                    placeholder="Nhập câu trả lời của bạn..."
                    rows={4}
                    className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-sm text-slate-700 leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 resize-none transition dark:bg-slate-700/80 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400"
                  />
                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Hãy mô tả ngắn gọn — hệ thống phân tích từ khóa trong câu trả lời của bạn.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <button
              onClick={prev}
              disabled={currentIndex === 0}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Trước
            </button>
            <div className="text-xs text-slate-500 font-medium">Đã trả lời {Object.keys(answers).length}/{questions.length}</div>
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={next}
                disabled={!isAnswered}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition focus:outline-none"
                style={{ background: "#8b5cf6" }}
              >
                Tiếp
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting || Object.keys(answers).length < questions.length}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition focus:outline-none"
                style={{ background: "#8b5cf6" }}
              >
                {submitting && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
                {submitting ? 'Đang gửi...' : 'Hoàn thành bài Test'}
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </button>
            )}
          </div>
        </div>
      </div>
      {/* Admin create panel removed */}
    </div>
  );
}
