import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import API, { setAuthToken } from "../api";

const MAJOR_SHADES = ["#DC3E26", "#78a5a3", "#e1b16a"];
const SUB_SHADES = ["#78a5a3", "#e1b16a", "#DC3E26"];

function PieChart({ slices, colors, size = 120 }) {
  const cx = size / 2, cy = size / 2, r = size / 2 - 8;
  const total = slices.reduce((s, d) => s + d.value, 0);
  if (total === 0) return null;
  let angle = -Math.PI / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="shrink-0">
      {slices.map((d, i) => {
        const pct = d.value / total;
        const start = angle;
        const end = angle + pct * 2 * Math.PI;
        angle = end;
        const x1 = cx + r * Math.cos(start), y1 = cy + r * Math.sin(start);
        const x2 = cx + r * Math.cos(end), y2 = cy + r * Math.sin(end);
        const large = pct > 0.5 ? 1 : 0;
        return (
          <path
            key={i}
            d={`M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2} Z`}
            fill={colors[i % colors.length]}
            stroke="#fff"
            strokeWidth={1.5}
          />
        );
      })}
    </svg>
  );
}

function ResultChart({ title, scores, colors, accentColor, recommended }) {
  const top3 = (scores || []).slice(0, 3);
  const total = top3.reduce((s, r) => s + r.score, 0);
  if (!top3.length) return null;
  return (
    <div className="flex flex-col items-center flex-1 min-w-0">
      <div className="text-xs font-semibold mb-3" style={{ color: accentColor }}>{title}</div>
      <PieChart slices={top3.map(r => ({ value: r.score }))} colors={colors} size={120} />
      <div className="mt-3 w-full space-y-1.5 px-1">
        {top3.map((r, i) => {
          const pct = total > 0 ? ((r.score / total) * 100).toFixed(1) : "0.0";
          return (
            <div key={r.code || i} className="flex items-center gap-2 text-xs">
              <span className="inline-block h-2.5 w-2.5 rounded-full shrink-0" style={{ background: colors[i % colors.length] }} />
              <span className="truncate flex-1 leading-tight" style={{ color: 'var(--ink-700)' }} title={r.name}>{r.name}</span>
              <span className="font-semibold shrink-0" style={{ color: colors[i % colors.length] }}>{pct}%</span>
            </div>
          );
        })}
      </div>
      {recommended && (
        <div className="mt-3 text-xs text-center">
          <span style={{ color: 'var(--ink-500)' }}>Đề xuất: </span>
          <span className="font-semibold" style={{ color: accentColor }}>{recommended}</span>
        </div>
      )}
    </div>
  );
}



export function XaiModal({ details, onClose }) {
  if (!details) return null;
  const { normalizedMatrix, weights, criteria, allScores } = details;
  
  // Lấy Top 3 ngành
  const top3Scores = (allScores || []).slice(0, 3);
  
  // Hàm chuyển điểm chuẩn hóa sang chữ dễ hiểu
  const getRequirementLabel = (val) => {
    if (val === 0) return "Không yêu cầu";
    if (val < 0.4) return "Yêu cầu Thấp";
    if (val < 0.7) return "Yêu cầu Vừa";
    if (val < 1.0) return "Yêu cầu Cao";
    return "Yêu cầu Rất Cao";
  };
  
  const rankColors = ['var(--brand-red)', 'var(--brand-ocean)', 'var(--brand-warm)'];
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b bg-[color:var(--surface-muted)] flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-2xl font-black text-[color:var(--brand-blue)] flex items-center gap-2">
              <span className="text-3xl">⚙️</span> Giải mã Thuật toán SAW (Minh bạch AI)
            </h2>
            <p className="text-sm text-[color:var(--ink-500)] mt-1 font-medium">Phân tích chi tiết kết quả của người dùng.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:bg-slate-200 hover:text-slate-700 w-10 h-10 flex items-center justify-center rounded-full transition">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        
        <div className="p-6 sm:p-8 overflow-y-auto space-y-10 bg-white custom-scrollbar">
          
          {/* Step 1: User Profile */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[color:var(--brand-blue)] text-white flex items-center justify-center font-bold">1</div>
              <h3 className="text-lg font-bold text-slate-800">Trọng số Tiêu chí Đánh giá (W)</h3>
            </div>
            <p className="text-sm text-slate-500 mb-5 ml-11">Dựa trên bài đánh giá, hệ thống đúc kết được trọng số ưu tiên của bạn cho các tiêu chí chọn ngành (Tổng = 100%):</p>
            
            <div className="ml-11 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
              {criteria && [...criteria].sort((a, b) => (weights[b.key] || 0) - (weights[a.key] || 0)).map(c => {
                const pct = ((weights[c.key] || 0) * 100).toFixed(1);
                return (
                  <div key={c.key} className="flex items-center gap-4">
                    <div className="w-32 text-sm font-semibold text-slate-700 flex justify-between">
                      {c.name} <span className="text-[color:var(--brand-blue)] font-bold">{pct}%</span>
                    </div>
                    <div className="flex-1 h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[color:var(--brand-blue)] rounded-full transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="w-full h-px bg-slate-100 my-4"></div>

          {/* Step 2: Matching Process */}
          <section>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[color:var(--brand-ocean)] text-white flex items-center justify-center font-bold">2</div>
              <h3 className="text-lg font-bold text-slate-800">Quá trình "Matching" & Chấm điểm</h3>
            </div>
            <p className="text-sm text-slate-500 mb-6 ml-11">
              Hệ thống lấy <strong className="text-[color:var(--brand-blue)]">Trọng số Ưu tiên của Người dùng</strong> nhân với <strong className="text-[color:var(--brand-ocean)]">Hệ số Tiêu chuẩn của Ngành</strong>.
              Ngành nào có tổng điểm cộng dồn cao nhất sẽ lọt vào Top gợi ý.
            </p>
            
            <div className="ml-11 space-y-6">
              {top3Scores.map((major, idx) => {
                const norm = normalizedMatrix[major.code] || {};
                
                return (
                  <div key={major.code} className="bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden transition hover:shadow-md">
                    {/* Header */}
                    <div className="bg-white px-5 py-4 border-b border-slate-100 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full text-white font-black flex items-center justify-center" style={{ backgroundColor: rankColors[idx] }}>#{idx + 1}</span>
                        <h4 className="text-base font-bold text-slate-800">{major.name}</h4>
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-bold text-slate-400">Điểm phù hợp</div>
                        <div className="text-lg font-black" style={{ color: rankColors[idx] }}>{major.score.toFixed(4)}</div>
                      </div>
                    </div>
                    
                    {/* Grid criteria */}
                    <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {criteria && criteria.map((c) => {
                         const w = weights[c.key] || 0;
                         const x = norm[c.key] || 0;
                         const pointsEarned = w * x;
                         
                         // Bỏ qua hiển thị nếu mảng này học sinh = 0 hoặc ngành không yêu cầu
                         if (w === 0 && x === 0) return null;
                         
                         return (
                           <div key={c.key} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100">
                             <div>
                               <div className="text-xs font-bold text-slate-700">{c.name}</div>
                               <div className="text-[10px] text-slate-500 mt-0.5">
                                 Hệ số ngành: <strong className="text-[color:var(--brand-ocean)]">{x.toFixed(2)}</strong> ({getRequirementLabel(x)})
                               </div>
                             </div>
                             
                             <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                               <div className="text-[11px] font-bold text-[color:var(--brand-blue)]" title="Trọng số người dùng">{(w * 100).toFixed(0)}%</div>
                               <div className="text-[10px] font-black text-slate-300">×</div>
                               <div className="text-[11px] font-bold text-[color:var(--brand-ocean)]" title="Hệ số ngành">{x.toFixed(2)}</div>
                               <div className="text-[10px] font-black text-slate-300">=</div>
                               <div className="text-[12px] font-black" style={{ color: rankColors[idx] }}>
                                 +{pointsEarned.toFixed(3)}
                               </div>
                             </div>
                           </div>
                         );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Note */}
          <div className="ml-11 bg-[color:var(--surface-muted)] text-[color:var(--ink-700)] text-xs p-4 rounded-xl flex gap-3 items-start border border-slate-200">
            <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p>
              <strong>Giải thích chuyên sâu:</strong> Phương pháp sử dụng gọi là SAW (Simple Additive Weighting). Quá trình trên bản chất là việc lấy "Ma trận trọng số người dùng" nhân với "Ma trận yêu cầu tiêu chuẩn của ngành" (đã được chuẩn hóa từ dữ liệu của tổ chức O*NET). 
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Convert {code: score} object + namesObj to sorted array
function toScoreArray(scoresObj, namesObj) {
  if (!scoresObj || typeof scoresObj !== "object") return [];
  return Object.entries(scoresObj)
    .map(([code, score]) => ({ code, name: namesObj?.[code] || code, score: Number(score) || 0 }))
    .sort((a, b) => b.score - a.score);
}

// Get allScores array from a submission (supports both old and new format)
function getMajorScores(sub) {
  const d = sub?.details || {};
  if (Array.isArray(d.allScores)) return d.allScores;
  return toScoreArray(d.majorScores, d.majorNames);
}

function getSubMajorScores(sub) {
  const d = sub?.details || {};
  if (Array.isArray(d.allScores)) return d.allScores;
  return toScoreArray(d.submajorScores || d.subMajorScores, d.subMajorNames);
}

export default function Results() {
  const [loading, setLoading] = useState(true);
  const [subs, setSubs] = useState([]);
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [xaiData, setXaiData] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    setAuthToken(token);
    API.get("/results/me")
      .then((r) => {
        console.log('[frontend] /api/results/me response:', r.data);
        setSubs(Array.isArray(r.data) ? r.data : []);
      })
      .catch((e) => {
        if (e?.response?.status === 401) {
          setError("Phiên đăng nhập không hợp lệ. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
        } else {
          setError(e?.response?.data?.message || "Không thể tải kết quả");
        }
      })
      .finally(() => setLoading(false));
  }, [token]);

  // Group into attempt sessions: pair major + sub-major submissions by order
  const majorSubs = subs.filter(s => !s.subMajorCode);
  const subMajorSubs = subs.filter(s => s.subMajorCode);
  const attemptCount = Math.max(majorSubs.length, subMajorSubs.length, 0);
  const attempts = Array.from({ length: attemptCount }, (_, i) => ({
    num: attemptCount - i,
    majorSub: majorSubs[i] ?? null,
    subMajorSub: subMajorSubs[i] ?? null,
  }));

  if (!token) return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <div className="bg-white border rounded-2xl p-8 shadow-sm text-center" style={{ borderColor: 'var(--border-soft)' }}>
        <h2 className="text-xl font-semibold mb-3" style={{ color: "var(--brand-blue)" }}>Yêu cầu đăng nhập</h2>
        <p className="mb-6" style={{ color: 'var(--ink-500)' }}>Bạn cần đăng nhập để xem kết quả đánh giá đã lưu.</p>
        <Link to="/login" className="inline-block px-6 py-3 rounded-lg text-white font-semibold shadow-md"
          style={{ background: "var(--brand-blue)" }}>Đi tới trang đăng nhập</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
      <h1 className="text-2xl font-bold" style={{ color: "var(--brand-blue)" }}>Kết quả đánh giá của tôi</h1>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'var(--brand-blue)' }} />
            <p className="text-sm" style={{ color: 'var(--ink-500)' }}>Đang tải kết quả...</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {!loading && !error && attempts.length === 0 && (
        <div className="bg-white border rounded-2xl p-8 shadow-sm text-center" style={{ borderColor: 'var(--border-soft)' }}>
          <h2 className="text-lg font-semibold mb-2" style={{ color: "var(--brand-blue)" }}>Chưa có kết quả</h2>
          <p className="mb-6 text-sm" style={{ color: 'var(--ink-500)' }}>Bạn chưa hoàn thành bài đánh giá nào khi đang đăng nhập.</p>
          <Link to="/quiz" className="inline-block px-6 py-3 rounded-lg text-white font-semibold shadow-md"
            style={{ background: "var(--brand-blue)" }}>Làm bài đánh giá</Link>
        </div>
      )}

      {!loading && !error && attempts.map((attempt, i) => {
        const { majorSub, subMajorSub, num } = attempt;
        const majorScores = getMajorScores(majorSub);
        const subMajorScores = getSubMajorScores(subMajorSub);
        const hasMajor = majorScores.length > 0;
        const hasSubMajor = subMajorScores.length > 0;

        const dates = [majorSub?.createdAt, subMajorSub?.createdAt].filter(Boolean).sort().reverse();
        const dateObj = dates[0] ? new Date(dates[0]) : null;
        const dateStr = dateObj ? dateObj.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
        const timeStr = dateObj ? dateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "";

        const isLatest = i === 0;
        const isExpanded = expandedId === i;

        return (
          <div key={i} className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--border-soft)' }}>
            {/* Header row — click anywhere to toggle */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors"
              style={{ background: isExpanded ? 'var(--surface-muted)' : '#fff' }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-bold shrink-0"
                  style={{ background: "var(--brand-blue)" }}>
                  {num}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--ink-700)' }}>Lần làm thứ {num}</div>
                  <div className="flex items-center gap-2 text-[11px] mt-0.5">
                    <span style={{ color: 'var(--ink-500)' }}>{dateStr} {timeStr}</span>
                    {(() => {
                      const score = subMajorSub?.score ?? majorSub?.score;
                      if (score == null) return null;
                      const displayPct = subMajorSub?.percentage ?? majorSub?.percentage ?? (score * 100).toFixed(2);
                      return (
                        <>
                          <span style={{ color: 'var(--border-soft)' }}>•</span>
                          <span className="font-medium" style={{ color: "var(--brand-blue)" }}>
                            Tỉ lệ: {displayPct}%
                          </span>
                          <span style={{ color: 'var(--border-soft)' }}>•</span>
                          <span className="font-medium" style={{ color: 'var(--ink-500)' }}>
                            Điểm SAW: {score}
                          </span>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isLatest && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "var(--brand-red-50)", color: "var(--brand-red-700)" }}>
                    Mới nhất
                  </span>
                )}
                <span
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                  style={isExpanded
                    ? { background: "var(--brand-purple-50)", color: "var(--brand-purple)", borderColor: "var(--brand-purple-100)" }
                    : { background: "var(--surface-muted)", color: "var(--ink-500)", borderColor: "var(--border-soft)" }}
                >
                  Chi tiết
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                    style={{
                      width: 11, height: 11, display: "inline", marginLeft: 4, verticalAlign: "middle",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s"
                    }}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </div>
            </button>

            {/* Detail panel */}
            {isExpanded && (
              <div className="border-t px-5 py-5 space-y-5" style={{ borderColor: 'var(--border-soft)' }}>
                {/* Charts */}
                {(hasMajor || hasSubMajor) && (
                  <div className="flex flex-col gap-6 pt-2">

                    <div className="flex gap-8 justify-center flex-wrap">
                      {hasMajor && (
                        <ResultChart
                          title="Top 3 ngành gợi ý"
                          scores={majorScores}
                            colors={MAJOR_SHADES}
                            accentColor="var(--brand-red)"
                          recommended={majorSub?.majorName}
                        />
                      )}
                      {hasMajor && hasSubMajor && (
                        <div className="w-px self-stretch hidden sm:block" style={{ background: 'var(--border-soft)' }} />
                      )}
                      {hasSubMajor && (
                        <ResultChart
                          title="Top 3 chuyên ngành gợi ý"
                          scores={subMajorScores}
                            colors={SUB_SHADES}
                            accentColor="var(--brand-red)"
                          recommended={subMajorSub?.subMajorName}
                        />
                      )}
                    </div>
                    
                    {/* XAI Button */}
                    {majorSub?.details?.allScores && (
                      <div className="flex justify-center mt-6">
                        <button 
                          onClick={() => setXaiData(majorSub.details)}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-[color:var(--brand-blue-50)] hover:bg-[color:var(--brand-blue-100)] text-[color:var(--brand-blue)] text-xs font-bold rounded-lg border border-[color:var(--brand-blue-200)] transition shadow-sm"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 21h7a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v11m0 5l4.879-4.879m0 0a3 3 0 104.243-4.242 3 3 0 00-4.243 4.242z" /></svg>
                          Xem thuật toán SAW (XAI Debug)
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {!hasMajor && !hasSubMajor && (
                  <div className="text-xs text-center py-4" style={{ color: 'var(--ink-500)' }}>Không có dữ liệu điểm.</div>
                )}
              </div>
            )}
          </div>
        );
      })}
      
      <XaiModal details={xaiData} onClose={() => setXaiData(null)} />
    </div>
  );
}



