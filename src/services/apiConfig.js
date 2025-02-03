const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const endpoints = {
  login: `${API_BASE_URL}/admin`, // Endpoint para inicio de sesión
  register: `${API_BASE_URL}/incompleter`, // endpoint de campers incompletos
};

export default API_BASE_URL;