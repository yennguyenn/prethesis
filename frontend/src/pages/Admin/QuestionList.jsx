import React, { useEffect, useState } from "react";
import API from "../../api";

export default function QuestionList(){
  const [questions, setQuestions] = useState([]);
  const [qtext, setQtext] = useState("");
  const [answers, setAnswers] = useState([{text:"",major_id:"",points:0},{text:"",major_id:"",points:0},{text:"",major_id:"",points:0},{text:"",major_id:"",points:0}]);
  useEffect(()=> {
    API.get("/questions").then(r=>setQuestions(r.data));
  }, []);
  const create = async () => {
    await API.post("/questions", { text: qtext, level: 1, answers });
    alert("Created");
    location.reload();
  }
  return (
    <div>
      <h3>Questions</h3>
      <div>
        <input placeholder="Question text" value={qtext} onChange={e=>setQtext(e.target.value)} /><br/>
        {answers.map((a,i)=> (
          <div key={i}>
            <input placeholder="Answer text" value={a.text} onChange={e=>{ const copy=[...answers]; copy[i].text=e.target.value; setAnswers(copy);} } />
            <input placeholder="Major ID" value={a.major_id} onChange={e=>{ const copy=[...answers]; copy[i].major_id=e.target.value; setAnswers(copy);} } />
            <input placeholder="Points" type="number" value={a.points} onChange={e=>{ const copy=[...answers]; copy[i].points=Number(e.target.value); setAnswers(copy);} } />
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
