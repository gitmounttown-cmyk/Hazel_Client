import axiosInstance from "../api/axiosInstance";

// ============================================================
// ADD TO CART
// ============================================================

export const addToCart = async (cartItem) => {
  try {
    const response = await axiosInstance.post("/cart/add", {
      ...cartItem
    });
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};
