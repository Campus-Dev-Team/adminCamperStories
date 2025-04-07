import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  // Muestra un indicador de carga mientras se verifica la autenticación
  if (loading) {
    return <div>Cargando...</div>;
  }

  // IMPORTANTE: Usar isAuthenticated como booleano, NO como función
  // Cambio de isAuthenticated() a isAuthenticated
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;