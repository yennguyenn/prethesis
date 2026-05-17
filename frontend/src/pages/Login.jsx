import React, { useState } from "react";
import API, { setAuthToken } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await API.post("/auth/login", form);
      const { token, user } = res.data;
      if (token) {
        localStorage.setItem("token", token);
        if (user) localStorage.setItem("user", JSON.stringify(user));
        setAuthToken(token);
        if (user?.role === "admin") nav("/admin");
        else nav("/quiz");
      } else {
        setError("Không nhận được token");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "var(--surface-muted)" }}>
      <div className="w-full max-w-md mx-auto px-4">
        <div className="relative bg-white border border-slate-200 rounded-2xl shadow-lg p-8">
          <button
            type="button"
            onClick={() => nav("/")}
            aria-label="Đóng đăng nhập"
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xl leading-none transition-colors"
          >
            &times;
          </button>
          <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: "var(--brand-blue)" }}>Đăng nhập</h2>
          {error && (
            <div className="mb-4 text-sm bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2">
              {error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm mb-1" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 placeholder:text-slate-400 text-slate-700"
                placeholder="ban@vidu.com"
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="password">Mật khẩu</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 placeholder:text-slate-400 text-slate-700"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-white"
              style={{ background: "var(--brand-blue)" }}
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>
          <div className="text-center mt-5 text-sm">
            Chưa có tài khoản?{' '}
            <Link to="/register" className="underline underline-offset-4" style={{ color: "var(--brand-purple)" }}>
              Đăng ký
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
