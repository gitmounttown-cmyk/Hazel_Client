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

export const getCart = async () => {
  try {
    const response = await axiosInstance.get("/cart/all");
    return response.data;
  } catch (error) {
    console.error("Error fetching cart:", error);
    throw error;
  }
};

export const updateCartItem = async (itemId, data) => {
  try {
    const response = await axiosInstance.put(`/item/${itemId}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

export const increaseCartItem = async (itemId) => {
  try {
    const response = await axiosInstance.patch(`/item/${itemId}/increase`);
    return response.data;
  } catch (error) {
    console.error("Error increasing cart item quantity:", error);
    throw error;
  }
};

export const decreaseCartItem = async (itemId) => {
  try {
    const response = await axiosInstance.patch(`/item/${itemId}/decrease`);
    return response.data;
  } catch (error) {
    console.error("Error decreasing cart item quantity:", error);
    throw error;
  }
};

export const removeCartItem = async (itemId) => {
  try {
    const response = await axiosInstance.delete(`/cart/remove/${itemId}`);
    return response.data;
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    const response = await axiosInstance.delete(`/clear`);
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};
