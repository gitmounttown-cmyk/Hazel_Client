import axiosInstance from "../api/axiosInstance";

const BASE = "/products";

// ============================================================
// GET ALL PRODUCTS
// GET /api/products/all
// params: { page, limit, search, categoryId, subCategoryId, brandId, isActive }
// ============================================================

export const getProducts = (params = {}) =>
  axiosInstance.get(`${BASE}/all`, { params });

// ============================================================
// GET PRODUCT BY ID
// GET /api/products/:productId
// ============================================================

export const getProductById = (productId) =>
  axiosInstance.get(`${BASE}/${productId}`);

// ============================================================
// CREATE PRODUCT
// POST /api/products/create
// formData must use field name "media" for files (max 10)
// ============================================================

export const createProduct = (formData) =>
  axiosInstance.post(`${BASE}/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ============================================================
// UPDATE PRODUCT
// PUT /api/products/:productId
// formData must use field name "media" for files (max 10)
// ============================================================

export const updateProduct = (productId, formData) =>
  axiosInstance.put(`${BASE}/${productId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ============================================================
// DELETE PRODUCT (soft delete)
// DELETE /api/products/:productId
// ============================================================

export const deleteProduct = (productId) =>
  axiosInstance.delete(`${BASE}/${productId}`);

// ============================================================
// ADD MEDIA TO A COLOR VARIANT
// POST /api/products/:productId/variants/:variantId/media
// ============================================================

export const addVariantMedia = (productId, variantId, formData) =>
  axiosInstance.post(`${BASE}/${productId}/variants/${variantId}/media`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// ============================================================
// DELETE MEDIA FROM A COLOR VARIANT
// DELETE /api/products/:productId/variants/:variantId/media/:mediaId
// ============================================================

export const deleteVariantMedia = (productId, variantId, mediaId) =>
  axiosInstance.delete(`${BASE}/${productId}/variants/${variantId}/media/${mediaId}`);