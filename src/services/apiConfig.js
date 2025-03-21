const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const endpoints = {
  notRegistered: `${API_BASE_URL}admin/2/getAllUnlisted`,
  login: `${API_BASE_URL}users/login`,
  count: `${API_BASE_URL}admin`,
  incomplete: `${API_BASE_URL}admin/incomplete`,
  campers: `${API_BASE_URL}campers/1/campus`,
  campersDetails: (id) => `${API_BASE_URL}campers/${id}/details`,
  allCampersDetails: `${API_BASE_URL}campers/all/details`,
  myCampusCampers: `${API_BASE_URL}admin/campers/my-campus`, // Nuevo endpoint para obtener campers del campus del usuario
  donatedCampers: `${API_BASE_URL}admin/donatedCampers/1`,
};

export default API_BASE_URL;