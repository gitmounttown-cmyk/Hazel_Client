import axiosInstance from "../api/axiosInstance";

const BASE = "/neck-patterns";

export const createNeckPattern = (formData) =>
  axiosInstance.post(`${BASE}/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getNeckPatterns = (params = {}) =>
  axiosInstance.get(`${BASE}/all`, { params });

export const getNeckPatternById = (id) => axiosInstance.get(`${BASE}/${id}`);

export const getNeckPatternBySlug = (slug) =>
  axiosInstance.get(`${BASE}/slug/${slug}`);

export const updateNeckPattern = (id, formData) =>
  axiosInstance.put(`${BASE}/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteNeckPattern = (id) =>
  axiosInstance.delete(`${BASE}/delete/${id}`);