import axiosInstance from "../api/axiosInstance";

const BASE = "/trending-products";

export const createTrendingProduct = (formData) =>
  axiosInstance.post(`${BASE}/create`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const getTrendingProducts = () => axiosInstance.get(`${BASE}/all`);

export const getTrendingProductById = (id) =>
  axiosInstance.get(`${BASE}/${id}`);

export const updateTrendingProduct = (id, formData) =>
  axiosInstance.put(`${BASE}/update/${id}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

export const deleteTrendingProduct = (id) =>
  axiosInstance.delete(`${BASE}/delete/${id}`);
