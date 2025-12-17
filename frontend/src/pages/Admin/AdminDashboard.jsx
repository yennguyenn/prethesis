import React from "react";
import { NavLink, Routes, Route, useNavigate } from "react-router-dom";
import QuestionList from "./QuestionList";
import EditQuestion from "./EditQuestion";
import Majors from "./Majors";
import ResultsAdmin from "./ResultsAdmin";
import UsersAdmin from "./Users";

export default function AdminDashboard(){
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-tr from-slate-50 via-primary-100 to-primary-300 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white/90 backdrop-blur-sm border border-slate-100 rounded-3xl shadow-xl p-6 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl md:text-3xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500">Admin Dashboard</h2>
            <p className="mt-1 text-sm text-slate-600">Manage question content, Major/SubMajor and view user results.</p>
          </div>
          <div />
        </div>
        <nav className="flex flex-wrap gap-3 mb-6">
          <NavLink to="/admin/questions" className={({isActive})=>`px-4 py-2 rounded-lg ${isActive?'bg-primary-700 text-white':'bg-primary-100 text-primary-900 hover:bg-primary-300/40'} transition`}>Questions</NavLink>
          <NavLink to="/admin/majors" className={({isActive})=>`px-4 py-2 rounded-lg ${isActive?'bg-primary-700 text-white':'bg-primary-100 text-primary-900 hover:bg-primary-300/40'} transition`}>Majors</NavLink>
          <NavLink to="/admin/results" className={({isActive})=>`px-4 py-2 rounded-lg ${isActive?'bg-primary-700 text-white':'bg-primary-100 text-primary-900 hover:bg-primary-300/40'} transition`}>User Results</NavLink>
          <NavLink to="/admin/users" className={({isActive})=>`px-4 py-2 rounded-lg ${isActive?'bg-primary-700 text-white':'bg-primary-100 text-primary-900 hover:bg-primary-300/40'} transition`}>Users</NavLink>
        </nav>
        <Routes>
        <Route index element={<QuestionList />} />
        <Route path="questions" element={<QuestionList />} />
        <Route path="questions/edit/:id" element={<EditQuestion />} />
        <Route path="majors" element={<Majors />} />
        <Route path="results" element={<ResultsAdmin />} />
        <Route path="users" element={<UsersAdmin />} />
        </Routes>
      </div>
    </div>
  );
}
