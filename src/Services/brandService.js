import axiosInstance from "../api/axiosInstance";

const BASE = "/brands";

export const createBrand = (formData) =>
  axiosInstance.post(`${BASE}/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getBrands = (params = {}) =>
  axiosInstance.get(`${BASE}/all`, { params });

export const getBrandById = (id) => axiosInstance.get(`${BASE}/${id}`);

export const updateBrand = (id, formData) =>
  axiosInstance.put(`${BASE}/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteBrand = (id) => axiosInstance.delete(`${BASE}/delete/${id}`);