import { api, mainEndpoints } from "../services/axiosConfig";

export async function getCampusIdByCityId(cityId) {
  try {
    const response = await api.get(`${mainEndpoints.campus}/${cityId}/city`);
    return response.data;
  } catch (error) {
    console.error("Error al obtener las donaciones:", error);
  }
}
