import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API, { setAuthToken } from "../api";
// Navbar & Footer come from global Layout

export default function Quiz() {
  // Mapping sub-major code -> full name
  const SUBMAJOR_LABELS = {
    SE: 'Software Engineering',
    IS: 'Information Systems',
    UIUX: 'UI/UX Design',
    AI: 'Artificial Intelligence',
    CS: 'Computer Science',
    DS: 'Data Science',
    NET: 'Computer Networks',
    CY: 'Cybersecurity',
    EMB: 'Embedded Systems'
  };
  // Display standardized IT major
    // Normalize certain major names (optional)
    const MAJOR_NORMALIZE = {
      IT: 'Information Technology',
      'Information Technology': 'Information Technology'
    };
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
  // Admin inline controls removed per request

  const loadQuestions = async (targetLevel = level, majorCode) => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (token) setAuthToken(token);
      const query = targetLevel === 2 && majorCode ? `?major=${encodeURIComponent(majorCode)}` : '';
      const res = await API.get(`/quiz/${targetLevel}${query}`);
      setQuestions(res.data || []);
      setCurrentIndex(0);
      setAnswers({});
      // If Level 2 returned empty, fallback to all Level 2 (no major filter)
      if (targetLevel === 2 && majorCode && (!Array.isArray(res.data) || res.data.length === 0)) {
        const resAll = await API.get(`/quiz/${targetLevel}`);
        setQuestions(resAll.data || []);
      }
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load questions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // load majors for descriptions
    (async()=>{
      try {
        const r = await API.get('/majors');
        setMajors(Array.isArray(r.data) ? r.data : []);
      } catch {}
    })();
    loadQuestions(1);
  }, []);
  // No admin detection

  const currentQuestion = questions[currentIndex];
  const progress = questions.length ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;

  const choose = (optionId) => {
    if (!currentQuestion) return;
    setAnswers(prev => ({ ...prev, [currentQuestion.id]: optionId }));
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
    const payload = { answers: Object.entries(answers).map(([qid, oid]) => ({ questionId: Number(qid), optionId: Number(oid) })) };
    try {
      if (level === 1) {
        const r = await API.post('/quiz/major/submit', payload);
        const data = r.data || {};
        setMajorResult(data);
        // Local branching: if top major is confidently above 2nd, advance to Level 2
        const scores = Array.isArray(data.allScores) ? data.allScores.slice().sort((a,b)=>b.score-a.score) : [];
        const top = scores[0];
        const second = scores[1];
        const gap = top && second ? (top.score - second.score) : (top ? top.score : 0);
        const CONFIDENCE_GAP = 3; // threshold to move to Level 2
        if (top && gap >= CONFIDENCE_GAP) {
          setSelectedMajor(top.code);
          setLevel(2);
          await loadQuestions(2, top.code);
          return;
        }
        // Otherwise, stay at Level 1 result view (user can decide to continue or redo)
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
      <div className="min-h-screen bg-gradient-to-br from-primary-100 to-primary-300 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-700 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Result display
  // Loading state (deduplicated)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-300/40">
        <div className="text-center">
          <div className="animate-spin rounded-full h-14 w-14 border-4 border-primary-300 border-t-primary-700 mx-auto mb-4"></div>
          <p className="text-sm text-slate-600">Loading questions...</p>
        </div>
      </div>
    );
  }

  // Level 1 finished (no auto-branch to Level 2)
  if (majorResult && level === 1 && !majorResult.nextLevel) {
    const scores = Array.isArray(majorResult.allScores) ? majorResult.allScores.slice().sort((a,b)=>b.score-a.score) : [];
    const top3 = scores.slice(0,3);
    const majorsByCode = majors.reduce((acc,m)=>{ if(m.code) acc[m.code]=m; return acc; },{});
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-primary-100 to-primary-300 py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm border border-slate-100 rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">Orientation Results</h2>
            <p className="mt-2 text-slate-600 text-sm">The most suitable major for you based on 30 questions.</p>
          </div>
          {/* Top 3 majors recommendation */}
          <div className="grid gap-4 mb-6">
            {top3.map((m,i)=>{
              const meta = majorsByCode[m.code] || {};
              const name = m.name || meta.name || m.code;
              const desc = m.description || meta.description || '';
              return (
                <div key={m.code || i} className="bg-gradient-to-br from-primary-100 to-primary-300/40 border border-primary-300 rounded-2xl p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-500 mb-1">Gợi ý #{i+1}</div>
                      <h3 className="text-lg font-semibold text-primary-900 mb-1">{name}</h3>
                      <p className="text-sm text-slate-700 mb-2 leading-relaxed line-clamp-3">{desc}</p>
                      <div className="text-xs text-primary-700 font-medium">Điểm: {m.score}</div>
                    </div>
                    <button
                      onClick={async()=>{ setSelectedMajor(m.code); setLevel(2); await loadQuestions(2, m.code); }}
                      className="shrink-0 px-4 py-2 rounded-xl bg-gradient-to-r from-primary-700 to-primary-500 text-white text-sm font-semibold shadow hover:shadow-md transition"
                    >Làm Level 2</button>
                  </div>
                </div>
              );
            })}
          </div>
          {majorResult.allScores?.length > 1 && (
            <div className="space-y-3 mb-8">
              {majorResult.allScores.map((m,i)=>(
                <div key={i}>
                  <div className="flex justify-between text-xs mb-1"><span className="font-medium text-slate-700 truncate" title={m.name}>{m.name}</span><span className="text-slate-500">{m.score}</span></div>
                  <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-primary-500 to-primary-700" style={{width:`${(m.score/(majorResult.topScore||1))*100}%`}}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex gap-4">
            <button onClick={()=>{ setMajorResult(null); loadQuestions(1); }} className="flex-1 px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition">Do it again</button>
            <button onClick={async()=>{ const first = top3[0]; if(first){ setSelectedMajor(first.code); setLevel(2); await loadQuestions(2, first.code);} }} className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-700 to-primary-500 text-white font-semibold shadow hover:shadow-md transition">Continue to Level 2 (Top 1)</button>
          </div>
        </div>
      </div>
    );
  }

  // Level 2 finished (subResult)
  if (subResult) {
    return (
      <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-primary-100 to-primary-300 py-10 px-4">
        <div className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm border border-slate-100 rounded-3xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">Sub-major Results {selectedMajor || ''}</h2>
            <p className="mt-2 text-slate-600 text-sm">Most suitable sub-major based on Level 2 assessment.</p>
          </div>
          <div className="bg-gradient-to-br from-primary-100 to-primary-300/40 border border-primary-300 rounded-2xl p-6 mb-6">
            <div className="grid gap-4">
              <div className="rounded-xl bg-white/80 border border-primary-300 p-4">
                <p className="text-xs uppercase tracking-wide text-primary-700 font-medium mb-1">Recommended Major</p>
                <h3 className="text-lg font-semibold text-primary-900 mb-1">{MAJOR_NORMALIZE[subResult.recommendedMajor?.code] || MAJOR_NORMALIZE[subResult.recommendedMajor?.name] || subResult.recommendedMajor?.name}</h3>
                <p className="text-xs text-slate-700 mb-2 leading-relaxed">{subResult.recommendedMajor?.description}</p>
              </div>
              <div className="rounded-xl bg-white/80 border border-primary-300 p-4">
                <p className="text-xs uppercase tracking-wide text-primary-700 font-medium mb-1">Recommended Sub-major</p>
                <h3 className="text-lg font-semibold text-primary-900 mb-1">
                  <Link to={`/careers/${subResult.recommendedSubmajor?.code}`} className="hover:underline decoration-primary-500 underline-offset-4">
                    {SUBMAJOR_LABELS[subResult.recommendedSubmajor?.code] || subResult.recommendedSubmajor?.name || subResult.recommended?.name}
                  </Link>
                </h3>
                <p className="text-xs text-slate-700 mb-2 leading-relaxed">{subResult.recommendedSubmajor?.description || subResult.recommended?.description}</p>
                {subResult.recommendedSubmajor?.studyGroup && (
                  <div className="mt-1 text-[11px] text-slate-600"><span className="font-semibold text-primary-700">Study group:</span> {subResult.recommendedSubmajor.studyGroup}</div>
                )}
                <div className="text-[11px] text-primary-700 font-medium">Score: {subResult.topScore}</div>
              </div>
            </div>
          </div>
          {subResult.allScores?.length > 0 && (
            <div className="space-y-3 mb-8">
              {subResult.allScores.slice(0,3).map((m,i)=>{
                const displayName = SUBMAJOR_LABELS[m.code] || SUBMAJOR_LABELS[m.name] || m.name;
                return (
                  <div key={i}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-medium text-slate-700 truncate" title={displayName}>
                        <Link to={`/careers/${m.code}`} className="hover:text-primary-700 hover:underline decoration-primary-500 underline-offset-4">{displayName}</Link>
                      </span>
                      <span className="text-slate-500">{m.score}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-primary-500 to-primary-700" style={{width:`${(m.score/(subResult.topScore||1))*100}%`}}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div className="flex gap-4">
            <button onClick={()=>{ setSubResult(null); setMajorResult(null); setLevel(1); loadQuestions(1); }} className="flex-1 px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium transition">Do it again</button>
            <button onClick={()=>navigate('/')} className="flex-1 px-5 py-3 rounded-xl bg-gradient-to-r from-primary-700 to-primary-500 text-white font-semibold shadow hover:shadow-md transition">Về trang chủ</button>
          </div>
        </div>
      </div>
    );
  }

  // Main quiz view
  return (
  <div className="min-h-screen px-4 py-10 transition-colors">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
        {level === 2 && majorResult && (
          <aside className="lg:w-80 w-full backdrop-blur-xl bg-white/70 border border-white/40 shadow-xl rounded-3xl p-6 h-fit sticky top-8">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Level 1 Results</h3>
            <div className="rounded-xl bg-gradient-to-br from-primary-100 to-primary-300/40 p-4 border border-primary-300">
              <p className="text-xs uppercase tracking-wide text-primary-700 font-medium mb-1">Top Majors</p>
              <p className="font-semibold text-primary-900 mb-1 leading-tight text-sm">{majorResult.recommendedMajor?.name || majorResult.recommended?.name}</p>
              <p className="text-[11px] text-slate-600 line-clamp-5">{majorResult.recommendedMajor?.description || majorResult.recommended?.description}</p>
              <div className="mt-2 text-[11px] text-primary-700 font-medium">Score: {majorResult.topScore}</div>
            </div>
            <details className="text-xs mt-5">
              <summary className="cursor-pointer select-none mb-2 text-slate-600 font-medium">Scores for all majors</summary>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {majorResult.allScores.map((m,i)=>(
                  <div key={i} className="flex flex-col">
                    <div className="flex justify-between text-[11px] mb-1"><span className="font-medium text-slate-700 truncate" title={m.name}>{m.name}</span><span className="text-slate-500">{m.score}</span></div>
                    <div className="w-full h-1.5 bg-slate-200 rounded">
                      <div className="h-1.5 rounded bg-gradient-to-r from-primary-500 to-primary-700" style={{width:`${(m.score/(majorResult.topScore||1))*100}%`}}></div>
                    </div>
                  </div>
                ))}
              </div>
            </details>
            <button onClick={()=>{ setLevel(1); setMajorResult(null); loadQuestions(1); }} className="mt-6 w-full text-center px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 transition">Do it again</button>
          </aside>
        )}

        <div className="flex-1 space-y-6">
          {/* Header */}
          <div className="relative overflow-hidden rounded-3xl bg-white shadow-xl border border-slate-100 p-6 lg:p-8">
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-gradient-to-br from-primary-300 to-primary-500 opacity-40 rounded-full blur-3xl" />
            <div className="absolute -bottom-12 -left-12 w-52 h-52 bg-gradient-to-tr from-primary-100 to-primary-300 opacity-50 rounded-full blur-3xl" />
            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div>
                <h2 className="text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">
                  {level === 1 ? 'Major Orientation' : 'IT Sub-major'}
                </h2>
                <p className="mt-2 text-sm text-slate-600 max-w-prose">
                  {level === 1 ? 'Answer 30 questions to identify suitable major groups.' : 'Continue to select a detailed IT sub-major.'}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <span className="text-xs uppercase tracking-wide text-slate-500">Progress</span>
                  <span className="font-semibold text-slate-800">{Math.round(progress)}%</span>
                </div>
                <div className="w-40 h-2 rounded-full bg-slate-200 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-primary-500 to-primary-700 transition-all duration-500" style={{width:`${progress}%`}}></div>
                </div>
                {/* Dark mode toggle */}
                <button
                  onClick={() => {
                    const root = document.documentElement;
                    const isDark = root.classList.toggle('dark');
                    localStorage.setItem('theme', isDark ? 'dark' : 'light');
                  }}
                  className="relative inline-flex items-center justify-center px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition group"
                  title="Dark mode"
                >
                  <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M17.657 17.657l-.707-.707M12 20v1M6.343 17.657l.707-.707M4 12h1M6.343 6.343l.707.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                </button>
                <button onClick={()=>navigate('/')} className="inline-flex items-center justify-center px-3 py-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  <span className="sr-only">Đóng</span>
                </button>
              </div>
            </div>
            <div className="mt-6 flex items-center gap-3 text-xs font-medium text-slate-600">
              <div className={`px-3 py-1 rounded-full border ${level===1?'bg-primary-700 text-white border-primary-700':'bg-white'} shadow-sm`}>Step 1</div>
              <span className="text-slate-400">→</span>
              <div className={`px-3 py-1 rounded-full border ${level===2?'bg-primary-500 text-white border-primary-500':'bg-white'} shadow-sm`}>Step 2</div>
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
                <h3 className="text-xl md:text-2xl font-semibold text-slate-800 leading-relaxed">{currentQuestion.text}</h3>
                {/* Admin actions removed */}
              </div>
              <div className="grid gap-4">
                {(currentQuestion.options || []).map((opt, idx) => {
                  const active = answers[currentQuestion.id] === opt.id;
                  return (
                    <label
                      key={opt.id}
                      className={`group relative flex items-center gap-4 rounded-2xl border px-5 py-4 cursor-pointer transition-all ${active ? 'border-primary-500 bg-gradient-to-r from-primary-100 to-primary-300/40 shadow-md ring-2 ring-primary-300 dark:from-slate-700 dark:to-slate-600' : 'border-slate-200 hover:border-primary-300 hover:bg-primary-100/40 dark:border-slate-600 dark:hover:border-primary-500 dark:hover:bg-slate-700/40'} `}
                    >
                      <input
                        type="radio"
                        name={`q_${currentQuestion.id}`}
                        checked={active}
                        onChange={() => choose(opt.id)}
                        className="sr-only"
                      />
                      <span className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${active ? 'bg-primary-700 text-white border-primary-700' : 'bg-white text-slate-500 border-slate-300 group-hover:border-primary-500 group-hover:text-primary-700 dark:bg-slate-700 dark:border-slate-500 dark:group-hover:border-primary-500'}`}>{String.fromCharCode(65+idx)}</span>
                      <span className={`text-sm md:text-base font-medium ${active ? 'text-primary-900 dark:text-primary-300' : 'text-slate-700 dark:text-slate-300'}`}>{opt.text}</span>
                      {/* Admin option scoring edit removed */}
                      {active && (
                        <span className="absolute right-5 top-1/2 -translate-y-1/2 text-primary-700">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        </span>
                      )}
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-2">
            <button
              onClick={prev}
              disabled={currentIndex===0}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white border border-slate-200 text-slate-700 font-medium shadow-sm hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              Previous
            </button>
            <div className="text-xs text-slate-500 font-medium">Answered {Object.keys(answers).length}/{questions.length}</div>
            {currentIndex < questions.length - 1 ? (
              <button
                onClick={next}
                disabled={!isAnswered}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-primary-700 to-primary-500 text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                Next
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
              </button>
            ) : (
              <button
                onClick={submit}
                disabled={submitting || Object.keys(answers).length < questions.length}
                className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-700 text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-primary-300"
              >
                {submitting && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
                {submitting ? 'Submitting...' : (level===1 ? 'Complete level 1' : 'Complete level 2')}
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
