import axios from "axios";

// Automatically detect whether we are running locally or on live production
const isLocal = window.location.hostname === "localhost" || window.location.hostname === "5004";

const API_BASE_URL = isLocal
  ? "http://localhost:5004/api"
  : "https://hazelcart.com/api"; // Live backend API base URL

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