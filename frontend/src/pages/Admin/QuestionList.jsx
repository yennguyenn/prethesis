import React, { useEffect, useState } from "react";
import API, { setAuthToken } from "../../api";

const MAJOR_CODES = [
  { code: "SE", name: "Software Engineering" },
  { code: "CS", name: "Computer Science" },
  { code: "UI", name: "UI/UX Design" },
  { code: "IS", name: "Information Systems" },
  { code: "DS", name: "Data Science & Analytics" },
  { code: "CY", name: "Cyber Security" },
  { code: "NET", name: "Network & System Administration" },
  { code: "IOT", name: "IoT & Embedded Systems" },
  { code: "CE", name: "Computer Engineering" },
  { code: "ROB", name: "Robotics & Automation" },
  { code: "AI", name: "Artificial Intelligence & ML" },
];

export default function QuestionList(){
  const [questions, setQuestions] = useState([]);
  const [qtext, setQtext] = useState("");
  const [level, setLevel] = useState(1);
  const [options, setOptions] = useState([
    { text: "", code: "SE", points: 1 },
    { text: "", code: "CS", points: 1 },
    { text: "", code: "DS", points: 1 },
    { text: "", code: "AI", points: 1 },
  ]);
  useEffect(()=> {
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
    API.get("/questions").then(r=>setQuestions(r.data));
  }, []);
  const create = async () => {
    const payload = {
      text: qtext,
      level: Number(level) || 1,
      options: options.map(o => ({ text: o.text, scoring: { [o.code]: Number(o.points) || 0 } })),
    };
    await API.post("/questions", payload);
    alert("Created");
    location.reload();
  }
  return (
    <div>
      <h3>Questions</h3>
      <div>
        <div style={{ marginBottom: 8 }}>
          <label htmlFor="levelSel">Level: </label>
          <select id="levelSel" value={level} onChange={e=>setLevel(e.target.value)}>
            <option value={1}>Level 1</option>
            <option value={2}>Level 2</option>
          </select>
        </div>
        <input placeholder="Question text" value={qtext} onChange={e=>setQtext(e.target.value)} /><br/>
        {options.map((o,idx)=> (
          <div key={`${idx}-${o.code}`} style={{ display: 'flex', gap: 8, marginTop: 6 }}>
            <input placeholder="Answer text" value={o.text} onChange={e=>{ const copy=[...options]; copy[idx].text=e.target.value; setOptions(copy);} } />
            <select value={o.code} onChange={e=>{ const copy=[...options]; copy[idx].code=e.target.value; setOptions(copy);} }>
              {MAJOR_CODES.map(m => <option key={m.code} value={m.code}>{m.code}</option>)}
            </select>
            <input placeholder="Points" type="number" value={o.points} onChange={e=>{ const copy=[...options]; copy[idx].points=Number(e.target.value); setOptions(copy);} } />
          </div>
        ))}
        <button onClick={create}>Create Question</button>
      </div>

      <ul>
        {questions.map(q => (
          <li key={q.id}>{q.id}. {q.text} - <a href={`/admin/questions/edit/${q.id}`}>Edit</a></li>
        ))}
      </ul>
    </div>
  );
}
