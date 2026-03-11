import React, { useState } from "react";
import API from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!form.name || !form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    if (form.password !== form.confirm) {
      setError("Mật khẩu không khớp");
      return;
    }
    setLoading(true);
    try {
      const payload = { name: form.name, email: form.email, password: form.password };
      const res = await API.post("/auth/register", payload);
      if (res.status === 204 || res.status === 200) {
        setSuccess("Đăng ký thành công. Bạn có thể đăng nhập ngay.");
        setTimeout(() => nav("/login"), 1200);
      } else {
        setError(res?.data?.message || "Phản hồi không hợp lệ");
      }
    } catch (err) {
      const msg = err?.response?.data?.message || "Đăng ký thất bại";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative isolate">
      <div className="absolute inset-0 bg-slate-900/90" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="relative backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl p-8 text-white">
          <button
            type="button"
            onClick={() => nav("/")}
            aria-label="Đóng đăng ký"
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white text-xl leading-none transition-colors"
          >
            &times;
          </button>
          <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: "#8b5cf6" }}>Đăng ký</h2>
          {error && (
            <div className="mb-4 text-sm bg-red-500/20 border border-red-500/40 text-red-200 rounded px-3 py-2">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 text-sm bg-primary-500/20 border border-primary-500/40 text-primary-300 rounded px-3 py-2">
              {success}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm mb-1">Họ và tên</label>
              <input
                id="name"
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/15 border border-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-slate-300 text-white"
                placeholder="Nhập họ và tên"
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm mb-1">Email</label>
              <input
                id="email"
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/15 border border-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-slate-300 text-white"
                placeholder="ban@vidu.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm mb-1">Mật khẩu</label>
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
            <div>
              <label htmlFor="confirm" className="block text-sm mb-1">Xác nhận mật khẩu</label>
              <input
                id="confirm"
                type="password"
                required
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/15 border border-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-slate-300 text-white"
                placeholder="Nhập lại mật khẩu"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-white"
              style={{ background: "#3b82f6" }}
            >
              {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </button>
          </form>
          <div className="text-center mt-5 text-sm">
            Đã có tài khoản?{' '}
            <Link to="/login" className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4">
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
