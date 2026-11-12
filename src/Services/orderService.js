import axiosInstance from "../api/axiosInstance";

const BASE = "/orders";

export const createOrder = (data) => axiosInstance.post(`${BASE}/create`, data);

export const getMyOrders = () => axiosInstance.get(`${BASE}/my-orders`);

export const getOrderById = (id) => axiosInstance.get(`${BASE}/${id}`);

export const getAllOrders = (params = {}) =>
  axiosInstance.get(`${BASE}/admin/all`, {
    params,
  });

export const updateOrderStatus = (id, data) =>
  axiosInstance.patch(`${BASE}/status/${id}`, data);

export const cancelOrder = (id, data) =>
  axiosInstance.patch(`${BASE}/cancel/${id}`, data);

export const updateTracking = (id, data) =>
  axiosInstance.patch(`${BASE}/tracking/${id}`, data);

export const deleteOrder = (id) => axiosInstance.delete(`${BASE}/delete/${id}`);

/**
 * Get direct invoice URL for an order
 */
export const getInvoiceUrl = (id, download = false) => {
  const baseURL = axiosInstance.defaults?.baseURL || "/api";
  return `${baseURL}${BASE}/${id}/invoice${download ? "?download=1" : ""}`;
};

/**
 * Downloads invoice PDF as an attachment
 */
export const downloadInvoice = async (id, orderNumber = "") => {
  try {
    const response = await axiosInstance.get(`${BASE}/${id}/invoice?download=1`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.setAttribute("download", `Invoice-${orderNumber || id}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
    return true;
  } catch (error) {
    console.error("Download invoice error:", error);
    throw error;
  }
};

/**
 * Opens invoice in a new tab / window for instant printing
 */
export const printInvoice = async (id) => {
  try {
    const response = await axiosInstance.get(`${BASE}/${id}/invoice`, {
      responseType: "blob",
    });

    const blob = new Blob([response.data], { type: "application/pdf" });
    const fileUrl = window.URL.createObjectURL(blob);
    const printWindow = window.open(fileUrl, "_blank");

    if (printWindow) {
      printWindow.focus();
    } else {
      // Fallback if popup blocked
      const link = document.createElement("a");
      link.href = fileUrl;
      link.target = "_blank";
      link.click();
    }
    return true;
  } catch (error) {
    console.error("Print invoice error:", error);
    throw error;
  }
};

/**
 * Dispatches invoice to Admin and/or Customer via Email & SMS
 */
export const sendInvoiceNotification = (id, data = {}) =>
  axiosInstance.post(`${BASE}/${id}/send-invoice`, data);
