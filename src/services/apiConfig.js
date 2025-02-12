const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const endpoints = {
  login: `${API_BASE_URL}users/login`,
  count: `${API_BASE_URL}admin`,
  incomplete: `${API_BASE_URL}admin/incomplete`,
  campers: `${API_BASE_URL}campers/1/campus`,
  campersDetails: (id) => `${API_BASE_URL}campers/${id}/details`,
  allCampersDetails: `${API_BASE_URL}campers/all/details`,
};

export default API_BASE_URL;