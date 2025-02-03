import React from "react";
import { Routes, Route } from "react-router-dom";
import LoginPage from "@/views/Login";

const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />
      {/* Agrega más rutas aquí según sea necesario */}
    </Routes>
  );
};

export default AppRouter;
