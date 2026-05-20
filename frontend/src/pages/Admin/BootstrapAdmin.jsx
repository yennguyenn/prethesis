import React, { useState } from "react";
import API from "../../api";
import { useNavigate } from "react-router-dom";

export default function BootstrapAdmin() {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await API.post("/admin/bootstrap-admin", form);
      setSuccess("Tạo quản trị viên thành công! Bạn có thể đăng nhập ngay.");
      setTimeout(() => nav("/login"), 1500);
    } catch (err) {
      setError(err?.response?.data?.message || "Không thể tạo quản trị viên");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative isolate" style={{ background: "linear-gradient(180deg, var(--brand-blue) 0%, #1d222b 100%)" }}>
      <div className="absolute inset-0" style={{ background: "rgba(29,34,43,0.72)" }} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="relative backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl p-8 text-white">
          <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: "var(--brand-warm)" }}>Khởi tạo quản trị viên</h2>
          {error && (
            <div className="mb-4 text-sm bg-red-500/20 border border-red-500/40 text-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 text-sm bg-green-500/20 border border-green-500/40 text-green-200 rounded px-3 py-2">
              {success}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="name">Họ và tên</label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/15 border border-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-slate-300 text-white"
                placeholder="Tên quản trị viên"
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/15 border border-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-slate-300 text-white"
                placeholder="admin@vidu.com"
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/15 border border-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-slate-300 text-white"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-white"
              style={{ background: "var(--brand-red)", color: "#fff" }}
            >
              {loading ? "Đang xử lý..." : "Tạo quản trị viên"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
