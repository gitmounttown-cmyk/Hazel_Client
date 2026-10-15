import axios from "axios";

const API_URL = "http://localhost:5000/api/inventory"; // Adjust port/URL as per your Express config

// Attach Authorization Token if required by verifyToken middleware
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
});

export const fetchInventory = async (params = {}) => {
  const { page = 1, limit = 8, search = "", status = "" } = params;
  const response = await axios.get(`${API_URL}/all`, {
    ...getAuthHeaders(),
    params: { page, limit, search, status },
  });
  return response.data;
};

export const fetchStockOverview = async () => {
  const response = await axios.get(`${API_URL}/overview`, getAuthHeaders());
  return response.data;
};

export const stockIn = async (productId, quantity, reason) => {
  const response = await axios.post(
    `${API_URL}/stock-in`,
    { productId, quantity, reason },
    getAuthHeaders()
  );
  return response.data;
};

export const stockOut = async (productId, quantity, reason) => {
  const response = await axios.post(
    `${API_URL}/stock-out`,
    { productId, quantity, reason },
    getAuthHeaders()
  );
  return response.data;
};