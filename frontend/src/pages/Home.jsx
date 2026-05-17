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
      <h3 className="text-base font-bold mb-2" style={{ color: "var(--brand-blue)" }}>
        {step}. {title}
      </h3>
      <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
    </div>
  );
}

export default function Home() {
  const [majors, setMajors] = useState([]);
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
    <div className="min-h-screen" style={{ background: "var(--surface-muted)" }}>

      {/* ── Hero ── */}
      <div
        className="relative py-28 overflow-hidden border-b"
        style={{ background: "#fff", borderColor: "var(--border-soft)" }}
      >
        <div className="container mx-auto px-6 text-center relative z-10">
          <h1 className="text-5xl md:text-6xl font-extrabold mb-5 leading-tight" style={{ color: "var(--brand-blue)" }}>
            Chào mừng bạn đến với<br />
            <span style={{ color: "var(--brand-purple)" }}>Support Career</span>
          </h1>
          <p className="text-base md:text-lg mb-10 max-w-2xl mx-auto text-slate-500">
            Support Career đồng hành cùng bạn hỗ trợ đưa ra quyết định lựa chọn ngành nghề dựa trên bộ câu hỏi phân tích sở thích, năng lực và tính cách
          </p>
          <Link
            to="/quiz"
            className="inline-block px-8 py-3.5 text-lg font-bold rounded-xl transition-all hover:opacity-90 hover:scale-105 text-white"
            style={{ background: "var(--brand-red)" }}
          >
            Bắt đầu làm bài đánh giá →
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
            color="var(--brand-red)"
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
      <div className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: "var(--brand-blue)" }}>
              Gợi ý 23 ngành học hiện có
            </h2>
            <p className="text-slate-500 text-sm max-w-xl mx-auto">
              Danh sách đa dạng lĩnh vực ngành học như: Kinh tế, Khoa học, Công nghệ, Nghệ thuật, ...
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-10">
            {majors.slice(0, 23).map((m) => {
              const rawCode = (m.code || "").trim();
              const lower = rawCode.toLowerCase();
              const initialSrc = rawCode ? `/assets/majors/${rawCode}.png` : "/assets/majors/default.svg";
              const alts = rawCode
                ? [`/assets/majors/${lower}.png`, `/assets/majors/${lower}.svg`, `/assets/majors/default.svg`]
                : [`/assets/majors/default.svg`];
              return (
                <Link
                  key={m.id}
                  to={`/careers/${m.code}`}
                  className="group block bg-slate-50 rounded-xl p-4 text-center hover:bg-white hover:shadow-md border border-slate-100 transition-all"
                >
                  <img
                    src={initialSrc}
                    alt={m.name}
                    loading="lazy"
                    className="h-11 w-11 mx-auto mb-3 object-contain"
                    data-alts={alts.join(",")}
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
                  <h3 className="font-semibold line-clamp-2 text-xs leading-snug" style={{ color: "var(--brand-blue)" }}>
                    {m.name || m.code}
                  </h3>
                </Link>
              );
            })}
            {majors.length === 0 &&
              Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 animate-pulse">
                  <div className="h-8 w-8 bg-slate-200 rounded-full mx-auto mb-3" />
                  <div className="h-3 bg-slate-200 rounded w-3/4 mx-auto mb-2" />
                  <div className="h-2 bg-slate-100 rounded w-1/2 mx-auto" />
                </div>
              ))}
          </div>
          <div className="text-center">
            <Link
              to="/careers"
              className="inline-block px-8 py-3 text-white font-semibold rounded-xl transition-all hover:shadow-lg hover:scale-105"
              style={{ background: "var(--brand-blue)" }}
            >
              Xem tất cả ngành
            </Link>
          </div>
        </div>
      </div>
          </div>
  );
}

