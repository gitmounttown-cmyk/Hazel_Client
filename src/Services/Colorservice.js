import axiosInstance from "../api/axiosInstance";

// NOTE: axiosInstance already has baseURL "http://localhost:5004/api"
// and attaches the "hazelToken" auth header automatically via its
// request interceptor, so we only need the "/colors" sub-path here.

// ============================================================
// GET ALL COLORS (with search + pagination)
// ============================================================
export const getColors = (params = {}) => {
  return axiosInstance.get("/colors/all", { params });
};

// ============================================================
// GET COLOR BY ID
// ============================================================
export const getColorById = (id) => {
  return axiosInstance.get(`/colors/${id}`);
};

// ============================================================
// CREATE COLOR
// ============================================================
export const createColor = (payload) => {
  return axiosInstance.post("/colors/create", payload);
};

// ============================================================
// UPDATE COLOR
// ============================================================
export const updateColor = (id, payload) => {
  return axiosInstance.put(`/colors/update/${id}`, payload);
};

// ============================================================
// DELETE COLOR
// ============================================================
export const deleteColor = (id) => {
  return axiosInstance.delete(`/colors/delete/${id}`);
};