import axiosInstance from "../api/axiosInstance";

const BASE = "/orders";

export const createOrder = (data) => axiosInstance.post(`${BASE}/create`, data);

export const getMyOrders = () => axiosInstance.get(`${BASE}/my-orders`);

export const getOrderById = (id) => axiosInstance.get(`${BASE}/${id}`);

export const getAllOrders = (params = {}) =>
  axiosInstance.get(`${BASE}/admin/all`, {
    params,
  });

export const updateOrderStatus = (id, data) =>
  axiosInstance.patch(`${BASE}/status/${id}`, data);

export const cancelOrder = (id, data) =>
  axiosInstance.patch(`${BASE}/cancel/${id}`, data);

export const updateTracking = (id, data) =>
  axiosInstance.patch(`${BASE}/tracking/${id}`, data);

export const deleteOrder = (id) => axiosInstance.delete(`${BASE}/delete/${id}`);
