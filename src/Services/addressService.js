import axiosInstance from "../api/axiosInstance";

const BASE = "/addresses";

export const createAddress = (data) =>
  axiosInstance.post(`${BASE}/create`, data);

export const getAddresses = (params = {}) =>
  axiosInstance.get(`${BASE}/all`, { params });

export const getAddressById = (id) => axiosInstance.get(`${BASE}/${id}`);

export const updateAddress = (id, data) =>
  axiosInstance.put(`${BASE}/update/${id}`, data);

export const deleteAddress = (id) =>
  axiosInstance.delete(`${BASE}/delete/${id}`);

export const setDefaultAddress = (id) =>
  axiosInstance.patch(`${BASE}/${id}/default`);
