import { api, mainEndpoints, excludedEndpoints } from "./axiosConfig";

class AuthService {
  static async getToken() {
    try {
      return (await api.get(mainEndpoints.users + excludedEndpoints.validate))
        .data;
    } catch (error) {
      throw error;
    }
  }

  static async getTokenExpiration() {
    try {
      return (await api.get(mainEndpoints.users + excludedEndpoints.exp)).data;
    } catch (error) {
      throw error;
    }
  }

  static async checkAuth() {
    try {
      const token = await this.getToken();
      if (token) {
        if (token.user.role_id === 1 || token.user.role_id === 5) {
          return "/dashboard";
        }
      } else {
        if (window.location.pathname !== "/login") {
          return "/";
        }
      }
    } catch (error) {
      if (error.message.startsWith("Sesión expirada")) {
        return "/";
      }
    }
  }
}

export default AuthService;
