import axiosInstance from "../api/axiosInstance";

// ============================================================
// ADD TO CART
// ============================================================

export const addToCart = async (cartItem) => {
  try {
    const response = await axiosInstance.post("/cart/add", {
      ...cartItem,
    });
    // Ensure response.data is returned so controllers/components can read response.data.success
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    // Return error response data if available so the frontend toast catches the backend message
    if (error.response && error.response.data) {
      return error.response.data;
    }
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

export const updateCartItem = async (data) => {
  try {
    // Aligned with backend router.put("/update")
    const response = await axiosInstance.put("/cart/update", data);
    return response.data;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

export const removeCartItem = async (data) => {
  try {
    // Aligned with backend router.delete("/remove") using body payload
    const response = await axiosInstance.delete("/cart/remove", { data });
    return response.data;
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    // Added missing "/cart" prefix
    const response = await axiosInstance.delete("/cart/clear");
    return response.data;
  } catch (error) {
    console.error("Error clearing cart:", error);
    throw error;
  }
};