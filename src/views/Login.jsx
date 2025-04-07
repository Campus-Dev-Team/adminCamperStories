import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import Dandruffer from "../components/ui/DandruffGenerator";
import InputLabeled from "../components/ui/formInputLabeled";
import campushm from "../assets/Campushm.png";
import { CardHeader, CardTitle } from "../components/ui/card";
import { api, mainEndpoints } from "../services/axiosConfig";
import AuthService from "../services/AuthService";
import { useAuth } from "../contexts/AuthContext";

const LoginForm = () => {
  const navigate = useNavigate();
  const { refreshAuthState } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    text: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const autoRedirect = await AuthService.checkAuth();
      if (autoRedirect) navigate(autoRedirect);
    };

    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { data } = await api.post(`${mainEndpoints.users}/login`, {
        email: formData.email,
        password: formData.password,
      });

      if (data.user.role_id === 1 || data.user.role_id === 5) {
        await refreshAuthState();
        toast.success("Inicio de sesión exitoso");
        navigate("/dashboard");
        setIsSubmitting(false);
        return;
      }

      await api.post(`${mainEndpoints.users}/logout`);
      toast.error(
        "No eres un administrador, seras redirigido a Camper Stories"
      );
      setTimeout(() => {
        location.href = `${import.meta.env.VITE_FRONTEND_URL}/login`;
      }, 3500);      
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Error al intentar iniciar sesión. Por favor, inténtalo de nuevo."
      );
      setIsSubmitting(false);
    } 
  };

  const outerContainerClassName = "space-y-2 mb-4";
  const innerContainerClassName = "relative group";
  const labelsClassName = "text-white text-left block text-sm sm:text-base";
  const inputsAttributes = [
    {
      outerContainerClassName,
      labelAttributes: {
        className: labelsClassName,
        text: "Correo electrónico",
      },
      innerContainerClassName,
      iconAttributes: {
        iconName: "Mail",
      },
      inputAttributes: {
        id: "email",
        type: "email",
        value: formData.email,
        onChange: handleChange,
        className: formErrors.email && "border border-red-500",
        placeholder: "johnDoe@example.com",
        disabled: isSubmitting,
        required: true,
      },
      trackedErrors: formErrors.email,
    },
    {
      outerContainerClassName,
      labelAttributes: {
        className: labelsClassName,
        text: "Contraseña",
      },
      innerContainerClassName,
      iconAttributes: {
        iconName: "Lock",
      },
      inputAttributes: {
        id: "password",
        type: showPassword ? "text" : "password",
        value: formData.password,
        onChange: handleChange,
        className: formErrors.password && "border border-red-500",
        placeholder: showPassword ? "SuperPass_123" : "••••••••",
        disabled: isSubmitting,
        required: true,
      },
      trackedErrors: formErrors.password,
      additionalElement: (
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white text-opacity-70 hover:text-opacity-100"
          disabled={isSubmitting}
        >
          {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
        </button>
      ),
    },
  ];

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#1a1b2b] to-[#1e203a] flex flex-col items-center justify-center p-4 md:p-6 lg:p-8 relative overflow-hidden">

      {/* Stars Animation */}
      <Dandruffer dandruffAmount={200} />

      {/* Main Container */}
      <div className="w-full max-w-md lg:max-w-lg px-4 sm:px-6 md:px-8 lg:px-10 relative z-10">
        {/* Form Panel */}
        <div className="w-full bg-[#2a2b3d] p-6 md:p-8 border border-[#594ed3] rounded-2xl text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6b5ffd20] to-[#6b5ffd10] opacity-50"></div>

          <div className="relative z-10">
            {/* Logo Section */}
            <CardHeader
              className="space-y-4 md:space-y-6 text-center"
            >
              <div className="flex justify-center">
                <div className="w-24 sm:w-32 md:w-40 transition-transform duration-300 hover:scale-105">
                  <img
                    src={campushm}
                    alt="Campus"
                    className="w-full h-auto mx-auto"
                  />
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                Camper Stories
              </CardTitle>
            </CardHeader>

            <h2 className="text-white text-lg sm:text-xl mb-6 md:mb-7 text-center font-regular">
              ¡Bienvenid@ de nuevo, Admin!
            </h2>

            {/* Login Form */}
            <form onSubmit={handleSubmit}>
              {inputsAttributes.map((attributes) => (
                <InputLabeled
                  key={
                    attributes.inputAttributes.id ||
                    attributes.inputAttributes.type
                  }
                  attributes={attributes}
                />
              ))}


              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-2.5 sm:py-3 px-4 rounded-lg text-sm sm:text-base bg-[#6C3AFF] text-white 
                       hover:bg-[#6d28d9] transform hover:scale-[1.02] active:scale-[0.98] hover:shadow-lg
                       ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Iniciando sesión...
                  </span>
                ) : (
                  "Iniciar Sesión"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
