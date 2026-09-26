import axios from "axios";


const getBaseUrl = () => {
  if (typeof window !== "undefined" && window.location.hostname !== "localhost") {
  
    return `${window.location.protocol}//${window.location.host}`;
 
  }
  return "http://localhost:5004";
};

const API_URL = getBaseUrl();

const apiClient = axios.create({
  baseURL: `${API_URL}/api/hero`,
  withCredentials: true,
});

export const getHeroSlides = async () => {
  const response = await apiClient.get("/");
  return response.data;
};

export const createHeroSlides = async (formData) => {
  const response = await apiClient.post("/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateHeroSlide = async (id, formData) => {
  const response = await apiClient.put(`/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteHeroSlide = async (id) => {
  const response = await apiClient.delete(`/${id}`);
  return response.data;
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${API_URL}${imagePath}`;
};