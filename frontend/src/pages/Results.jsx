import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API, { setAuthToken } from "../api";

const GREEN_SHADES = ["#16a34a", "#4ade80", "#bbf7d0"];
const BLUE_SHADES = ["#2563eb", "#60a5fa", "#bfdbfe"];

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
              <span className="truncate text-slate-700 flex-1 leading-tight" title={r.name}>{r.name}</span>
              <span className="font-semibold shrink-0" style={{ color: colors[i % colors.length] }}>{pct}%</span>
            </div>
          );
        })}
      </div>
      {recommended && (
        <div className="mt-3 text-xs text-center">
          <span className="text-slate-500">Đề xuất: </span>
          <span className="font-semibold" style={{ color: accentColor }}>{recommended}</span>
        </div>
      )}
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
  const token = localStorage.getItem("token");

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    setAuthToken(token);
    API.get("/results/me")
      .then((r) => setSubs(Array.isArray(r.data) ? r.data : []))
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
      <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
        <h2 className="text-xl font-semibold mb-3" style={{ color: "#8b5cf6" }}>Yêu cầu đăng nhập</h2>
        <p className="text-gray-600 mb-6">Bạn cần đăng nhập để xem kết quả đánh giá đã lưu.</p>
        <Link to="/login" className="inline-block px-6 py-3 rounded-lg text-white font-semibold shadow-md"
          style={{ background: "#8b5cf6" }}>Đi tới trang đăng nhập</Link>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-4">
      <h1 className="text-2xl font-bold" style={{ color: "#8b5cf6" }}>Kết quả đánh giá của tôi</h1>

      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4" />
            <p className="text-slate-500 text-sm">Đang tải kết quả...</p>
          </div>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-xl text-sm">{error}</div>
      )}

      {!loading && !error && attempts.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm text-center">
          <h2 className="text-lg font-semibold mb-2" style={{ color: "#8b5cf6" }}>Chưa có kết quả</h2>
          <p className="text-slate-500 mb-6 text-sm">Bạn chưa hoàn thành bài đánh giá nào khi đang đăng nhập.</p>
          <Link to="/quiz" className="inline-block px-6 py-3 rounded-lg text-white font-semibold shadow-md"
            style={{ background: "#8b5cf6" }}>Làm bài đánh giá</Link>
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
          <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Header row — click anywhere to toggle */}
            <button
              onClick={() => setExpandedId(isExpanded ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-slate-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-bold shrink-0"
                  style={{ background: "#8b5cf6" }}>
                  {num}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-800">Lần làm thứ {num}</div>
                  <div className="flex items-center gap-2 text-[11px] mt-0.5">
                    <span className="text-slate-400">{dateStr} {timeStr}</span>
                    {(() => {
                      const score = subMajorSub?.score ?? majorSub?.score;
                      if (score == null) return null;
                      const displayPct = subMajorSub?.percentage ?? majorSub?.percentage ?? (score * 100).toFixed(2);
                      return (
                        <>
                          <span className="text-slate-300">•</span>
                          <span className="font-medium" style={{ color: "#8b5cf6" }}>
                            Tỉ lệ: {displayPct}%
                          </span>
                          <span className="text-slate-300">•</span>
                          <span className="font-medium text-slate-500">
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
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: "#fef9c3", color: "#854d0e" }}>
                    Mới nhất
                  </span>
                )}
                <span
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors"
                  style={isExpanded
                    ? { background: "#ede9fe", color: "#7c3aed", borderColor: "#c4b5fd" }
                    : { background: "#f8fafc", color: "#64748b", borderColor: "#e2e8f0" }}
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
              <div className="border-t border-slate-100 px-5 py-5 space-y-5">
                {/* Charts */}
                {(hasMajor || hasSubMajor) && (
                  <div className="flex gap-8 justify-center flex-wrap pt-2">
                    {hasMajor && (
                      <ResultChart
                        title="Top 3 ngành gợi ý"
                        scores={majorScores}
                        colors={GREEN_SHADES}
                        accentColor="#16a34a"
                        recommended={majorSub?.majorName}
                      />
                    )}
                    {hasMajor && hasSubMajor && (
                      <div className="w-px bg-slate-100 self-stretch hidden sm:block" />
                    )}
                    {hasSubMajor && (
                      <ResultChart
                        title="Top 3 chuyên ngành gợi ý"
                        scores={subMajorScores}
                        colors={BLUE_SHADES}
                        accentColor="#2563eb"
                        recommended={subMajorSub?.subMajorName}
                      />
                    )}
                  </div>
                )}

                {!hasMajor && !hasSubMajor && (
                  <div className="text-xs text-slate-400 text-center py-4">Không có dữ liệu điểm.</div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}



