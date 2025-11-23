import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import Careers from "./pages/Careers";
import Groups from "./pages/Groups";
import AdminDashboard from "./pages/Admin/AdminDashboard";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/results" element={<Results />} />
      <Route path="/careers" element={<Careers />} />
      <Route path="/groups" element={<Groups />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
    </Routes>
  </BrowserRouter>
);
