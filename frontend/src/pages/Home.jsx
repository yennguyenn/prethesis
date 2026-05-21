import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../api";

/* ── Stat card ── */
function StatCard({ value, label, color }) {
  return (
    <div
      className="rounded-2xl p-6 text-white flex items-center justify-between"
      style={{ background: color, boxShadow: "0 4px 20px rgba(0,0,0,0.12)" }}
    >
      <div>
        <div className="text-4xl font-extrabold leading-none mb-1">{value}</div>
        <div style={{ fontSize: 13, opacity: 0.85 }}>{label}</div>
      </div>
    </div>
  );
}

/* ── Step card ── */
function StepCard({ step, title, desc }) {
  return (
    <div className="bg-white rounded-2xl p-8 text-center shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <h3 className="text-base font-bold mb-2" style={{ color: "var(--brand-ocean)" }}>
        {step}. {title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

const PASTEL_CLASSES = ["bg-pastel-pink", "bg-pastel-orange", "bg-pastel-purple", "bg-pastel-green"];
const FILTERS = ["Tất cả", "Kinh tế", "Công nghệ", "Sức khỏe", "Khoa học"];

export default function Home() {
  const [majors, setMajors] = useState([]);
  const [activeFilter, setActiveFilter] = useState("Tất cả");
  useEffect(() => {
    (async () => {
      try {
        const r = await API.get("/majors");
        setMajors(Array.isArray(r.data) ? r.data : []);
      } catch {
        setMajors([]);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-transparent">
      {/* ── Hero ── */}
      <div className="relative py-20 px-4 overflow-hidden">
        <div className="container mx-auto text-left max-w-5xl relative z-10">
          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight" style={{ color: "#111" }}>
            Chào mừng bạn đến với<br />
            <span style={{ color: "var(--brand-purple-700)" }}>Support Career</span>
          </h1>
          <p className="text-lg mb-10 max-w-2xl text-slate-500 font-medium">
            Support Career đồng hành cùng bạn hỗ trợ đưa ra quyết định lựa chọn ngành nghề dựa trên bộ câu hỏi phân tích sở thích, năng lực và tính cách
          </p>
          <Link
            to="/quiz"
            className="inline-block px-10 py-4 text-lg font-extrabold rounded-full transition-all hover:opacity-90 hover:-translate-y-1 shadow-xl text-white bg-[#111]"
          >
            Bắt đầu làm bài đánh giá
          </Link>
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="container mx-auto px-6" style={{ marginTop: -40, position: "relative", zIndex: 10 }}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            value="60+"
            label="Câu hỏi định hướng"
            color="var(--brand-blue)"
          />
          <StatCard
            value="23"
            label="Ngành học"
            color="var(--brand-purple)"
          />
          <StatCard
            value="100%"
            label="Miễn phí"
            color="var(--brand-warm)"
          />
        </div>
      </div>

      {/* ── How It Works ── */}
      <div className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: "var(--brand-blue)" }}>
              Quy trình đánh giá
            </h2>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              Ba bước đơn giản giúp bạn tìm ra ngành học phù hợp nhất
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <StepCard step="1" title="Định hướng" desc="Trả lời 60 câu hỏi về sở thích, phong cách học tập và giá trị cá nhân để xác định nhóm phù hợp trong 23 ngành học." />
            <StepCard step="2" title="Phân tích điểm" desc="Thuật toán DSS tổng hợp điểm theo mã ngành và mã chuyên ngành để đưa ra gợi ý cá nhân hóa." />
            <StepCard step="3" title="Kết quả" desc="Nhận gợi ý ngành/chuyên ngành kèm mô tả và kỹ năng phù hợp với lĩnh vực đó." />
          </div>
        </div>
      </div>

      {/* ── Majors Preview ── */}
      <div className="py-16">
        <div className="container mx-auto px-6 max-w-5xl">
          <div className="mb-10 text-left">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-8" style={{ color: "#111" }}>
              Gợi ý 23 ngành học hiện có
            </h2>
            
            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-10">
              {FILTERS.map(f => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`px-5 py-2.5 rounded-full font-bold text-sm transition-all flex items-center ${
                    activeFilter === f
                      ? "bg-black text-white shadow-md"
                      : "bg-white text-slate-600 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {f === "Tất cả" && <span className="mr-2 opacity-80"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 0h6v6h-6z"/></svg></span>}
                  {f !== "Tất cả" && <span className="mr-2 opacity-80"><svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/></svg></span>}
                  {f}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
            {majors.slice(0, 8).map((m, index) => {
              const rawCode = (m.code || "").trim();
              const lower = rawCode.toLowerCase();
              const initialSrc = rawCode ? `/assets/majors/${rawCode}.png` : "/assets/majors/default.svg";
              const alts = rawCode
                ? `/assets/majors/${lower}.png,/assets/majors/${lower}.svg,/assets/majors/default.svg`
                : `/assets/majors/default.svg`;
              
              const colorClass = PASTEL_CLASSES[index % PASTEL_CLASSES.length];
              
              return (
                <Link
                  key={m.id}
                  to={`/careers/${m.code}`}
                  className={`group block ${colorClass} rounded-[28px] p-8 transition-transform hover:-translate-y-1 hover:shadow-xl relative`}
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-12 h-12 bg-white/60 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-sm">
                      <img
                        src={initialSrc}
                        alt={m.name}
                        loading="lazy"
                        className="h-7 w-7 object-contain"
                        data-alts={alts}
                        data-idx="0"
                        onError={(e) => {
                          const el = e.currentTarget;
                          const list = (el.getAttribute("data-alts") || "").split(",").filter(Boolean);
                          const idx = parseInt(el.getAttribute("data-idx") || "0", 10);
                          if (idx < list.length) {
                            el.src = list[idx];
                            el.setAttribute("data-idx", String(idx + 1));
                          } else {
                            el.onerror = null;
                            el.src = "/assets/majors/default.svg";
                          }
                        }}
                      />
                    </div>
                    <div className="bg-white/80 px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 flex items-center gap-1 shadow-sm">
                      <span className="text-orange-500">★</span> {Math.max(4.0, (5.0 - (index * 0.1))).toFixed(1)}
                    </div>
                  </div>
                  
                  <h3 className="font-extrabold text-xl leading-snug text-[#111] mb-8 pr-8 line-clamp-2 min-h-[56px]">
                    {m.name || m.code}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-auto">
                    <span className="text-sm font-semibold text-slate-700/80">{2000 + index * 342} quan tâm</span>
                    <div className="flex -space-x-2">
                      <div className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="avatar"/></div>
                      <div className="w-8 h-8 rounded-full bg-slate-400 border-2 border-white overflow-hidden"><img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Aneka" alt="avatar"/></div>
                    </div>
                  </div>
                </Link>
              );
            })}
            {majors.length === 0 &&
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-slate-100 rounded-[28px] p-8 animate-pulse">
                  <div className="h-12 w-12 bg-slate-200 rounded-2xl mb-6" />
                  <div className="h-6 bg-slate-200 rounded w-3/4 mb-4" />
                  <div className="h-4 bg-slate-200 rounded w-1/2 mb-8" />
                  <div className="h-4 bg-slate-200 rounded w-1/3 mt-auto" />
                </div>
              ))}
          </div>
          <div className="text-center">
            <Link
              to="/careers"
              className="inline-block px-10 py-4 font-bold rounded-full transition-all hover:shadow-lg hover:-translate-y-1 bg-[#111] text-white"
            >
              Xem tất cả ngành
            </Link>
          </div>
        </div>
      </div>
          </div>
  );
}

