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
      const { token } = res.data;
      if (token) {
        localStorage.setItem("token", token);
        setAuthToken(token);
        nav("/quiz");
      } else {
        setError("No token returned");
      }
    } catch (err) {
      setError(err?.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative isolate">
      {/* Solid backdrop to ensure previous page content is not visible */}
      <div className="absolute inset-0 bg-slate-900/90" aria-hidden="true" />
      <div className="relative z-10 w-full max-w-md mx-auto">
        <div className="relative backdrop-blur-md bg-white/10 border border-white/20 rounded-xl shadow-xl p-8 text-white">
          <button
            type="button"
            onClick={() => nav("/")}
            aria-label="Close login"
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-white/15 hover:bg-white/25 text-white text-xl leading-none transition-colors"
          >
            &times;
          </button>
          <h2 className="text-2xl font-semibold mb-6 text-center">Login</h2>
          {error && (
            <div className="mb-4 text-sm bg-red-500/20 border border-red-500/40 text-red-200 rounded px-3 py-2">
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
                className="w-full px-3 py-2 rounded-lg bg-white/15 border border-white/30 focus:outline-none focus:ring-2 focus:ring-cyan-400 placeholder:text-slate-300 text-white"
                placeholder="you@example.com"
              />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
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
              className="w-full py-2.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
            >
              {loading ? "Loading..." : "Login"}
            </button>
          </form>
          <div className="text-center mt-5 text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-cyan-300 hover:text-cyan-200 underline underline-offset-4">
              Register
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
