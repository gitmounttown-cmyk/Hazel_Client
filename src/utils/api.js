import axios from "axios";

// Automatically use Vite environment variable if set, otherwise fallback based on hostname
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (window.location.hostname === "localhost" 
    ? "http://localhost:5004/api" 
    : "https://hazelcart.com/api");

const API = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Automatically attach Authorization token if available in localStorage
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("hazelToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default API;