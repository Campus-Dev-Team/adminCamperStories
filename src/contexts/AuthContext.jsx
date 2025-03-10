import React, { createContext, useState, useContext, useEffect } from 'react';
import { toast } from 'react-toastify';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay un token almacenado al cargar la aplicación
    const checkAuthStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Validar que el usuario almacenado tiene el rol de administrador
          if (userData.role === "admin") {
            setCurrentUser(userData);
          } else {
            // Si no es administrador, limpiar el almacenamiento
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.error("Error al verificar el estado de autenticación:", error);
        // Si hay algún error, limpiamos el almacenamiento local
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  // Función de inicio de sesión
  const login = async (token, userData) => {
    try {
      // Guardar el token en localStorage
      localStorage.setItem('token', token);
      
      // Guardar datos del usuario
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Actualizar el estado de usuario en el contexto
      setCurrentUser(userData);
      
      return true;
    } catch (error) {
      console.error("Error durante el inicio de sesión:", error);
      toast.error("Error al procesar el inicio de sesión");
      throw error;
    }
  };

  // Función de cierre de sesión
  const logout = () => {
    // Limpiar localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Restablecer el estado del usuario
    setCurrentUser(null);
    
    toast.info("Has cerrado sesión correctamente");
  };

  const isAuthenticated = () => {
    return currentUser !== null;
  };

  // Valores y funciones que se proporcionarán a través del contexto
  const value = {
    currentUser,
    loading,
    login,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export default AuthContext;