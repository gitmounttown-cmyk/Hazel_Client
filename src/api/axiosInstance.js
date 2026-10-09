import axios from "axios";
import API_URL from "../config/api";

const axiosInstance = axios.create({
  baseURL: API_URL.replace(/\/+$/, ""), // Automatically trims any trailing slash
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hazelToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Check if error was caused by manual cancellation/abortion
    if (axios.isCancel(error)) {
      console.warn("[API CANCELLED]", error.message);
    } else {
      console.error(
        "[API ERROR]",
        error.config?.url,
        error.response?.status || "NO_RESPONSE",
        error.response?.data || error.message
      );
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;

