import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import LoginPage from '../views/Login';
import Dashboard from '../views/Dashboard';
import { useAuth } from '../contexts/AuthContext';
import DynamicTitle from './dynamicTitle';

const AppRouter = () => {
  const { currentUser } = useAuth();

  return (
    <>
      <DynamicTitle />
      <Routes>
        {/* Redirige la ruta raíz '/' al dashboard si está autenticado, o al login si no lo está */}
        <Route
          path="/"
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Ruta de login - redirige al dashboard si ya está autenticado */}
        <Route
          path="/login"
          element={
            currentUser ? <Navigate to="/dashboard" replace /> : <LoginPage />
          }
        />

        {/* Rutas protegidas */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Ruta para manejar URLs no encontradas */}
        <Route
          path="*"
          element={
            currentUser ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </>
  );
};

export default AppRouter;