import axiosInstance from "../api/axiosInstance";

// ============================================================
// ADD TO CART
// ============================================================

export const addToCart = async (cartItem) => {
  try {
    const response = await axiosInstance.post("/cart/add", {
      ...cartItem,
    });
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    throw error;
  }
};

export const getCart = () => axiosInstance.get("/all");

export const updateCartItem = (itemId, data) =>
  axiosInstance.put(`/item/${itemId}`, data);

export const increaseCartItem = (itemId) =>
  axiosInstance.patch(`/item/${itemId}/increase`);

export const decreaseCartItem = (itemId) =>
  axiosInstance.patch(`/item/${itemId}/decrease`);

export const removeCartItem = (itemId) =>
  axiosInstance.delete(`/item/${itemId}`);

export const clearCart = () => axiosInstance.delete(`/clear`);
