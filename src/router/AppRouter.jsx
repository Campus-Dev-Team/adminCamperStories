import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "@/views/Login";
import Dashboard from "@/views/Dashboard";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      <Route path="/dashboard" element={<Dashboard/>} />
    </Routes>
  );
};

export default AppRouter;
