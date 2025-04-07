import { api, mainEndpoints } from "../services/axiosConfig";

export const fetchDonaciones = async (campusId) => {
  try {
    const response = await api.get(
      `${mainEndpoints.admin}/donatedCampers/${campusId}`
    );
    return response.data;
  } catch (error) {
    console.error("Error al obtener las donaciones:", error);
  }
};
