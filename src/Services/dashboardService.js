import axiosInstance from "../api/axiosInstance";

// ============================================================
// GET ALL DASHBOARD DATA
// GET /api/dashboard/all
// ============================================================

export const getDashboardData = async (fromDate, toDate) => {
  try {
    const response = await axiosInstance.get("/dashboard/all", {
      params: {
        fromDate,
        toDate
      }
    });

    return response.data;
  } catch (error) {
    console.error(
      "GET DASHBOARD DATA ERROR:",
      error.response?.data || error.message
    );

    throw error;
  }
};