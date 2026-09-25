import axiosInstance from "../api/axiosInstance";

const BASE = "/products";

// GET ALL PRODUCTS
// GET /api/products/all
export const getProducts = (params = {}) => {
  return axiosInstance.get(`${BASE}/all`, { params });
};

// GET PRODUCT BY ID
// GET /api/products/:productId
export const getProductById = (productId) => {
  return axiosInstance.get(`${BASE}/${productId}`);
};

// CREATE PRODUCT
// POST /api/products/create
export const createProduct = (data) => {
  const isFormData = data instanceof FormData;
  return axiosInstance.post(`${BASE}/create`, data, {
    headers: {
      "Content-Type": isFormData ? "multipart/form-data" : "application/json",
    },
  });
};

// UPDATE PRODUCT
// PUT /api/products/update/:productId
export const updateProduct = (productId, data) => {
  const isFormData = data instanceof FormData;
  return axiosInstance.put(`${BASE}/update/${productId}`, data, {
    headers: {
      "Content-Type": isFormData ? "multipart/form-data" : "application/json",
    },
  });
};

// DELETE PRODUCT
// DELETE /api/products/delete/:productId
export const deleteProduct = (productId) => {
  return axiosInstance.delete(`${BASE}/delete/${productId}`);
};

// UPLOAD STANDALONE MEDIA
// POST /api/products/upload-media
export const uploadProductMedia = (formData) => {
  return axiosInstance.post(`${BASE}/upload-media`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

// GET VIDEOS
// GET /api/videos/all
export const getVideos = () => {
  return axiosInstance.get("/videos/all");
};