import axiosInstance from "../api/axiosInstance";

const BASE = "/size-charts";

export const getSizeCharts = (params = {}) => {
  return axiosInstance.get(`${BASE}/all`, { params });
};

export const getSizeChartById = (id) => {
  return axiosInstance.get(`${BASE}/${id}`);
};

export const getSizeChartByProductId = (productId) => {
  return axiosInstance.get(`${BASE}/product/${productId}`);
};

export const createSizeChart = (formData) => {
  const isFormData = formData instanceof FormData;
  return axiosInstance.post(`${BASE}/create`, formData, {
    headers: {
      "Content-Type": isFormData ? "multipart/form-data" : "application/json",
    },
  });
};

export const updateSizeChart = (id, formData) => {
  const isFormData = formData instanceof FormData;
  return axiosInstance.put(`${BASE}/update/${id}`, formData, {
    headers: {
      "Content-Type": isFormData ? "multipart/form-data" : "application/json",
    },
  });
};

export const deleteSizeChart = (id) => {
  return axiosInstance.delete(`${BASE}/delete/${id}`);
};

const sizeChartService = {
  getSizeCharts,
  getSizeChartById,
  getSizeChartByProductId,
  createSizeChart,
  updateSizeChart,
  deleteSizeChart,
};

export default sizeChartService;
