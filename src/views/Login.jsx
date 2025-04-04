import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { toast, ToastContainer } from 'react-toastify'; // Importa ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Importa los estilos CSS
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { Label } from "@/components/ui/label";
import { CardHeader, CardTitle } from "@/components/ui/card";
import campushm from '/src/assets/Campushm.png';
import { useAuth } from '../contexts/AuthContext';
import { endpoints } from '../services/apiConfig';

// Función para generar estrellas
const generateStars = (count) => {
  return Array.from({ length: count }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    duration: Math.random() * 5 + 5,
    size: Math.random() * 2 + 1,
  }));
};

const stars = generateStars(50);

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, currentUser, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Verificar que realmente tenemos una sesión válida antes de redirigir
    const token = localStorage.getItem('token');
    if (currentUser?.id && !loading && token) {
      // Redirigir según el rol del usuario
      if (currentUser.role === "admin") {
        navigate("/admin-dashboard", { replace: true });
      } else if (currentUser.role === "regionalAdmin") {
        navigate("/regional-dashboard", { replace: true });
      } else {
        navigate("/access-denied", { replace: true }); // Redirigir a una página de acceso denegado si el rol no es admin ni regionalAdmin
      }
    }
  }, [currentUser, loading, navigate, location]);

  const validateForm = () => {
    const errors = {};
    if (!formData.email) {
      errors.email = "El correo electrónico es requerido";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = "Formato de correo electrónico inválido";
    }

    if (!formData.password) {
      errors.password = "La contraseña es requerida";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Limpiar errores al editar
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const loginUrl = endpoints.login;
      console.log("Iniciando sesión en:", loginUrl);

      const response = await fetch(loginUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.success) {
          // Guardamos la información del usuario y el token en el contexto
          await login(data.token, {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,  // 'admin' o 'regionalAdmin'
            role_id: determineRoleId(data.user.role),
            first_name: data.user.first_name,
            last_name: data.user.last_name,
            city_id: data.user.city_id,
            document_type: data.user.document_type,
            document_number: data.user.document_number,
          });

          // Notificación de éxito
          toast.success(data.message || `¡Inicio de sesión exitoso como ${data.user.role}!`);

          // Redirigir dependiendo del rol
          if (data.user.role === "admin") {
            navigate("/admin-dashboard");
          } else if (data.user.role === "regionalAdmin") {
            navigate("/regional-dashboard");
          }
        }
      } else {
        toast.error(data.message || "Error al iniciar sesión");
      }
    } catch (error) {
      // Manejo de errores
      localStorage.clear();
      toast.error("Error al intentar iniciar sesión. Por favor, inténtalo de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // AÑADIR FUNCIÓN - Para determinar el role_id basado en el rol de texto
  const determineRoleId = (role) => {
    const roleMap = {
      'camper': 0,
      'admin': 1,
      'regionalAdmin': 5,  // Asegúrate de mapear correctamente al role_id para regionalAdmin
      'sponsor': 2,
      'empresa': 3,
      'empleabilidad': 4
    };
    return roleMap[role] || 0; // Por defecto, devuelve 0 (camper)
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1a1b2b] to-[#1e203a] flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 relative overflow-hidden">
      {/* Toast Container - Agregado aquí */}
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      /> 

      {/* Stars Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map((star) => (
          <motion.div
            key={star.id}
            className="absolute bg-white rounded-full opacity-75"
            style={{
              width: `${star.size}px`,
              height: `${star.size}px`,
              left: `${star.x}%`,
              top: `-${star.size}px`,
            }}
            animate={{
              y: ['-10vh', '110vh'],
              opacity: [0, 1, 0.5, 1, 0],
            }}
            transition={{
              duration: star.duration,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 3,
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <div className="w-full max-w-md lg:max-w-lg px-4 sm:px-6 md:px-8 lg:px-10 relative z-10">
        {/* Form Panel */}
        <div className="w-full bg-[#2a2b3d] p-6 md:p-8 border border-[#594ed3] rounded-2xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6b5ffd20] to-[#6b5ffd10] opacity-50"></div>

          <div className="relative z-10">
            {/* Logo Section */}
            <CardHeader className="space-y-4 md:space-y-6 text-center">
              <div className="flex justify-center">
                <div className="w-24 sm:w-32 md:w-40 transition-transform duration-300 hover:scale-105">
                  <img src={campushm} alt="Campus" className="w-full h-auto mx-auto" />
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Camper Stories
              </CardTitle>
            </CardHeader>

            <h2 className="text-white text-lg sm:text-xl mb-6 md:mb-7 text-center font-regular">
              ¡Bienvenido de nuevo, Camper!
            </h2>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              {/* Email Input */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="email" className="text-white text-left block text-sm sm:text-base">
                  Correo electrónico
                </Label>
                <div className="relative group">
                  <Mail 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                               group-hover:text-[#6b5ffd] transition-colors duration-200"
                    size={18} 
                  />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full py-2.5 px-4 pl-9 bg-[#3a3a4e] rounded-lg text-white text-sm sm:text-base 
                           focus:outline-none focus:ring-2 focus:ring-[#7c3aed] hover:bg-[#434360]
                           ${formErrors.email ? 'border border-red-500' : ''}`}
                    placeholder="Correo electrónico"
                    disabled={isSubmitting}
                  />
                </div>
                {formErrors.email && (
                  <p className="text-red-500 text-xs mt-1 text-left">{formErrors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2 mb-4">
                <Label htmlFor="password" className="text-white text-left block text-sm sm:text-base">
                  Contraseña
                </Label>
                <div className="relative group">
                  <Lock 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400
                               group-hover:text-[#6b5ffd] transition-colors duration-200"
                    size={18} 
                  />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full py-2.5 px-4 pl-9 bg-[#3a3a4e] rounded-lg text-white text-sm sm:text-base 
                           focus:outline-none focus:ring-2 focus:ring-[#7c3aed] hover:bg-[#434360]
                           ${formErrors.password ? 'border border-red-500' : ''}`}
                    placeholder="Contraseña"
                    disabled={isSubmitting}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-70 hover:text-opacity-100"
                    disabled={isSubmitting}
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
                {formErrors.password && (
                  <p className="text-red-500 text-xs mt-1 text-left">{formErrors.password}</p>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base bg-[#6C3AFF] text-white 
                       hover:bg-[#6d28d9] transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg
                       ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </form>

            {/* Register Link */}
            <div className="text-center my-[1.2rem]">
              <button
                className="bg-transparent border-none text-[#7c3aed] cursor-pointer text-xs sm:text-sm 
                       hover:text-[#6d28d9] hover:underline transition-colors duration-200"
                onClick={() => navigate('/register/camper')}
                disabled={isSubmitting}
              >
                ¿No tienes cuenta aún? Regístrate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Version */}
      <div className="absolute bottom-2 w-full text-center text-xs text-gray-400">
        Camper Stories v0.6.5 Beta
      </div>
    </div>
  );
};

export default LoginPage;