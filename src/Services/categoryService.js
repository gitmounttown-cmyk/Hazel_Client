import axiosInstance from "../api/axiosInstance";

const BASE = "/categories";

export const createCategory = (formData) =>
  axiosInstance.post(`${BASE}/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getCategories = (params = {}) =>
  axiosInstance.get(`${BASE}/all`, { params });

export const getCategoryById = (id) => axiosInstance.get(`${BASE}/${id}`);

export const getCategoryBySlug = (slug) =>
  axiosInstance.get(`${BASE}/slug/${slug}`);

export const updateCategory = (id, formData) =>
  axiosInstance.put(`${BASE}/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteCategory = (id) =>
  axiosInstance.delete(`${BASE}/delete/${id}`);