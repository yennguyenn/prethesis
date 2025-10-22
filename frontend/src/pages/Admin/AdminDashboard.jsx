import React from "react";
import { Link, Routes, Route } from "react-router-dom";
import QuestionList from "./QuestionList";
import EditQuestion from "./EditQuestion";

export default function AdminDashboard(){
  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Dashboard</h2>
      <nav>
        <Link to="questions">Questions</Link>
      </nav>
      <Routes>
        <Route path="questions" element={<QuestionList />} />
        <Route path="questions/edit/:id" element={<EditQuestion />} />
      </Routes>
    </div>
  );
}
