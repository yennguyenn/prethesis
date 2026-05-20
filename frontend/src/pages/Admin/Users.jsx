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
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setBusy(true);
    try {
      const res = await API.post("/admin/users", {
        name: createForm.name,
        email: createForm.email,
        password: createForm.password,
      });
      setMessage(`Đã tạo quản trị viên: ${res.data?.email || createForm.email}`);
      setCreateForm({ name: "", email: "", password: "" });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Tạo quản trị viên thất bại");
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
      setError("Vui lòng nhập mã người dùng hợp lệ (dạng số)");
      return;
    }
    setBusy(true);
    try {
      const res = await API.post("/admin/users/role", { userId: id, role: "admin" });
      setMessage(`Đã nâng quyền người dùng #${res.data?.id || id} lên admin`);
      setPromoteForm({ userId: "" });
    } catch (err) {
      setError(err?.response?.data?.message || err.message || "Nâng quyền thất bại");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-100 shadow-xl p-6">
        <div className="mb-4">
          <h3 className="text-xl font-bold" style={{ color: "var(--brand-blue)" }}>Tạo tài khoản quản trị</h3>
          <p className="text-sm text-slate-600">Yêu cầu tài khoản hiện tại là admin.</p>
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
            placeholder="Họ và tên"
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
            placeholder="Mật khẩu"
            type="password"
            value={createForm.password}
            onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))}
          />
          <div className="md:col-span-3">
            <button
              type="submit"
              disabled={busy}
              className="px-5 py-2 rounded-xl text-white font-semibold shadow-md hover:shadow-lg disabled:opacity-50" style={{ background: "var(--brand-blue)" }}
            >
              {busy ? "Đang xử lý..." : "Tạo quản trị"}
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-100 shadow-xl p-6">
        <div className="mb-2">
          <h3 className="text-xl font-bold" style={{ color: "var(--brand-ocean)" }}>Nâng quyền người dùng hiện có</h3>
          <p className="text-sm text-slate-600">Nhập mã người dùng (userId) để đặt role = admin.</p>
        </div>
        <form onSubmit={promoteUser} className="flex items-center gap-3">
          <input
            className="border border-slate-300 rounded-lg px-3 py-2 w-40"
            placeholder="Mã người dùng"
            value={promoteForm.userId}
            onChange={(e) => setPromoteForm({ userId: e.target.value })}
          />
          <button
            type="submit"
            disabled={busy}
            className="px-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Nâng quyền
          </button>
        </form>
        <div className="mt-3 text-xs text-slate-600">
          Gợi ý: Bạn cần ID dạng số của người dùng. Nếu chưa có UI danh sách, có thể lấy trong DB hoặc bổ sung endpoint danh sách sau.
        </div>
      </div>
    </div>
  );
}
