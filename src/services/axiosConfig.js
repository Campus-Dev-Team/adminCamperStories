import axios from "axios";

export const mainEndpoints = {
  users: "/users",
  campers: "/campers",
  campus: "/campus",
  admin: "/admin",
};

export const excludedEndpoints = {
  cities: mainEndpoints.cities,
  validate: "/validate-session",
  login: "/login",
  exp: "/exp",
};

export const api = axios.create({
  baseURL: import.meta.env.VITE_TEMPORAL_API_BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  async (config) => {
    try {
      if (!isRefreshing) {
        const { data: token } = await axios.get(
          import.meta.env.VITE_TEMPORAL_API_BASE_URL +
            mainEndpoints.users +
            excludedEndpoints.validate,
          { withCredentials: true }
        );

        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    } catch (error) {
      return Promise.reject(error);
    }
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data: newToken } = await axios.post(
          import.meta.env.VITE_TEMPORAL_API_BASE_URL +
            mainEndpoints.users +
            "/refresh-token",
          {},
          { withCredentials: true }
        );

        processQueue(null, newToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
