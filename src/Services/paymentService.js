import axiosInstance from "../api/axiosInstance";

const BASE = "/payments";

export const createCashfreePayment = (data) =>
  axiosInstance.post(`${BASE}/create`, data);

export const getAllPayments = (params = {}) =>
  axiosInstance.get(`${BASE}/all`, { params });

export const getPaymentByOrder = (orderId) =>
  axiosInstance.get(`${BASE}/order/${orderId}`);

export const updatePaymentStatus = (paymentId, data) =>
  axiosInstance.put(`${BASE}/status/${paymentId}`, data);

export const deletePayment = (paymentId) =>
  axiosInstance.delete(`${BASE}/delete/${paymentId}`);
