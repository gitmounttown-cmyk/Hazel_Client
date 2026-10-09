import axiosInstance from "../api/axiosInstance";
import { getGuestId } from "../helpers/guestId";

const getWishlistOwner = () => {
  const token = localStorage.getItem("hazelToken");

  // Logged-in user
  if (token) {
    return {
      isGuest: false,
      guestId: null,
    };
  }

  // Guest user
  return {
    isGuest: true,
    guestId: getGuestId(),
  };
};

const BASE = "/payments";

// Create Razorpay order (with guest support)
export const createOrder = async (data) => {
  const { isGuest, guestId } = getWishlistOwner();

  const requestData = {
    ...data,
    ...(isGuest && { guestId }),
  };

  const response = await axiosInstance.post(`${BASE}/create-order`, requestData);
  return response.data;
};

// Verify Razorpay payment signature (with guest support)
export const verifyPayment = async (data) => {
  const { isGuest, guestId } = getWishlistOwner();

  const requestData = {
    ...data,
    ...(isGuest && { guestId }),
  };

  const response = await axiosInstance.post(`${BASE}/verify`, requestData);
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