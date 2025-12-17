import React, { useEffect, useState } from "react";
import API, { setAuthToken } from "../../api";

export default function Majors() {
  const [items, setItems] = useState([]);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchMajors = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      if (token) setAuthToken(token);
      const r = await API.get("/admin/majors");
      setItems(r.data || []);
    } catch (e) {
      setError(e?.response?.data?.message || e.message || "Failed to load majors");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMajors(); }, []);

  const create = async () => {
    try {
      await API.post("/admin/majors", { code, name, description });
      setCode(""); setName(""); setDescription("");
      fetchMajors();
    } catch (e) {
      alert(e?.response?.data?.message || e.message || "Create failed");
    }
  };

  const update = async (id, payload) => {
    try { await API.put(`/admin/majors/${id}`, payload); fetchMajors(); }
    catch (e) { alert(e?.response?.data?.message || e.message || "Update failed"); }
  };

  const remove = async (id) => {
    if (!confirm(`Delete major #${id}?`)) return;
    try { await API.delete(`/admin/majors/${id}`); fetchMajors(); }
    catch (e) { alert(e?.response?.data?.message || e.message || "Delete failed"); }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-100 shadow-xl p-6">
        <h3 className="text-xl font-bold text-primary-900 mb-4">Create Major</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input className="border border-slate-300 rounded-lg px-3 py-2" placeholder="Code (e.g., IT)" value={code} onChange={e=>setCode(e.target.value)} />
          <input className="border border-slate-300 rounded-lg px-3 py-2" placeholder="Name" value={name} onChange={e=>setName(e.target.value)} />
          <input className="border border-slate-300 rounded-lg px-3 py-2" placeholder="Description" value={description} onChange={e=>setDescription(e.target.value)} />
        </div>
        <div className="mt-4">
          <button className="px-5 py-2 rounded-xl bg-gradient-to-r from-primary-700 to-primary-500 text-white font-semibold shadow-md hover:shadow-lg" onClick={create}>Create</button>
        </div>
      </div>

      <div className="rounded-3xl bg-white/90 backdrop-blur-sm border border-slate-100 shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-primary-900">Majors</h3>
          {loading && <div className="text-xs text-slate-600">Loading...</div>}
        </div>
        {error && <div className="mb-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">{error}</div>}
        <div className="grid md:grid-cols-2 gap-4">
          {items.map(m => (
            <div key={m.id} className="border border-slate-200 rounded-2xl p-4 bg-white">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs text-slate-500">Code: {m.code}</div>
                  <div className="text-base font-semibold text-primary-900">{m.name}</div>
                  {m.description && <div className="text-xs text-slate-600 mt-1">{m.description}</div>}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button className="px-3 py-1 rounded-lg bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs" onClick={()=>{
                    const newName = prompt('New name', m.name);
                    if (newName) update(m.id, { name: newName });
                  }}>Rename</button>
                  <button className="px-3 py-1 rounded-lg bg-red-100 text-red-700 border border-red-300 hover:bg-red-200 text-xs" onClick={()=>remove(m.id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
