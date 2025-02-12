import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const login = async (token, userData) => {
    // Guardar token con tiempo de expiración (ejemplo: 24 horas)
    const expiresAt = new Date().getTime() + 24 * 60 * 60 * 1000;
    const authData = {
      token,
      expiresAt,
      user: userData
    };
    
    localStorage.setItem('authData', JSON.stringify(authData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('authData');
    setUser(null);
    navigate('/login');
  };

  const isAuthenticated = () => {
    const authData = JSON.parse(localStorage.getItem('authData'));
    if (!authData) return false;
    
    if (new Date().getTime() > authData.expiresAt) {
      logout();
      return false;
    }
    
    return true;
  };

  useEffect(() => {
    // Verificar autenticación al cargar
    const authData = JSON.parse(localStorage.getItem('authData'));
    if (authData && new Date().getTime() <= authData.expiresAt) {
      setUser(authData.user);
    } else {
      logout();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext); 