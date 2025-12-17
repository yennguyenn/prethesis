import React, { useState, useEffect } from "react";
import API, { setAuthToken } from "../../api";

export default function UsersAdmin() {
  const [createForm, setCreateForm] = useState({ name: "", email: "", password: "" });
  const [promoteForm, setPromoteForm] = useState({ userId: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
  }, []);

  const createAdmin = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (!createForm.name || !createForm.email || !createForm.password) {
      setError("Please fill all fields");
      return;
    }
    setBusy(true);
    try {
      const res = await API.post("/admin/users", {
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
      });
      setMessage(`Admin created: ${res.data?.email || createForm.email}`);
      setCreateForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Create admin failed");
    } finally {
      setBusy(false);
    }
  };

  const promoteUser = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    const id = Number(promoteForm.userId);
    if (!id) {
      setError("Please enter a valid numeric userId");
      return;
    }
    setBusy(true);
    try {
      const res = await API.post("/admin/users/role", { userId: id, role: "admin" });
      setMessage(`User #${res.data?.id || id} promoted to admin`);
      setPromoteForm({ userId: "" });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Promote failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-100 shadow-xl p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold text-primary-900">Create Admin Account</h3>
          <p className="text-sm text-slate-600">Requires current user to be an admin.</p>
        </div>
        {message && (
          <div className="mb-3 text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl p-3">{message}</div>
        )}
        {error && (
          <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>
        )}
        <form onSubmit={createAdmin} className="grid md:grid-cols-3 gap-3">
          <input
            className="border border-slate-300 rounded-lg px-3 py-2"
            placeholder="Name"
            value={createForm.name}
            onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
          />
          <input
            className="border border-slate-300 rounded-lg px-3 py-2"
            placeholder="Email"
            type="email"
            value={createForm.email}
            onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))}
          />
          <input
            className="border border-slate-300 rounded-lg px-3 py-2"
            placeholder="Password"
            type="password"
            value={createForm.password}
            onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
          />
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-700 to-primary-500 text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-50"
            >
              {busy ? "Working..." : "Create Admin"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-100 shadow-xl p-6">
        <div className="mb-2">
          <h3 className="text-xl font-bold text-primary-900">Promote Existing User</h3>
          <p className="text-sm text-slate-600">Enter userId to set role = admin.</p>
        </div>
        <form onSubmit={promoteUser} className="flex items-center gap-3">
          <input
            className="border border-slate-300 rounded-lg px-3 py-2 w-40"
            placeholder="userId"
            value={promoteForm.userId}
            onChange={(e) => setPromoteForm({ userId: e.target.value })}
          />
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Promote
          </button>
        </form>
        <div className="mt-3 text-xs text-slate-600">
          Tip: You need the numeric ID of the user. If you don’t have a list UI yet, you can get it from your DB or add a dedicated list endpoint later.
        </div>
      </div>
    </div>
  );
}
