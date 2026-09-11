import axiosInstance from "../api/axiosInstance";

// ============================================================
// GET ALL COUPONS
// GET /api/coupons/all
// ============================================================

export const getCoupons = async () => {
  try {
    const response = await axiosInstance.get("/coupons/all");

    return response.data;
  } catch (error) {
    console.error(
      "GET COUPONS ERROR:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// =============================================================
// CREATE COUPON
// =============================================================

export const createCoupon = async (data) => {
  const response = await axiosInstance.post(
    "/coupons/create",
    data
  );

  return response.data;
};


// =============================================================
// UPDATE COUPON
// =============================================================

export const updateCoupon = async (
  couponId,
  data
) => {
  const response = await axiosInstance.patch(
    `/coupons/update/${couponId}`,
    data
  );

  return response.data;
};


// =============================================================
// DELETE COUPON
// =============================================================

export const deleteCoupon = async (
  couponId
) => {
  const response = await axiosInstance.delete(
    `/coupons/delete/${couponId}`
  );

  return response.data;
};