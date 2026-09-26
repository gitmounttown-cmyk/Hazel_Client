import axiosInstance from "../api/axiosInstance";


export const getHeroSlides = async () => {
  const response = await axiosInstance.get(`/hero`);
  return response.data;
};

export const createHeroSlides = async (formData) => {
  const response = await axiosInstance.post(`/hero`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const updateHeroSlide = async (id, formData) => {
  const response = await axiosInstance.put(`/hero/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const deleteHeroSlide = async (id) => {
  const response = await axiosInstance.delete(`/hero/${id}`);
  return response.data;
};

export const getImageUrl = (imagePath) => {
  if (!imagePath) return "";
  if (imagePath.startsWith("http")) return imagePath;
  return `${import.meta.env.VITE_UPLOAD_URL}${imagePath}`;
};