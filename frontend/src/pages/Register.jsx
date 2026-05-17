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
    <div className="min-h-screen w-full flex items-center justify-center" style={{ background: "var(--surface-muted)" }}>
      <div className="w-full max-w-md mx-auto px-4">
        <div className="relative bg-white border border-slate-200 rounded-2xl shadow-lg p-8">
          <button
            type="button"
            onClick={() => nav("/")}
            aria-label="Đóng đăng ký"
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xl leading-none transition-colors"
          >
            &times;
          </button>
          <h2 className="text-2xl font-semibold mb-6 text-center" style={{ color: "var(--brand-blue)" }}>Đăng ký</h2>
          {error && (
            <div className="mb-4 text-sm bg-red-50 border border-red-200 text-red-700 rounded px-3 py-2">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 text-sm border rounded px-3 py-2" style={{ background: "var(--brand-blue-50)", borderColor: "var(--brand-blue-100)", color: "var(--brand-blue-700)" }}>
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
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 placeholder:text-slate-400 text-slate-700"
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
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 placeholder:text-slate-400 text-slate-700"
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
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 placeholder:text-slate-400 text-slate-700"
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
                className="w-full px-3 py-2 rounded-lg bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-400 placeholder:text-slate-400 text-slate-700"
                placeholder="Nhập lại mật khẩu"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors text-white"
              style={{ background: "var(--brand-blue)" }}
            >
              {loading ? "Đang tạo tài khoản..." : "Tạo tài khoản"}
            </button>
          </form>
          <div className="text-center mt-5 text-sm">
            Đã có tài khoản?{' '}
            <Link to="/login" className="underline underline-offset-4" style={{ color: "var(--brand-purple)" }}>
              Đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
