import axiosInstance from "../api/axiosInstance";
import { getGuestId } from "../helpers/guestId";

const getWishlistOwner = () => {
  const token = localStorage.getItem("hazelToken");

  if (token) {
    return {
      isGuest: false,
      guestId: null,
    };
  }

  return {
    isGuest: true,
    guestId: getGuestId(),
  };
};

// ============================================================
// ADD TO CART
// ============================================================

export const addToCart = async (cartItem) => {
  try {
    const { isGuest, guestId } = getWishlistOwner();

    const requestData = {
      ...cartItem,
      ...(isGuest && { guestId }),
    };
    const response = await axiosInstance.post("/cart/add", requestData);
    return response.data;
  } catch (error) {
    console.error("Error adding to cart:", error);
    if (error.response && error.response.data) {
      return error.response.data;
    }
    throw error;
  }
};

export const getCart = async () => {
  try {
    const { isGuest, guestId } = getWishlistOwner();

    const response = await axiosInstance.get("/cart/all", {
      params: {
        ...(isGuest && { guestId }),
      },
    });
    return response.data;
  } catch (error) {
    console.warn("Error fetching cart (safe fallback):", error?.response?.data || error.message);
    // Return a safe empty cart structure instead of throwing to prevent console crash
    return { success: false, cart: { items: [] } };
  }
};

export const updateCartItem = async (data) => {
  try {
    const { isGuest, guestId } = getWishlistOwner();

    const requestData = {
      ...data,
      ...(isGuest && { guestId }),
    };
    const response = await axiosInstance.put("/cart/update", requestData);
    return response.data;
  } catch (error) {
    console.error("Error updating cart item:", error);
    throw error;
  }
};

export const removeCartItem = async (data) => {
  try {
    const { isGuest, guestId } = getWishlistOwner();
    const requestData = {
      ...data,
      ...(isGuest && { guestId }),
    };
    const response = await axiosInstance.delete("/cart/remove", { data: requestData });
    return response.data;
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    const { isGuest, guestId } = getWishlistOwner();

    const requestData = isGuest ? { guestId } : {};

    const response = await axiosInstance.delete("/cart/clear", {
      data: requestData,
    });

    return response.data;
  } catch (error) {
    console.error(
      "Clear cart error:",
      error.response?.data || error.message
    );
    throw error;
  }
};