import axiosInstance from "../api/axiosInstance";

const BASE = "/auth";

export const getProfile = () => axiosInstance.get(`${BASE}/me`);

export const updateProfile = (formData) =>
  axiosInstance.put(`${BASE}/profile`, formData);
