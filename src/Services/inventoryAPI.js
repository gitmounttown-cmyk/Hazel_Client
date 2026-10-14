import axios from "axios";

const API_URL = import.meta.env.VITE_API_BASE_URL 
  ? `${import.meta.env.VITE_API_BASE_URL}/inventory` 
  : "http://localhost:5004/api/inventory";

const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("hazelToken") || localStorage.getItem("token")}`,
  },
});

export const fetchInventory = async (params = {}) => {
  const { page = 1, limit = 20, search = "", status = "" } = params;
  const response = await axios.get(`${API_URL}/all`, {
    ...getAuthHeaders(),
    params: { page, limit, search, status },
  });
  return response.data;
};

export const fetchStockOverview = async () => {
  const response = await axios.get(`${API_URL}/summary`, getAuthHeaders());
  return response.data;
};

export const updateStockQuantity = async (inventoryId, payload) => {
  const response = await axios.put(`${API_URL}/${inventoryId}/stock`, payload, getAuthHeaders());
  return response.data;
};

export const syncAllInventory = async () => {
  const response = await axios.post(`${API_URL}/sync-all`, {}, getAuthHeaders());
  return response.data;
};