import React, { useEffect, useState } from "react";
import API, { setAuthToken } from "../api";

export default function Results(){
  const [results, setResults] = useState([]);
  useEffect(()=>{
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
    API.get("/results/me").then(r => setResults(r.data)).catch(()=>{});
  }, []);
  return (
    <div style={{ padding: 20 }}>
      <h2>My Results</h2>
      {results.map(r => (
        <div key={r.id} style={{ border: "1px solid #ccc", marginBottom: 8, padding: 8 }}>
          <div>Date: {new Date(r.created_at).toLocaleString()}</div>
          <div>Score: {r.score}</div>
          <div>Suggested Major: {r.major_name || "N/A"}</div>
          <details><summary>Details</summary><pre>{JSON.stringify(r.details, null, 2)}</pre></details>
        </div>
      ))}
    </div>
  );
}
