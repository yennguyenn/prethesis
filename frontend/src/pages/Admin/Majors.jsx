import React, { useEffect, useState } from "react";
import API, { setAuthToken } from "../../api";

const S = {
  card: { background: "#fff", borderRadius: 14, border: "1px solid #e2e8f0", padding: "20px 24px", boxShadow: "0 1px 6px rgba(0,0,0,0.06)" },
  label: { fontSize: 11, color: "#94a3b8", marginBottom: 4, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" },
  input: { width: "100%", border: "1px solid #e2e8f0", borderRadius: 8, padding: "9px 12px", fontSize: 14, color: "#1e293b", outline: "none", background: "#fff", boxSizing: "border-box" },
  btnPrimary: { padding: "9px 20px", borderRadius: 8, background: "#3b82f6", color: "#fff", fontWeight: 600, fontSize: 14, border: "none", cursor: "pointer" },
  btnEdit: { padding: "6px 14px", borderRadius: 7, background: "#3b82f6", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" },
  btnDanger: { padding: "6px 14px", borderRadius: 7, background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" },
  btnSecondary: { padding: "6px 14px", borderRadius: 7, background: "#fff", color: "#475569", fontSize: 13, fontWeight: 500, border: "1px solid #e2e8f0", cursor: "pointer" },
  btnSave: { padding: "6px 14px", borderRadius: 7, background: "#3b82f6", color: "#fff", fontSize: 13, fontWeight: 600, border: "none", cursor: "pointer" },
};

function MajorCard({ m, onUpdate, onRemove }) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(m.name);
  const [description, setDescription] = useState(m.description || "");

  const save = () => {
    onUpdate(m.id, { name, description });
    setEditing(false);
  };
  const cancel = () => {
    setName(m.name);
    setDescription(m.description || "");
    setEditing(false);
  };

  return (
    <div style={{ ...S.card, display: "flex", flexDirection: "column", gap: 10 }}>
      {editing ? (
        <>
          <div>
            <div style={S.label}>Tên ngành</div>
            <input style={S.input} value={name} onChange={e => setName(e.target.value)} autoFocus />
          </div>
          <div>
            <div style={S.label}>Mô tả</div>
            <textarea
              style={{ ...S.input, resize: "vertical", minHeight: 72 }}
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button style={S.btnSave} onClick={save}>Lưu</button>
            <button style={S.btnSecondary} onClick={cancel}>Hủy</button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 11, color: "#94a3b8", fontWeight: 600, marginBottom: 2 }}>Mã: {m.code}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#8b5cf6", lineHeight: 1.3 }}>{m.name}</div>
              {m.description && (
                <div style={{ fontSize: 13, color: "#64748b", marginTop: 6, lineHeight: 1.6 }}>{m.description}</div>
              )}
            </div>
            <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
              <button style={S.btnEdit} onClick={() => setEditing(true)}>Chỉnh sửa</button>
              <button style={S.btnDanger} onClick={() => onRemove(m.id, m.name)}>Xóa</button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function Majors() {
  const [items, setItems] = useState([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmId, setConfirmId] = useState(null);
  const [confirmName, setConfirmName] = useState("");

  const fetchMajors = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (token) setAuthToken(token);
      const r = await API.get("/admin/majors");
      setItems(r.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Không thể tải danh sách ngành");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMajors(); }, []);

  const create = async () => {
    if (!code.trim() || !name.trim()) return;
    try {
      await API.post("/admin/majors", { code, name, description });
      setCode(""); setName(""); setDescription("");
      fetchMajors();
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Tạo thất bại");
    }
  };

  const update = async (id, payload) => {
    try { await API.put(`/admin/majors/${id}`, payload); fetchMajors(); }
    catch (e) { setError(e?.response?.data?.message || e.message || "Cập nhật thất bại"); }
  };

  const confirmRemove = (id, name) => { setConfirmId(id); setConfirmName(name); };

  const remove = async () => {
    try { await API.delete(`/admin/majors/${confirmId}`); fetchMajors(); }
    catch (e) { setError(e?.response?.data?.message || e.message || "Xóa thất bại"); }
    finally { setConfirmId(null); setConfirmName(""); }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Create form */}
      <div style={S.card}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b", marginBottom: 16 }}>Thêm ngành mới</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 3fr", gap: 12, marginBottom: 14 }}>
          <div>
            <div style={S.label}>Mã ngành</div>
            <input style={S.input} placeholder="VD: CNTT" value={code} onChange={e => setCode(e.target.value)} />
          </div>
          <div>
            <div style={S.label}>Tên ngành</div>
            <input style={S.input} placeholder="Tên ngành đào tạo" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <div style={S.label}>Mô tả</div>
            <input style={S.input} placeholder="Mô tả ngắn (tuỳ chọn)" value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
        <button style={S.btnPrimary} onClick={create}>+ Thêm ngành</button>
      </div>

      {/* Error */}
      {error && (
        <div style={{ padding: "10px 16px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 10, fontSize: 13, color: "#b91c1c" }}>
          {error}
        </div>
      )}

      {/* Delete confirm */}
      {confirmId && (
        <div style={{ padding: "14px 20px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
          <span style={{ fontSize: 14, color: "#92400e" }}>Xóa ngành <strong>{confirmName}</strong>? Hành động này không thể hoàn tác.</span>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button style={S.btnDanger} onClick={remove}>Xác nhận xóa</button>
            <button style={S.btnSecondary} onClick={() => setConfirmId(null)}>Hủy</button>
          </div>
        </div>
      )}

      {/* List */}
      <div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>Danh sách ngành</div>
          {loading && <span style={{ fontSize: 12, color: "#94a3b8" }}>Đang tải...</span>}
          {!loading && <span style={{ fontSize: 12, color: "#94a3b8" }}>{items.length} ngành</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: 12 }}>
          {items.map(m => (
            <MajorCard key={m.id} m={m} onUpdate={update} onRemove={confirmRemove} />
          ))}
          {!loading && items.length === 0 && (
            <div style={{ color: "#94a3b8", fontSize: 14, padding: 20 }}>Chưa có ngành nào.</div>
          )}
        </div>
      </div>
    </div>
  );
}

