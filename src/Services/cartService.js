import axiosInstance from "../api/axiosInstance";
import { getGuestId } from "../helpers/guestId";


const getWishlistOwner = () => {
  const token = localStorage.getItem("hazelToken");

  // Logged-in user
  if (token) {
    return {
      isGuest: false,
      guestId: null,
    };
  }

  // Guest user
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

      // Send guestId only for guest
      ...(isGuest && { guestId }),
    };
    const response = await axiosInstance.post("/cart/add", requestData);
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
    const { isGuest, guestId } = getWishlistOwner();

    const response = await axiosInstance.get("/cart/all", {
      params: {
        ...(isGuest && { guestId }),
      },
    });
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
    const { isGuest, guestId } = getWishlistOwner();
    const requestData = {
      ...data,
      ...(isGuest && { guestId }),
    };
    // Aligned with backend router.delete("/remove") using body payload
    const response = await axiosInstance.delete("/cart/remove", { data: requestData });
    return response.data;
  } catch (error) {
    console.error("Error removing cart item:", error);
    throw error;
  }
};

// export const clearCart = async () => {
//   try {
//     const { isGuest, guestId } = getWishlistOwner();
//     const requestData = {
//       ...(isGuest && { guestId }),
//     };
//     // Added missing "/cart" prefix
//     const response = await axiosInstance.delete("/cart/clear", { data: requestData });
//     return response.data;
//   } catch (error) {
//     console.error("Error clearing cart:", error);
//     throw error;
//   }
// };

export const clearCart = async () => {
  try {
    const { isGuest, guestId } = getWishlistOwner();

    const requestData = isGuest ? { guestId } : {};

    console.log("Request payload:", requestData);

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