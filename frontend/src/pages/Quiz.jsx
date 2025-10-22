import React, { useEffect, useState } from "react";
import API, { setAuthToken } from "../api";
import { useNavigate } from "react-router-dom";

export default function Quiz(){
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const nav = useNavigate();

  useEffect(()=> {
    const token = localStorage.getItem("token");
    if (token) setAuthToken(token);
    API.get("/questions?level=1").then(r=> setQuestions(r.data)).catch(()=>{});
  }, []);

  const choose = (qId, aId) => {
    setAnswers(prev => ({ ...prev, [qId]: aId }));
  };

  const submit = async () => {
    const token = localStorage.getItem("token");
    if (!token) return nav("/login");
    const payload = { answers: Object.entries(answers).map(([q,a])=>({ question_id: q, answer_id: a })) };
    const r = await API.post("/results/submit", payload);
    alert("Quiz submitted");
    nav("/results");
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Quiz</h2>
      {questions.map(q => (
        <div key={q.id} style={{ marginBottom: 12 }}>
          <div><strong>{q.id}. {q.text}</strong></div>
          <div>
            {q.answers.map(a => (
              <div key={a.id}>
                <label>
                  <input type="radio" name={String(q.id)} checked={answers[q.id] == a.id} onChange={()=>choose(q.id, a.id)} />
                  {a.text}
                </label>
              </div>
            ))}
          </div>
        </div>
      ))}
      <button onClick={submit}>Submit</button>
    </div>
  );
}
