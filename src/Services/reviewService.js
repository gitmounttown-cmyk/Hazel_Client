import axiosInstance from "../api/axiosInstance";

const BASE = "/reviews";

export const createReview = (data) =>
  axiosInstance.post(`${BASE}/create`, data);

export const getProductReviews = (productId) =>
  axiosInstance.get(`${BASE}/product/${productId}`);

export const getAllReviews = () => axiosInstance.get(`${BASE}/admin/all`);

export const updateReviewStatus = (id, data) =>
  axiosInstance.patch(`${BASE}/status/${id}`, data);

export const deleteReview = (id) =>
  axiosInstance.delete(`${BASE}/delete/${id}`);
