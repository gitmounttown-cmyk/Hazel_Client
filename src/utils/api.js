import axios from "axios";

// FIX: Force localhost if running on localhost, otherwise fallback to production URL
const API_BASE_URL = 
  window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:5004/api"
    : (import.meta.env.VITE_API_URL || "https://hazelcart.com/api");

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