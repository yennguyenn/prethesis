import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Quiz from "./pages/Quiz";
import Results from "./pages/Results";
import AdminDashboard from "./pages/Admin/AdminDashboard";

createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/quiz" element={<Quiz />} />
      <Route path="/results" element={<Results />} />
      <Route path="/admin/*" element={<AdminDashboard />} />
    </Routes>
  </BrowserRouter>
);
