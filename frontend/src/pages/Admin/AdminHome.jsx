import React, { useState } from "react";
import Majors from "./Majors";
import QuestionList from "./QuestionList";
import ResultsAdmin from "./ResultsAdmin";
import CriteriaAdmin from "./CriteriaAdmin";
import UsersAdmin from "./Users";

const IconChevron = ({ open }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
    style={{ width: 18, height: 18, transition: "transform 0.25s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
    <polyline points="6 9 12 15 18 9"/>
  </svg>
);

/* ── 5 section panels config ── */
const PANELS = [
  {
    id: "majors",
    label: "Ngành",
    desc: "Quản lý danh sách ngành đào tạo",
    color: "#3b82f6",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    component: <Majors />,
  },
  {
    id: "questions",
    label: "Câu hỏi",
    desc: "Quản lý ngân hàng câu hỏi",
    color: "#8b5cf6",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
    component: <QuestionList />,
  },
  {
    id: "results",
    label: "Kết quả",
    desc: "Xem kết quả và bài nộp của học sinh",
    color: "#22c55e",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
    component: <ResultsAdmin />,
  },
  {
    id: "criteria",
    label: "Tiêu chí",
    desc: "Cấu hình tiêu chí và quy tắc từ khóa",
    color: "#8b5cf6",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
    component: <CriteriaAdmin />,
  },
  {
    id: "users",
    label: "Người dùng",
    desc: "Quản lý tài khoản người dùng",
    color: "#ef4444",
    icon: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
    component: <UsersAdmin />,
  },
];

/* ── Main component ── */
export default function AdminHome() {
  const [openPanel, setOpenPanel] = useState(null);

  const togglePanel = (id) => setOpenPanel((cur) => (cur === id ? null : id));

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", paddingTop: 8 }}>
      {/* Page heading */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#8b5cf6", margin: 0 }}>
          Tổng quan hệ thống
        </h2>
        <p style={{ fontSize: 13, color: "#64748b", marginTop: 4 }}>
          Chọn mục để quản lý nội dung
        </p>
      </div>

      {/* ── 5 Section panels ── */}
      <div style={{ marginBottom: 8 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>
          Quản lý nội dung
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {PANELS.map((panel) => {
            const isOpen = openPanel === panel.id;
            return (
              <div
                key={panel.id}
                style={{
                  borderRadius: 14,
                  overflow: "hidden",
                  boxShadow: isOpen ? "0 4px 24px rgba(0,0,0,0.10)" : "0 1px 6px rgba(0,0,0,0.07)",
                  border: isOpen ? `2px solid ${panel.color}` : "2px solid transparent",
                  transition: "box-shadow 0.2s, border-color 0.2s",
                  background: "#fff",
                }}
              >
                {/* Panel header (clickable) */}
                <button
                  onClick={() => togglePanel(panel.id)}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    padding: "18px 24px",
                    background: isOpen ? panel.color : "#fff",
                    border: "none",
                    cursor: "pointer",
                    transition: "background 0.25s",
                    textAlign: "left",
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                      background: isOpen ? "rgba(255,255,255,0.22)" : panel.color,
                      color: "#fff",
                      transition: "background 0.25s",
                    }}
                  >
                    {panel.icon}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: isOpen ? "#fff" : "#1e293b", lineHeight: 1.3 }}>
                      {panel.label}
                    </div>
                    <div style={{ fontSize: 13, color: isOpen ? "rgba(255,255,255,0.75)" : "#64748b", marginTop: 2 }}>
                      {panel.desc}
                    </div>
                  </div>
                  <div style={{ color: isOpen ? "#fff" : panel.color, flexShrink: 0 }}>
                    <IconChevron open={isOpen} />
                  </div>
                </button>

                {/* Panel content */}
                {isOpen && (
                  <div style={{ padding: "24px", borderTop: `1px solid ${panel.color}22`, background: "#fafafa" }}>
                    {panel.component}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
