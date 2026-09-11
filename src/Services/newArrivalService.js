import axiosInstance from "../api/axiosInstance";

const BASE = "/newArrivals";

export const createNewArrival = (formData) =>
  axiosInstance.post(`${BASE}/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const getNewArrivals = (params = {}) =>
  axiosInstance.get(`${BASE}/all`, { params });

export const getNewArrivalById = (id) => axiosInstance.get(`${BASE}/${id}`);

export const updateNewArrival = (id, formData) =>
  axiosInstance.put(`${BASE}/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

export const deleteNewArrival = (id) =>
  axiosInstance.delete(`${BASE}/delete/${id}`);
