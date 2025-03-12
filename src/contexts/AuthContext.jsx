import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar si existe una sesión al iniciar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (token && storedUser) {
          const userData = JSON.parse(storedUser);
          setCurrentUser(userData);
          console.log('Usuario recuperado del localStorage:', userData);
        } else {
          console.log('No hay sesión guardada en localStorage');
        }
      } catch (error) {
        console.error("Error verificando autenticación:", error);
        // Limpiar localStorage si hay un error al parsear
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (token, userData) => {
    try {
      console.log('Iniciando sesión con:', { token: token ? 'token-presente' : 'no-token', userData });
      
      // Guardar token y datos del usuario en localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setCurrentUser(userData);
      
      console.log('Sesión iniciada correctamente:', userData);
      return true;
    } catch (error) {
      console.error("Error en login:", error);
      return false;
    }
  };

  const logout = () => {
    console.log('Cerrando sesión');
    // Eliminar token y datos de usuario
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    console.log('Sesión cerrada');
  };

  const updateUserData = (newData) => {
    try {
      const updatedUser = { ...currentUser, ...newData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setCurrentUser(updatedUser);
      console.log('Datos de usuario actualizados:', updatedUser);
      return true;
    } catch (error) {
      console.error("Error actualizando datos de usuario:", error);
      return false;
    }
  };

  // Agregar una propiedad para verificar si el usuario está autenticado
  const isAuthenticated = !!currentUser;
  
  console.log('Estado de autenticación actualizado:', { 
    isAuthenticated, 
    currentUser: currentUser ? `Usuario ID: ${currentUser.id}, Rol: ${currentUser.role_id}` : 'Sin usuario'
  });

  return (
    <AuthContext.Provider value={{ 
      currentUser, 
      login, 
      logout, 
      loading,
      updateUserData,
      isAuthenticated // Exportar la propiedad isAuthenticated
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);