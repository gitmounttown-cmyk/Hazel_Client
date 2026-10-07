import axiosInstance from "../api/axiosInstance";

const BASE = "/payments";

// Create Razorpay order
export const createOrder = async (data) => {
  const response = await axiosInstance.post(`${BASE}/create-order`, data);
  return response.data;
};

// Existing payment APIs
export const createCashfreePayment = (data) =>
  axiosInstance.post("/payments/create", data);

export const getAllPayments = (params = {}) =>
  axiosInstance.get("/payments/all", { params });

export const getPaymentByOrder = (orderId) =>
  axiosInstance.get(`/payments/order/${orderId}`);

export const updatePaymentStatus = (paymentId, data) =>
  axiosInstance.put(`/payments/status/${paymentId}`, data);

export const deletePayment = (paymentId) =>
  axiosInstance.delete(`/payments/delete/${paymentId}`);