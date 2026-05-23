import React, { useCallback, useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API, { setAuthToken } from "../api";
// Navbar & Footer come from global Layout
const MajorAvatar = ({ code, name, className }) => {
  const safeCode = code ? String(code).trim() : '';
  const src = safeCode ? `/assets/majors/${safeCode}.png` : '/assets/majors/default.svg';
  const alts = safeCode ? `/assets/majors/${safeCode}.png,/assets/majors/${safeCode}.svg,/assets/majors/default.svg` : '/assets/majors/default.svg';
  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      className={className}
      data-alts={alts}
      data-idx="0"
      onError={(e) => {
        const el = e.currentTarget;
        const list = (el.getAttribute('data-alts') || '').split(',').filter(Boolean);
        const idx = parseInt(el.getAttribute('data-idx') || '0', 10);
        if (idx < list.length) {
          el.src = list[idx];
          el.setAttribute('data-idx', String(idx + 1));
        } else {
          el.onerror = null;
          el.src = '/assets/majors/default.svg';
        }
      }}
    />
  );
};

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
      const data = res.data || [];
      const filteredData = data.filter(q => q.question_type !== 'text_autocomplete');
      setQuestions(filteredData);
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

  const fillRandomAnswers = () => {
    const mapped = { ...answers };
    for (const q of questions) {
      if (!mapped[q.id]) {
        if (q.options && q.options.length > 0) {
          const randomOpt = q.options[Math.floor(Math.random() * q.options.length)];
          mapped[q.id] = randomOpt.id;
        } else {
          mapped[q.id] = "Random answer text";
        }
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
        console.log('[frontend] /api/quiz/major/submit response:', data);
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
        console.log('[frontend] /api/quiz/submit response:', r.data);
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

  if (!error && questions.length === 0) {
    return (
      <div className="min-h-screen px-4 py-10 flex items-center justify-center">
        <div className="max-w-lg w-full rounded-3xl bg-white shadow-lg border border-slate-100 p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-50 text-amber-600">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Chưa có câu hỏi</h2>
          <p className="text-slate-600 mb-6">
            Backend đã chạy và đăng nhập hoạt động, nhưng database hiện chưa có dữ liệu câu hỏi để hiển thị.
          </p>
          <button
            onClick={() => loadQuestions(1)}
            className="inline-flex items-center justify-center px-6 py-3 rounded-xl text-white font-semibold shadow-md"
            style={{ background: 'var(--brand-blue)' }}
          >
            Tải lại
          </button>
        </div>
      </div>
    );
  }

  // Level 1 finished (no auto-branch to Level 2)
  if (majorResult && level === 1 && !majorResult.nextLevel) {
    const scores = Array.isArray(majorResult.allScores) ? majorResult.allScores.slice().sort((a, b) => b.score - a.score) : [];
    const topScore = majorResult.topScore || scores[0]?.score || 1;
    const topRanks = scores.slice(0, 3);
    const restRanks = scores.slice(3);
    const getInitials = (label) => {
      if (!label) return "?";
      const parts = String(label).trim().split(/\s+/).filter(Boolean);
      return parts.slice(0, 2).map((part) => part[0]).join("").toUpperCase();
    };
    return (
      <div className="rcm-shell relative overflow-hidden">
        <div className="rcm-orb rcm-orb--one" />
        <div className="rcm-orb rcm-orb--two" />
        <div className="relative max-w-5xl mx-auto px-6 py-12 md:py-16">
          <div className="rcm-card p-7 md:p-10 rcm-reveal">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <div className="rcm-eyebrow">Kết quả định hướng</div>
                <h2 className="rcm-title">Ngành phù hợp nhất</h2>
                <p className="rcm-subtitle">Ngành phù hợp nhất dựa trên 30 câu hỏi.</p>
              </div>
              <div className="rcm-pill">Mức 1</div>
            </div>

            {topRanks.length > 0 && (
              <div className="rcm-rank-section rcm-reveal" style={{ animationDelay: "0.04s" }}>
                <div className="rcm-panel-title">Top 3 gợi ý ngành</div>
                <div className="rcm-rank-grid">
                  {topRanks.map((m, i) => {
                    const name = m.name || m.code || `Hạng ${i + 1}`;
                    const percentage = m.percentage ?? 0;
                    const score = m.score ?? 0;
                    const level2Ready = supportsLevel2(m.code);
                    const medal = i === 0 ? "Top 1" : i === 1 ? "Top 2" : "Top 3";
                    return (
                      <div key={m.code || name || i} className={`rcm-rank-card rcm-rank-card--${i + 1}`}>
                        <div className="rcm-rank-card__medal">{medal}</div>
                        <MajorAvatar code={m.code} name={name} className="rcm-rank-card__avatar bg-white object-contain p-2" />
                        <div className="rcm-rank-card__name" title={name}>{name}</div>
                        {m.code && <div className="rcm-rank-card__code">{m.code}</div>}
                        <div className="rcm-rank-card__pill">{percentage}% phù hợp</div>
                        <div className="rcm-rank-card__stats">
                          <div>
                            <div className="rcm-rank-stat-label">Điểm</div>
                            <div className="rcm-rank-stat-value">{score}</div>
                          </div>
                          <div>
                            <div className="rcm-rank-stat-label">Tỉ lệ</div>
                            <div className="rcm-rank-stat-value">{percentage}%</div>
                          </div>
                        </div>
                        <button
                          onClick={() => level2Ready && goToLevel2(m.code)}
                          disabled={!level2Ready}
                          className={`rcm-btn ${level2Ready ? "rcm-btn--accent" : "rcm-btn--ghost"} rcm-rank-card__action disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          {level2Ready ? "Làm Mức 2" : "Chưa hỗ trợ mức 2"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {restRanks.length > 0 && (
              <details className="rcm-details rcm-reveal" style={{ animationDelay: "0.16s" }}>
                <summary className="rcm-details__summary">Xem chi tiết bảng xếp hạng</summary>
                <div className="rcm-panel mt-4">
                  <div className="rcm-panel-title">Bảng xếp hạng ngành</div>
                  <div className="rcm-rank-list">
                    <div className="rcm-rank-list__head">
                      <span>Ngành</span>
                      <span>Tỉ lệ</span>
                      <span>Điểm SAW</span>
                    </div>
                    <div className="space-y-3 max-h-72 overflow-auto custom-scrollbar pr-2">
                      {restRanks.map((m, i) => {
                        const name = m.name || m.code || `Hạng ${i + 4}`;
                        const percentage = m.percentage ?? 0;
                        const score = m.score ?? 0;
                        return (
                          <div key={m.code || name || i} className="rcm-rank-list__row">
                            <div className="rcm-rank-list__left">
                              <div className="rcm-rank-list__badge">{i + 4}</div>
                              <MajorAvatar code={m.code} name={name} className="rcm-rank-list__avatar bg-white object-contain p-1" />
                              <div className="rcm-rank-list__meta">
                                <div className="rcm-rank-list__name" title={name}>{name}</div>
                                {m.code && <div className="rcm-rank-list__code">{m.code}</div>}
                              </div>
                            </div>
                            <div className="rcm-rank-list__metrics">
                              <div className="rcm-rank-list__pill"><span className="rcm-rank-list__label">Tỉ lệ</span>{percentage}%</div>
                              <div className="rcm-rank-list__score"><span className="rcm-rank-list__label">Điểm</span>{score}</div>
                            </div>
                            <div className="rcm-rank-list__track">
                              <div className="rcm-rank-list__bar" style={{ width: `${(score / (topScore || 1)) * 100}%` }}></div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </details>
            )}

            <div className="mt-8 grid sm:grid-cols-2 gap-4 rcm-reveal" style={{ animationDelay: "0.2s" }}>
              <button
                onClick={() => { setMajorResult(null); loadQuestions(1); }}
                className="rcm-btn rcm-btn--ghost"
              >
                Làm lại
              </button>
              <button
                onClick={() => navigate('/')}
                className="rcm-btn rcm-btn--primary"
              >
                Về trang chủ
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Level 2 finished (subResult)
  if (subResult) {
    const majorLabel = MAJOR_NORMALIZE[subResult.recommendedMajor?.code]
      || MAJOR_NORMALIZE[subResult.recommendedMajor?.name]
      || subResult.recommendedMajor?.name
      || "Chưa xác định";
    const subLabel = SUBMAJOR_LABELS[subResult.recommendedSubmajor?.code]
      || subResult.recommendedSubmajor?.name
      || subResult.recommended?.name
      || "Chưa xác định";
    const subPct = subResult.recommendedSubmajor?.percentage || subResult.recommended?.percentage || 0;
    const subScore = subResult.topScore || 0;
    const topSubScores = Array.isArray(subResult.allScores) ? subResult.allScores.slice(0, 3) : [];
    return (
      <div className="rcm-shell relative overflow-hidden">
        <div className="rcm-orb rcm-orb--one" />
        <div className="rcm-orb rcm-orb--two" />
        <div className="relative max-w-5xl mx-auto px-6 py-12 md:py-16">
          <div className="rcm-card p-7 md:p-10 rcm-reveal">
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
              <div>
                <div className="rcm-eyebrow">Kết quả chuyên ngành</div>
                <h2 className="rcm-title">Chuyên ngành phù hợp nhất</h2>
                <p className="rcm-subtitle">Dựa trên bài đánh giá Mức 2 cho {selectedMajor || "ngành"}.</p>
              </div>
              <div className="rcm-pill">Mức 2</div>
            </div>

            <div className="grid md:grid-cols-2 gap-5 mb-8">
              <div className="rcm-feature rcm-reveal" style={{ animationDelay: "0.05s" }}>
                <div className="rcm-tag">Ngành gợi ý</div>
                <h3 className="rcm-headline">{majorLabel}</h3>
                <p className="rcm-desc line-clamp-4">{subResult.recommendedMajor?.description || "Chưa có mô tả ngành."}</p>
              </div>
              <div className="rcm-feature rcm-feature--alt rcm-reveal" style={{ animationDelay: "0.1s" }}>
                <div className="rcm-tag">Chuyên ngành gợi ý</div>
                <h3 className="rcm-headline">
                  <Link to={`/careers/${subResult.recommendedSubmajor?.code}`} className="hover:underline">
                    {subLabel}
                  </Link>
                </h3>
                <p className="rcm-desc line-clamp-4">{subResult.recommendedSubmajor?.description || subResult.recommended?.description || "Chưa có mô tả chuyên ngành."}</p>
                {subResult.recommendedSubmajor?.studyGroup && (
                  <div className="rcm-metric mt-3">Khối học: {subResult.recommendedSubmajor.studyGroup}</div>
                )}
                <div className="mt-3 flex items-center justify-between gap-3">
                  <div className="rcm-score">
                    <div className="rcm-score-value">{subPct}%</div>
                    <div className="rcm-score-label">Phù hợp</div>
                  </div>
                  <div className="rcm-metric">Điểm SAW: {subScore}</div>
                </div>
              </div>
            </div>

            {topSubScores.length > 0 && (
              <div className="rcm-panel rcm-reveal" style={{ animationDelay: "0.16s" }}>
                <div className="rcm-panel-title">Top 3 chuyên ngành nổi bật</div>
                <div className="space-y-3">
                  {topSubScores.map((m, i) => {
                    const displayName = SUBMAJOR_LABELS[m.code] || SUBMAJOR_LABELS[m.name] || m.name;
                    return (
                      <div key={i}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="font-medium text-slate-700 truncate" title={displayName}>
                            <Link to={`/careers/${m.code}`} className="hover:underline">{displayName}</Link>
                          </span>
                          <span className="text-slate-500 text-[10px]">{m.percentage}% ({m.score})</span>
                        </div>
                        <div className="h-2 w-full bg-slate-200/70 rounded-full overflow-hidden">
                          <div className="rcm-progress" style={{ width: `${(m.score / (subResult.topScore || 1)) * 100}%` }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="mt-8 grid sm:grid-cols-2 gap-4 rcm-reveal" style={{ animationDelay: "0.2s" }}>
              <button
                onClick={() => { setSubResult(null); setMajorResult(null); setLevel(1); loadQuestions(1); }}
                className="rcm-btn rcm-btn--ghost"
              >
                Làm lại
              </button>
              <button
                onClick={() => navigate('/')}
                className="rcm-btn rcm-btn--primary"
              >
                Về trang chủ
              </button>
            </div>
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
          <aside className="lg:w-[340px] w-full bg-white/95 backdrop-blur shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 rounded-3xl p-6 h-fit sticky top-8 flex flex-col gap-6 fade-in">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary-50 text-primary-700">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg>
              </div>
              <h3 className="text-lg font-bold text-slate-800">Kết quả Mức 1</h3>
            </div>

            <div className="relative overflow-hidden rounded-[20px] p-5 shadow-inner" style={{ backgroundColor: 'var(--brand-purple-50)', border: '1px solid var(--brand-purple-100)' }}>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: 'var(--brand-purple)' }}>Ngành nổi bật</p>
              <p className="text-[17px] font-extrabold text-slate-900 mb-2 leading-tight">{featuredMajor?.name || 'Chưa xác định'}</p>
              <p className="text-xs opacity-80 line-clamp-4 leading-relaxed mb-4 text-slate-700">{featuredMajor?.description || 'Điểm các ngành đang khá sát nhau, vui lòng xem bảng xếp hạng phía dưới để so sánh.'}</p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/70 shadow-sm border border-white/50 text-xs font-bold" style={{ color: 'var(--brand-purple)' }}>
                <span>✨ Phù hợp: {featuredMajor?.percentage}%</span>
                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                <span>Điểm: {featuredMajorScore}</span>
              </div>
            </div>

            <div className="flex-1 min-h-0 flex flex-col">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 px-1">Bảng điểm các ngành</h4>
              <div className="space-y-4 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                {majorResult.allScores.map((m, i) => (
                  <div key={i} className="group relative">
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-[13px] font-semibold text-slate-700 group-hover:text-primary-700 transition-colors truncate pr-3" title={m.name}>
                        {m.name}
                      </span>
                      <span className="text-[11px] font-bold text-slate-500 whitespace-nowrap">{m.percentage}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden shadow-inner">
                      <div 
                        className="h-full rounded-full transition-all duration-700 ease-out" 
                        style={{ width: `${(m.score / (majorResult.topScore || 1)) * 100}%`, backgroundColor: i === 0 ? 'var(--brand-purple)' : 'var(--brand-blue-200)' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button 
              onClick={() => { setLevel(1); setMajorResult(null); loadQuestions(1); }} 
              className="mt-2 w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-all border border-slate-200 shadow-sm hover:shadow active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
              Làm lại Mức 1
            </button>
          </aside>
        )}

        <div className="flex-1 w-full max-w-3xl mx-auto space-y-6">


          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 flex items-start gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v3a1 1 0 00.553.894l2 1a1 1 0 10.894-1.788L11 10.382V7z" clipRule="evenodd" /></svg>
              <span>{error}</span>
            </div>
          )}

          {currentQuestion && (
            <div key={currentQuestion.id} className="rounded-3xl bg-white/80 backdrop-blur-sm shadow-lg p-6 md:p-8 fade-in dark:bg-slate-800/70 dark:border-slate-700" style={{ border: '1px solid var(--border-soft)' }}>
              <div className="flex items-start justify-between gap-4 mb-6">
                <h3 className="text-xl md:text-2xl font-semibold leading-relaxed" style={{ color: "var(--brand-blue)" }}>{currentQuestion.text}</h3>
                {isAdmin && (
                  <button 
                    onClick={fillRandomAnswers} 
                    className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-amber-100 text-amber-700 hover:bg-amber-200 transition shadow-sm"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                    Random Fill (Test)
                  </button>
                )}
              </div>
              {currentQuestion.options && currentQuestion.options.length > 0 ? (
                <div className="grid gap-4">
                  {currentQuestion.options.map((opt, idx) => {
                    const active = answers[currentQuestion.id] === opt.id;
                    return (
                      <label
                        key={opt.id}
                        className={`group relative flex items-center gap-4 rounded-2xl border px-5 py-4 cursor-pointer transition-all ${active ? 'shadow-md' : ''}`}
                        style={active ? { borderColor: 'var(--brand-purple)', background: 'rgba(120,165,163,0.08)', boxShadow: '0 0 0 2px rgba(120,165,163,0.18)' } : { borderColor: 'var(--border-soft)' }}
                      >
                        <input
                          type="radio"
                          name={`q_${currentQuestion.id}`}
                          checked={active}
                          onChange={() => choose(opt.id)}
                          className="sr-only"
                        />
                        <span
                          className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${active ? 'text-white' : ''}`}
                          style={active ? { background: 'var(--brand-purple)', borderColor: 'var(--brand-purple)' } : { background: '#fff', color: 'var(--ink-500)', borderColor: 'var(--border-soft)' }}
                        >{String.fromCharCode(65 + idx)}</span>
                        <span className="text-sm md:text-base font-medium" style={active ? { color: 'var(--brand-purple-700)' } : { color: 'var(--ink-700)' }}>{opt.text}</span>
                        {active && (
                          <span className="absolute right-5 top-1/2 -translate-y-1/2" style={{ color: 'var(--brand-purple)' }}>
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

          <div className="flex flex-wrap items-center justify-between gap-3">
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
                style={{ background: "var(--brand-blue)" }}
              >
                Tiếp
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting || Object.keys(answers).length < questions.length}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition focus:outline-none"
                style={{ background: "var(--brand-blue)" }}
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
