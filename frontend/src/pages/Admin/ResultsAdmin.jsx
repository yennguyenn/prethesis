import React, { useEffect, useState } from "react";
import API, { setAuthToken } from "../../api";
import { RiasecRadarChart, XaiModal } from "../Results";

const MAJOR_SHADES  = ["#DC3E26", "#78a5a3", "#e1b16a"];
const SUB_SHADES     = ["#78a5a3", "#e1b16a", "#444c5c"];
const AVATAR_COLORS  = ["#444c5c", "#78a5a3", "#DC3E26"];

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
        const x2 = cx + r * Math.cos(end),   y2 = cy + r * Math.sin(end);
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

export default function ResultsAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [expandedUser, setExpandedUser] = useState(null);
  const [expandedSubId, setExpandedSubId] = useState(null);
  const [xaiData, setXaiData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
    API.get("/admin/submissions?page=1&pageSize=50")
      .then((r) => {
        const data = r?.data?.items ?? r?.data ?? [];
        setItems(Array.isArray(data) ? data : []);
      })
      .catch((e) => setError(e?.response?.data?.message || e.message || "Không thể tải danh sách bài nộp"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-sm" style={{ color: 'var(--ink-500)' }}>Đang tải...</div>;
  if (error) return <div className="p-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">{error}</div>;

  // Group ALL submissions by user
  const groupedMap = {};
  for (const s of items) {
    const key = String(s.user?.id ?? s.user?.email ?? "anon");
    if (!groupedMap[key]) groupedMap[key] = { user: s.user, allSubs: [] };
    groupedMap[key].allSubs.push(s);
  }

  const groups = Object.entries(groupedMap).map(([key, g]) => {
    const sorted = [...g.allSubs].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1));
    const major    = sorted.find((s) => !s.subMajorCode) || null;
    const subMajor = sorted.find((s) =>  s.subMajorCode) || null;
    return { key, user: g.user, major, subMajor, allSubs: sorted };
  }).filter((g) => {
    if (!query) return true;
    const term = query.toLowerCase();
    return (
      (g.user?.name || "").toLowerCase().includes(term) ||
      (g.user?.email || "").toLowerCase().includes(term)
    );
  });

  const latestDate = (g) => {
    const d1 = g.major?.createdAt;
    const d2 = g.subMajor?.createdAt;
    if (!d1) return d2;
    if (!d2) return d1;
    return d1 > d2 ? d1 : d2;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h3 className="text-xl font-bold" style={{ color: "var(--brand-blue)" }}>Kết quả người dùng</h3>
        <input
          className="w-64 border rounded-lg px-3 py-2 text-sm bg-white"
          style={{ borderColor: 'var(--border-soft)', color: 'var(--ink-700)' }}
          placeholder="Tìm theo tên, email..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {groups.length === 0 && (
        <div className="text-sm py-8 text-center" style={{ color: 'var(--ink-500)' }}>Không có kết quả nào.</div>
      )}

      {groups.map((g, idx) => {
        const user = g.user;

        // Pair submissions into attempt sessions: nth major + nth sub-major (newest first)
        const majorSubs    = g.allSubs.filter(s => !s.subMajorCode);
        const subMajorSubs = g.allSubs.filter(s =>  s.subMajorCode);
        const attemptCount = Math.max(majorSubs.length, subMajorSubs.length, 1);
        const attempts = Array.from({ length: attemptCount }, (_, i) => ({
          majorSub:    majorSubs[i]    ?? null,
          subMajorSub: subMajorSubs[i] ?? null,
          num: attemptCount - i,
        }));

        // Latest submission charts (first attempt = newest)
        const latestMajor    = attempts[0].majorSub;
        const latestSubMajor = attempts[0].subMajorSub;
        const majorScores    = Array.isArray(latestMajor?.details?.allScores)    ? latestMajor.details.allScores    : [];
        const subMajorScores = Array.isArray(latestSubMajor?.details?.allScores) ? latestSubMajor.details.allScores : [];
        const hasMajor    = majorScores.length > 0;
        const hasSubMajor = subMajorScores.length > 0;

        const date = latestDate(g);
        const dateObj = date ? new Date(date) : null;
        const dateStr = dateObj ? dateObj.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
        const timeStr = dateObj ? dateObj.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "";

        const recommendedMajor    = latestMajor?.majorName;
        const recommendedSubMajor = latestSubMajor?.subMajorName;

        const isExpanded  = expandedUser === g.key;
        const hasHistory  = attemptCount > 1;

        return (
          <div key={g.key} className="bg-white rounded-2xl border shadow-sm overflow-hidden" style={{ borderColor: 'var(--border-soft)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border-soft)' }}>
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-white text-sm font-bold shrink-0"
                  style={{ background: AVATAR_COLORS[idx % AVATAR_COLORS.length] }}
                >
                  {(user?.name || "?")[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold" style={{ color: 'var(--ink-700)' }}>{user?.name || "Ẩn danh"}</div>
                  <div className="text-xs" style={{ color: 'var(--ink-500)' }}>{user?.email || "—"}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap justify-end">
                {/* History toggle button — only shown when >1 attempt */}
                {hasHistory && (
                  <button
                    onClick={() => setExpandedUser(isExpanded ? null : g.key)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors"
                    style={
                      isExpanded
                        ? { background: 'var(--surface-muted)', color: 'var(--brand-blue)', borderColor: 'var(--border-soft)' }
                        : { background: '#fff8f4', color: 'var(--ink-500)', borderColor: 'var(--border-soft)' }
                    }
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 12, height: 12 }}>
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {attemptCount} lần làm
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                      style={{ width: 12, height: 12, transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                )}

                {/* Latest date pill */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl" style={{ background: 'var(--surface-muted)', border: '1px solid var(--border-soft)' }}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="var(--ink-500)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 14, height: 14, flexShrink: 0 }}>
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  <div className="text-right">
                    <div className="text-[10px] leading-none mb-0.5" style={{ color: 'var(--ink-400)' }}>Lần làm gần nhất</div>
                    <div className="text-xs font-semibold leading-none" style={{ color: 'var(--ink-700)' }}>{dateStr} <span style={{ color: 'var(--ink-400)', fontWeight: 400 }}>{timeStr}</span></div>
                  </div>
                </div>
              </div>
            </div>

            {(hasMajor || hasSubMajor) ? (
              <div className="flex flex-col w-full">
                <div className="px-5 py-5 flex gap-8 justify-center flex-wrap">
                  {hasMajor && (
                    <ResultChart
                      title="Top 3 ngành gợi ý"
                      scores={majorScores}
                      colors={MAJOR_SHADES}
                      accentColor="#DC3E26"
                      recommended={recommendedMajor}
                    />
                  )}
                  {hasMajor && hasSubMajor && (
                    <div className="w-px bg-slate-100 self-stretch hidden sm:block" />
                  )}
                  {hasSubMajor && (
                    <ResultChart
                      title="Top 3 chuyên ngành gợi ý"
                      scores={subMajorScores}
                      colors={SUB_SHADES}
                      accentColor="var(--brand-ocean)"
                      recommended={recommendedSubMajor}
                    />
                  )}
                </div>
                
                {/* Phần chung: Radar & XAI */}
                {(latestMajor?.details?.weights || latestSubMajor?.details?.weights) && (
                  <div className="px-5 pb-6 flex flex-col items-center justify-center border-t border-slate-100 pt-5 mt-2">
                    <div className="w-full max-w-[350px]">
                      <RiasecRadarChart weights={latestMajor?.details?.weights || latestSubMajor?.details?.weights} />
                    </div>
                    
                    {(latestMajor?.details?.normalizedMatrix || latestSubMajor?.details?.normalizedMatrix) && (
                      <button 
                        onClick={() => setXaiData(latestMajor?.details || latestSubMajor?.details)}
                        className="mt-4 px-4 py-2 text-sm font-semibold rounded-xl bg-[color:var(--brand-blue-50)] text-[color:var(--brand-blue)] hover:bg-[color:var(--brand-blue-100)] transition-colors border border-[color:var(--brand-blue-200)] flex items-center gap-2 shadow-sm"
                      >
                        <span className="text-lg">⚙️</span> Giải mã Thuật toán SAW
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-center py-6" style={{ color: 'var(--ink-400)' }}>Không có dữ liệu điểm.</div>
            )}

            {/* History panel — expandable */}
            {isExpanded && (
              <div className="border-t px-5 py-4" style={{ borderColor: 'var(--border-soft)', background: 'var(--surface-muted)' }}>
                <div className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: 'var(--ink-400)' }}>Lịch sử tất cả các lần làm</div>
                <div className="space-y-2">
                  {attempts.map((attempt, i) => {
                    const ms = attempt.majorSub;
                    const ss = attempt.subMajorSub;
                    const mScores = Array.isArray(ms?.details?.allScores) ? ms.details.allScores : [];
                    const sScores = Array.isArray(ss?.details?.allScores) ? ss.details.allScores : [];
                    const hasM = mScores.length > 0;
                    const hasS = sScores.length > 0;

                    // Representative date = newest of the two subs in this attempt
                    const dates = [ms?.createdAt, ss?.createdAt].filter(Boolean).sort().reverse();
                    const sDate    = dates[0] ? new Date(dates[0]) : null;
                    const sDateStr = sDate ? sDate.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
                    const sTimeStr = sDate ? sDate.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) : "";

                    const isLatest     = i === 0;
                    const subKey       = `${g.key}-attempt-${i}`;
                    const isSubExpanded = expandedSubId === subKey;
                    const hasAnyChart  = hasM || hasS;

                    return (
                      <div key={subKey}>
                        <button
                          onClick={() => hasAnyChart && setExpandedSubId(isSubExpanded ? null : subKey)}
                          className="w-full flex items-center gap-3 bg-white rounded-xl px-4 py-3 border transition-all text-left"
                          style={{
                            cursor: hasAnyChart ? "pointer" : "default",
                            borderColor: 'var(--border-soft)',
                            ...(isSubExpanded ? { background: 'var(--surface-muted)', borderBottomLeftRadius: 0, borderBottomRightRadius: 0 } : {}),
                          }}
                        >
                          {/* Attempt number */}
                          <div className="text-[11px] font-bold w-5 shrink-0 text-center" style={{ color: 'var(--ink-400)' }}>#{attempt.num}</div>

                          {/* Date */}
                          <div className="text-[11px] w-28 shrink-0" style={{ color: 'var(--ink-500)' }}>
                            <div className="font-medium leading-tight" style={{ color: 'var(--ink-700)' }}>{sDateStr}</div>
                            <div className="leading-tight">{sTimeStr}</div>
                          </div>

                          {/* Recommended names */}
                          <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                            {ms && (
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0" style={{ background: 'var(--surface-muted)', color: 'var(--brand-blue)' }}>Ngành</span>
                                <span className="text-xs truncate" style={{ color: 'var(--ink-700)' }}>{ms.majorName || "—"}</span>
                              </div>
                            )}
                            {ss && (
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-semibold shrink-0" style={{ background: '#eff7f6', color: 'var(--brand-ocean)' }}>Chuyên ngành</span>
                                <span className="text-xs truncate" style={{ color: 'var(--ink-700)' }}>{ss.subMajorName || "—"}</span>
                              </div>
                            )}
                          </div>

                          {/* Latest badge */}
                          {isLatest && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold shrink-0" style={{ background: 'var(--brand-warm-50)', color: 'var(--brand-warm-700)' }}>
                              Mới nhất
                            </span>
                          )}

                          {/* Chevron */}
                          {hasAnyChart && (
                            <svg viewBox="0 0 24 24" fill="none" stroke="var(--brand-blue)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                              style={{ width: 12, height: 12, flexShrink: 0, transform: isSubExpanded ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                              <polyline points="6 9 12 15 18 9"/>
                            </svg>
                          )}
                        </button>

                        {/* Inline charts for this attempt — both major and sub-major */}
                        {isSubExpanded && hasAnyChart && (
                          <div
                            className="flex gap-8 justify-center flex-wrap px-4 py-5 rounded-b-xl border border-t-0"
                            style={{ borderColor: 'var(--border-soft)', background: 'var(--surface-muted)' }}
                          >
                            {hasM && (
                              <ResultChart
                                title="Top 3 ngành gợi ý"
                                scores={mScores}
                                colors={MAJOR_SHADES}
                                accentColor="#DC3E26"
                                recommended={ms.majorName}
                              />
                            )}
                            {hasM && hasS && (
                              <div className="w-px self-stretch hidden sm:block" style={{ background: 'var(--border-soft)' }} />
                            )}
                            {hasS && (
                              <ResultChart
                                title="Top 3 chuyên ngành gợi ý"
                                scores={sScores}
                                colors={SUB_SHADES}
                                accentColor="var(--brand-ocean)"
                                recommended={ss.subMajorName}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}

      <XaiModal details={xaiData} onClose={() => setXaiData(null)} />
    </div>
  );
}

