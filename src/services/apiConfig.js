const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const endpoints = {
  login: `${API_BASE_URL}users/login`,
  Count: `${API_BASE_URL}admin`,
  Imcomplete: `${API_BASE_URL}admin/incomplete`,
  campers: `${API_BASE_URL}campers`,
  campersDetails: `${API_BASE_URL}campers/:id/details` // endpoint de campers 
};

export default API_BASE_URL;