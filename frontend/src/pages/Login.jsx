import React, { useState } from "react";
import API, { setAuthToken } from "../api";
import { useNavigate } from "react-router-dom";

export default function Login(){
  const [form, setForm] = useState({ email: "", password: "" });
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post("/auth/login", form);
      const { token } = res.data;
      localStorage.setItem("token", token);
      setAuthToken(token);
      nav("/quiz");
    } catch (err) { alert("Login failed"); }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Login</h2>
      <form onSubmit={submit}>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /><br/>
        <input placeholder="Password" type="password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} /><br/>
        <button type="submit">Login</button>
      </form>
    </div>
  );
}
