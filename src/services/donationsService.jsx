import { api, mainEndpoints } from './axiosConfig';

export const fetchDonaciones = async (campusId) => {
  try {
    const response = await api.get(`${mainEndpoints.admin}/donatedCampers/${campusId}`);
    
    if (!response.data) {
      throw new Error('La respuesta del servidor no contiene datos');
    }
    
    return response.data;
  } catch (error) {
    console.error('Error en fetchDonaciones:', error);
    throw error; // Re-lanzamos el error para manejarlo en el componente
  }
};