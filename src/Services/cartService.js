import axiosInstance from "../api/axiosInstance";

const BASE = "/cart";

export const addToCart = (data) => axiosInstance.post(`${BASE}/add`, data);

export const getCart = () => axiosInstance.get(`${BASE}/all`);

export const updateCartItem = (itemId, data) =>
  axiosInstance.put(`${BASE}/item/${itemId}`, data);

export const increaseCartItem = (itemId) =>
  axiosInstance.patch(`${BASE}/item/${itemId}/increase`);

export const decreaseCartItem = (itemId) =>
  axiosInstance.patch(`${BASE}/item/${itemId}/decrease`);

export const removeCartItem = (itemId) =>
  axiosInstance.delete(`${BASE}/item/${itemId}`);

export const clearCart = () => axiosInstance.delete(`${BASE}/clear`);
