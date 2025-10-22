import React, { useState } from "react";
import API from "../api";
import { useNavigate } from "react-router-dom";

export default function Register(){
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/auth/register", form);
      alert("Registered. Please login.");
      nav("/login");
    } catch (err) { alert("Register failed"); }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <input placeholder="Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /><br/>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /><br/>
        <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /><br/>
        <button type="submit">Register</button>
      </form>
    </div>
  );
}
