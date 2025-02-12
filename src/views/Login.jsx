import React, { useEffect, useState } from 'react';
import { useNavigate } from "react-router-dom";
import { toast } from 'react-toastify';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Label } from "../components/ui/label";
import campushm from '/src/assets/Campushm.png';
import { endpoints } from '../services/apiConfig';
import { CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (token) {
      const camperId = localStorage.getItem('camper_id');
      console.log("Usuario ya autenticado. Redirigiendo a /");
      navigate(`/dashboard`);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(endpoints.login, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        await login(data.token, {
          // Asegúrate de incluir los datos del usuario que necesites
          email: formData.email,
          // otros datos del usuario que vengan en la respuesta
        });
        toast.success("Inicio de sesión exitoso");
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Error al iniciar sesión");
      }
    } catch (error) {
      toast.error("Error al conectar con el servidor");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
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
              onSubmit={handleSubmit}
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
                    value={formData.email}
                    onChange={handleChange}
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
                    value={formData.password}
                    onChange={handleChange}
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
