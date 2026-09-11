// Adjust this path to wherever your existing axiosInstance actually lives —
// it's the same one ProductVariantList/CategoryList/etc. already import,
// the one showing up as "axiosInstance.js" in your working API calls.
import axiosInstance from "../api/axiosInstance";

// ------------------------------------------------------------
// Size endpoints — mirrors sizeController.js / size routes
// ------------------------------------------------------------
const sizeService = {
  create: (payload) => axiosInstance.post("/size/create", payload),

  getAll: ({ search = "", isActive, page = 1, limit = 10 } = {}) => {
    const params = { search, page, limit };
    if (isActive !== undefined && isActive !== "") params.isActive = isActive;
    return axiosInstance.get("/size/all", { params });
  },

  getById: (id) => axiosInstance.get(`/size/${id}`),

  update: (id, payload) => axiosInstance.put(`/size/update/${id}`, payload),

  remove: (id) => axiosInstance.delete(`/size/delete/${id}`),
};

export default sizeService;