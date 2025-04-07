import React, { createContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { api, mainEndpoints } from "@/services/axiosConfig";
import AuthService from "../services/AuthService";
import { toast } from "react-toastify";

const AuthContext = createContext();

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  let [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const validateSession = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AuthService.getToken();

      if (token) {
        const role = token.user.role_id;

        if (isNaN(role) || ![1, 5].includes(role)) {
          throw new Error("Rol de usuario no válido");
        }
        setCurrentUser({
          id: token.user.camper_id || token.user.sponsor_id || token.user.id,
          role: role,
          cityId: token.user.city_id
        });
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Error validating session:", error);
      toast.error(
        error.response?.data?.message || "Error al validar la sesión."
      );
      setError(error);
      setCurrentUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshAuthState = useCallback(async () => {
    return validateSession();
  }, [validateSession]);

  useEffect(() => {
    validateSession();
  }, [validateSession]);

  const logout = async () => {
    try {
      await api.post(`${mainEndpoints.users}/logout`);
      toast.success("¡Hasta pronto! Has cerrado sesión exitosamente.");
      setCurrentUser(null);
      setError(null);
      setLoading(false);
      navigate("/login");
    } catch (error) {
      toast.error("Error. Por favor, inténtalo de nuevo.");
      setError(null);
      console.error("Error durante el logout:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const hasPermission = (permission) => {
    if (!currentUser) return false;
    if (currentUser.role === 1 || currentUser.role === 4) return true;
    return currentUser.permissions?.includes(permission);
  };

  const isResourceOwner = (resourceId, resourceType) => {
    if (!currentUser) return false;
    if (currentUser.role === 4) return true;

    switch (resourceType) {
      case "camper":
        return currentUser.camper_id === resourceId.toString();
      case "sponsor":
        return currentUser.sponsor_id === resourceId.toString();
      case "user":
        return currentUser.id === parseInt(resourceId);
      default:
        return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        logout,
        hasPermission,
        isResourceOwner,
        refreshAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext };
