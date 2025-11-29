import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
// Initialize theme before render
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'dark') {
  document.documentElement.classList.add('dark');
} else if (savedTheme === 'light') {
  document.documentElement.classList.remove('dark');
}
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Quiz from "./pages/Quiz";
import Orientation from "./pages/Orientation";
import Results from "./pages/Results";
import Careers from "./pages/Careers";
import CareerDetail from "./pages/CareerDetail";
import Groups from "./pages/Groups";
import AdminDashboard from "./pages/Admin/AdminDashboard";
import Layout from "./components/Layout";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route element={<Layout />}>  
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/orientation" element={<Orientation />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/results" element={<Results />} />
        <Route path="/careers" element={<Careers />} />
        <Route path="/careers/:code" element={<CareerDetail />} />
        <Route path="/groups" element={<Groups />} />
      </Route>
      <Route path="/admin/*" element={<AdminDashboard />} />
    </Routes>
  </BrowserRouter>
);
