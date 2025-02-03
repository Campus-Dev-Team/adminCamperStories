import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Label } from "../components/ui/label";
import campushm from '/src/assets/Campushm.png';
import { endpoints } from '../services/apiConfig';
import { CardHeader, CardTitle } from "@/components/ui/card";

const LoginPage = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (token) {
      const camperId = localStorage.getItem('camper_id');
      console.log("Usuario ya autenticado. Redirigiendo a /");
      navigate(`/campers/profile/${camperId}/edit`);
    }
  }, [token]);

  const handleLogin = async (email, password) => {
    try {
      console.log("Iniciando sesión con:", email);
      const response = await fetch(endpoints.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        toast.success("Inicio de sesión exitoso");

        localStorage.setItem('token', data.token);
        localStorage.setItem('role', data.user.role);
        localStorage.setItem('camper_id', data.user.camper_id);
        console.log("Inicio de sesión exitoso. Token recibido:", data);
        navigate(`/campers/profile/${data.user.camper_id}/edit`);
      } else {
        toast.error("Error de autenticación. Credenciales incorrectas.");
      }
    } catch (error) {
      toast.error("Error al intentar iniciar sesión. Por favor, inténtalo de nuevo.");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#1a1a2e] flex flex-col items-center justify-center p-4 md:p-6 lg:p-8">
      {/* Main Container */}
      <div className="w-full max-w-md lg:max-w-lg px-4 sm:px-6 md:px-8 lg:px-10">
        {/* Form Panel */}
        <div className="w-full bg-[#2a2a3e] p-6 md:p-8 border border-[#6b5ffd] rounded-2xl shadow-[0_0_30px_-6px_#6b5ffd] text-center relative overflow-hidden">
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
            <form
              onSubmit={(e) => {
                e.preventDefault();
                const email = e.target.email.value;
                const password = e.target.password.value;
                handleLogin(email, password);
              }}
              className="space-y-4"
            >
              {/* Email Input */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white text-left block text-sm sm:text-base">
                  Correo electrónico
                </Label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 
                               group-hover:text-[#6b5ffd] transition-colors duration-200"
                    size={18} />
                  <input
                    id="email"
                    type="email"
                    name="email"
                    className="w-full py-2.5 px-4 pl-9 bg-[#3a3a4e] rounded-lg text-white text-sm sm:text-base 
                           focus:outline-none focus:ring-2 focus:ring-[#7c3aed] hover:bg-[#434360]"
                    placeholder="Correo electrónico"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white text-left block text-sm sm:text-base">
                  Contraseña
                </Label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400
                               group-hover:text-[#6b5ffd] transition-colors duration-200"
                    size={18} />
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    name="password"
                    className="w-full py-2.5 px-4 pl-9 bg-[#3a3a4e] rounded-lg text-white text-sm sm:text-base 
                           focus:outline-none focus:ring-2 focus:ring-[#7c3aed] hover:bg-[#434360]"
                    placeholder="Contraseña"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-70 hover:text-opacity-100"
                  >
                    {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base bg-[#6C3AFF] text-white 
                       hover:bg-[#6d28d9] mt-6 transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg"
              >
                Iniciar Sesión
              </button>
            </form>

            {/* Register Link */}
            <div className="text-center mt-6">
              <button
                className="bg-transparent border-none text-[#7c3aed] cursor-pointer text-xs sm:text-sm 
                       hover:text-[#6d28d9] hover:underline transition-colors duration-200"
                onClick={() => navigate('/campers/register')}
              >
                ¿No tienes cuenta aún? Regístrate
              </button>
            </div>

            {/* Forget Password */}
            <div className="text-center mt-6">
              <button
                className="bg-transparent border-none text-white cursor-pointer text-xs sm:text-sm 
                       hover:text-[#6d28d9] hover:underline transition-colors duration-200"
                onClick={() => navigate('/campers/forgetPassword')}
              >
                ¿Olvidaste tu contraseña?
              </button>
            </div>

            {/* Política de Privacidad */}
            <div className="text-center mt-4">
              <p className="text-gray-400 text-[10px] sm:text-xs px-4">
                Al continuar o iniciar sesión, confirmas que has leído y aceptas nuestros{" "}
                <a 
                  onClick={() => navigate("/terms-Conditions")}
                  className="hover:underline text-white transition-colors duration-200"
                >
                  Términos y Condiciones
                </a> y nuestra{" "}
                <a 
                  onClick={() => navigate("/politica-de-privacidad")}
                  className="hover:underline text-white transition-colors duration-200"
                >
                  Políticas de Privacidad
                </a>.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Version */}
      <div className="absolute bottom-2 w-full text-center text-xs text-gray-400">
        Camper Stories v0.6.0
      </div>
    </div>
  );
};

export default LoginPage;
