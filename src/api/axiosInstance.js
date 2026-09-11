import axios from "axios";
import API_URL from "../config/api";

const axiosInstance = axios.create({
  baseURL: API_URL,
  // headers: {
  //   "Content-Type": "application/json",
  // },
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
  },
);

axiosInstance.interceptors.response.use(
  (response) => {
    console.log("[API SUCCESS]", response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error(
      "[API ERROR]",
      error.config?.url,
      error.response?.status,
      error.response?.data || error.message,
    );

    return Promise.reject(error);
  },
);

export default axiosInstance;
