import axiosInstance from "../api/axiosInstance";

const BASE = "/payments";

// Create Razorpay order
export const createOrder = async (data) => {
  const response = await axiosInstance.post(`${BASE}/create-order`, data);
  return response.data;
};

// Verify Razorpay payment signature
export const verifyPayment = async (data) => {
  const response = await axiosInstance.post(`${BASE}/verify-payment`, data);
  return response.data;
};

// Existing payment APIs
export const createCashfreePayment = (data) =>
  axiosInstance.post(`${BASE}/create`, data);

export const getAllPayments = (params = {}) =>
  axiosInstance.get(`${BASE}/all`, { params });

// Fetch Order & Payment Details by Order ID
export const getPaymentByOrder = async (orderId) => {
  const response = await axiosInstance.get(`${BASE}/order/${orderId}`);
  return response.data;
};

export const updatePaymentStatus = (paymentId, data) =>
  axiosInstance.put(`${BASE}/status/${paymentId}`, data);

export const deletePayment = (paymentId) =>
  axiosInstance.delete(`${BASE}/delete/${paymentId}`);