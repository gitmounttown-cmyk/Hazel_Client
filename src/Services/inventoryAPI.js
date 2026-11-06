import axios from "axios";

const API_BASE_URL =
  import.meta.env?.VITE_API_URL || "http://localhost:5004/api";

const API_URL = `${API_BASE_URL}/inventory`;

// Attach Authorization Token
const getAuthHeaders = () => {
  const token = localStorage.getItem("hazelToken") || localStorage.getItem("token");
  return {
    headers: {
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };
};

export const fetchInventory = async (params = {}) => {
  const { page = 1, limit = 20, search = "", status = "" } = params;
  const response = await axios.get(`${API_URL}/all`, {
    ...getAuthHeaders(),
    params: { page, limit, search, status },
  });
  return response.data;
};

export const fetchInventorySummary = async () => {
  const response = await axios.get(`${API_URL}/summary`, getAuthHeaders());
  return response.data;
};

export const updateStock = async (inventoryId, { variantId, sizeId, stockQuantity }) => {
  const response = await axios.put(
    `${API_URL}/${inventoryId}/stock`,
    { variantId, sizeId, stockQuantity },
    getAuthHeaders()
  );
  return response.data;
};

export const syncProductInventory = async (productId) => {
  const response = await axios.post(
    `${API_URL}/product/${productId}/sync`,
    {},
    getAuthHeaders()
  );
  return response.data;
};

export const syncAllInventory = async () => {
  const response = await axios.post(
    `${API_URL}/sync-all`,
    {},
    getAuthHeaders()
  );
  return response.data;
};

export const deleteProduct = async (inventoryId) => {
  const response = await axios.delete(`${API_URL}/${inventoryId}`, getAuthHeaders());
  return response.data;
};

export const deleteSize = async (inventoryId, variantId, sizeId) => {
  const response = await axios.delete(
    `${API_URL}/${inventoryId}/variants/${variantId}/sizes/${sizeId}`,
    getAuthHeaders()
  );
  return response.data;
};
