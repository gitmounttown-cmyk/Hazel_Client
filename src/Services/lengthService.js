import axiosInstance from "../api/axiosInstance";

const BASE = "/lengths";

export const createLength = (data) =>
  axiosInstance.post(`${BASE}/create`, data);

export const getLengths = (params = {}) =>
  axiosInstance.get(`${BASE}/all`, { params });

export const getLengthById = (id) => axiosInstance.get(`${BASE}/${id}`);

export const getLengthBySlug = (slug) =>
  axiosInstance.get(`${BASE}/slug/${slug}`);

export const updateLength = (id, data) =>
  axiosInstance.put(`${BASE}/update/${id}`, data);

export const deleteLength = (id) => axiosInstance.delete(`${BASE}/delete/${id}`);