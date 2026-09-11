import axiosInstance from "../api/axiosInstance";

const BASE = "/subcategories";

// POST /api/subcategories/create — multipart, field name "image"
export const createSubCategory = (formData) =>
  axiosInstance.post(`${BASE}/create`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// GET /api/subcategories/all — no pagination/filtering support on the
// backend; it returns every sub category with categoryId populated
// (name, imageURL). Any params passed here are simply ignored server-side.
export const getSubCategories = (params = {}) =>
  axiosInstance.get(`${BASE}/all`, { params });

// GET /api/subcategories/:id
export const getSubCategoryById = (id) => axiosInstance.get(`${BASE}/${id}`);

// PUT /api/subcategories/update/:id — multipart, field name "image"
export const updateSubCategory = (id, formData) =>
  axiosInstance.put(`${BASE}/update/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

// DELETE /api/subcategories/delete/:id
export const deleteSubCategory = (id) =>
  axiosInstance.delete(`${BASE}/delete/${id}`);