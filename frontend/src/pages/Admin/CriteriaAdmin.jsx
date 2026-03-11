import React, { useEffect, useState } from 'react';
import API, { setAuthToken } from '../../api';

const CARD_COLORS = [
  { bg: '#faf5ff', border: '#c4b5fd', accent: '#8b5cf6', light: '#ede9fe' },
  { bg: '#f0fdf4', border: '#bbf7d0', accent: '#16a34a', light: '#dcfce7' },
  { bg: '#eff6ff', border: '#bfdbfe', accent: '#2563eb', light: '#dbeafe' },
  { bg: '#fff1f2', border: '#fecdd3', accent: '#ef4444', light: '#fee2e2' },
];

export default function CriteriaAdmin() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState({});
  const [openGroup, setOpenGroup] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) setAuthToken(token);
    API.get('/admin/criteria')
      .then((r) => setItems(r.data || []))
      .catch((e) => setError(e?.response?.data?.message || e.message || 'Không thể tải tiêu chí'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-6 text-sm text-slate-500">Đang tải...</div>;
  if (error) return <div className="p-6 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl">{error}</div>;

  const toggleExpand = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  // Split by levelId (1 = chọn ngành, 2 = chọn chuyên ngành)
  // Fallback: only C1–C5 are level 1 (chọn ngành), everything else is level 2
  const isLevel1 = (c) => (c.levelId != null ? c.levelId === 1 : /^C[1-5]$/.test(c.code));
  const level1 = items.filter(isLevel1);
  const level2 = items.filter(c => !isLevel1(c));

  const renderGroup = (groupItems, baseIdx) => groupItems.map((c, i) => {
    const idx = baseIdx + i;
    const col = CARD_COLORS[idx % CARD_COLORS.length];
    const questions = (c.QuestionCriteriaMaps || []).map(m => m.Question).filter(Boolean);
    const isOpen = !!expanded[c.id];
    return (
      <div
        key={c.id}
        style={{ background: col.bg, border: `1.5px solid ${col.border}`, borderRadius: 14, overflow: 'hidden' }}
      >
        <button
          onClick={() => toggleExpand(c.id)}
          style={{ width: '100%', display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: col.light, color: col.accent,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 14, fontWeight: 800, marginTop: 1
          }}>
            {i + 1}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: col.accent, lineHeight: 1.3 }}>{c.name}</div>
            {c.description && (
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 4, lineHeight: 1.5 }}>{c.description}</div>
            )}
            <div style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{
                fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                background: col.light, color: col.accent
              }}>
                {questions.length} câu hỏi
              </span>
              {questions.length > 0 && (
                <span style={{ fontSize: 11, color: '#94a3b8' }}>
                  {isOpen ? 'Ẩn câu hỏi' : 'Xem câu hỏi'}
                </span>
              )}
            </div>
          </div>
          {questions.length > 0 && (
            <svg viewBox="0 0 24 24" fill="none" stroke={col.accent} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ width: 16, height: 16, flexShrink: 0, marginTop: 4, transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          )}
        </button>
        {isOpen && questions.length > 0 && (
          <div style={{ borderTop: `1px solid ${col.border}`, padding: '12px 20px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {questions.map((q, qi) => (
                <div key={q.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  background: '#fff', borderRadius: 10, padding: '10px 14px',
                  border: `1px solid ${col.border}`
                }}>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 20, flexShrink: 0, marginTop: 1,
                    background: col.light, color: col.accent
                  }}>Q{qi + 1}</span>
                  <span style={{ fontSize: 13, color: '#1e293b', lineHeight: 1.5 }}>{q.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  });

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold" style={{ color: '#8b5cf6' }}>Tiêu chí chấm điểm</h3>
      {items.length === 0 && <div className="text-sm text-slate-500 py-8 text-center">Không có tiêu chí.</div>}

      {/* ── Group 1: Chọn Ngành ── */}
      {level1.length > 0 && (
        <div style={{
          borderRadius: 16, overflow: 'hidden',
          border: openGroup === 'l1' ? '2px solid #16a34a' : '2px solid #bbf7d0',
          boxShadow: openGroup === 'l1' ? '0 4px 20px rgba(22,163,74,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          background: '#fff',
        }}>
          <button
            onClick={() => setOpenGroup(openGroup === 'l1' ? null : 'l1')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 16,
              padding: '18px 24px', border: 'none', cursor: 'pointer', textAlign: 'left',
              background: openGroup === 'l1' ? '#16a34a' : '#fff',
              transition: 'background 0.25s',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: openGroup === 'l1' ? 'rgba(255,255,255,0.22)' : '#dcfce7',
              color: openGroup === 'l1' ? '#fff' : '#16a34a',
              transition: 'background 0.25s',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
                <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: openGroup === 'l1' ? '#fff' : '#1e293b', lineHeight: 1.3 }}>
                Tiêu chí chọn Ngành
              </div>
              <div style={{ fontSize: 13, color: openGroup === 'l1' ? 'rgba(255,255,255,0.75)' : '#64748b', marginTop: 2 }}>
                Dùng ở vòng 1 – xác định nhóm ngành phù hợp
              </div>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, flexShrink: 0,
              background: openGroup === 'l1' ? 'rgba(255,255,255,0.22)' : '#dcfce7',
              color: openGroup === 'l1' ? '#fff' : '#16a34a',
              transition: 'background 0.25s, color 0.25s',
            }}>
              {level1.length} tiêu chí
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke={openGroup === 'l1' ? '#fff' : '#16a34a'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ width: 18, height: 18, flexShrink: 0, transform: openGroup === 'l1' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {openGroup === 'l1' && (
            <div style={{ padding: '20px 24px 24px', borderTop: '1px solid #bbf7d040', background: '#fafafa' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {renderGroup(level1, 0)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Group 2: Chọn Chuyên ngành ── */}
      {level2.length > 0 && (
        <div style={{
          borderRadius: 16, overflow: 'hidden',
          border: openGroup === 'l2' ? '2px solid #2563eb' : '2px solid #bfdbfe',
          boxShadow: openGroup === 'l2' ? '0 4px 20px rgba(37,99,235,0.12)' : '0 1px 4px rgba(0,0,0,0.06)',
          transition: 'border-color 0.2s, box-shadow 0.2s',
          background: '#fff',
        }}>
          <button
            onClick={() => setOpenGroup(openGroup === 'l2' ? null : 'l2')}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: 16,
              padding: '18px 24px', border: 'none', cursor: 'pointer', textAlign: 'left',
              background: openGroup === 'l2' ? '#2563eb' : '#fff',
              transition: 'background 0.25s',
            }}
          >
            <div style={{
              width: 48, height: 48, borderRadius: 12, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: openGroup === 'l2' ? 'rgba(255,255,255,0.22)' : '#dbeafe',
              color: openGroup === 'l2' ? '#fff' : '#2563eb',
              transition: 'background 0.25s',
            }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 26, height: 26 }}>
                <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
              </svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: openGroup === 'l2' ? '#fff' : '#1e293b', lineHeight: 1.3 }}>
                Tiêu chí chọn Chuyên ngành Máy tính &amp; CNTT
              </div>
              <div style={{ fontSize: 13, color: openGroup === 'l2' ? 'rgba(255,255,255,0.75)' : '#64748b', marginTop: 2 }}>
                Dùng ở vòng 2 – xác định chuyên ngành chi tiết trong CIT
              </div>
            </div>
            <span style={{
              fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, flexShrink: 0,
              background: openGroup === 'l2' ? 'rgba(255,255,255,0.22)' : '#dbeafe',
              color: openGroup === 'l2' ? '#fff' : '#2563eb',
              transition: 'background 0.25s, color 0.25s',
            }}>
              {level2.length} tiêu chí
            </span>
            <svg viewBox="0 0 24 24" fill="none" stroke={openGroup === 'l2' ? '#fff' : '#2563eb'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
              style={{ width: 18, height: 18, flexShrink: 0, transform: openGroup === 'l2' ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.25s' }}>
              <polyline points="6 9 12 15 18 9"/>
            </svg>
          </button>
          {openGroup === 'l2' && (
            <div style={{ padding: '20px 24px 24px', borderTop: '1px solid #bfdbfe40', background: '#fafafa' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {renderGroup(level2, level1.length)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
