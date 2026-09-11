import axiosInstance from "../api/axiosInstance";

const BASE = "/product-variants";

export const createProductVariant = (formData) =>
  axiosInstance.post(`${BASE}/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getProductVariants = (params = {}) =>
  axiosInstance.get(`${BASE}/all`, { params });

export const getProductVariantById = (id) =>
  axiosInstance.get(`${BASE}/${id}`);

export const updateProductVariant = (id, formData) =>
  axiosInstance.put(`${BASE}/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteProductVariant = (id) =>
  axiosInstance.delete(`${BASE}/delete/${id}`);