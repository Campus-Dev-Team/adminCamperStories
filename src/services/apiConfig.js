const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const endpoints = {
  login: `${API_BASE_URL}users/login`,
  Count: `${API_BASE_URL}admin`,
  Imcomplete: `${API_BASE_URL}admin/incomplete`, // endpoint de campers incompletos
};

export default API_BASE_URL;