import axiosInstance from "../api/axiosInstance";
import { getGuestId } from "../helpers/guestId";

const BASE = "/wishlist";

// ============================================================
// GET OWNER DATA
// ============================================================

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
// ADD TO WISHLIST
// ============================================================

export const addToWishlist = (data) => {
  try {
    const { isGuest, guestId } = getWishlistOwner();

    const requestData = {
      ...data,

      // Send guestId only for guest
      ...(isGuest && { guestId }),
    };

    return axiosInstance.post(`${BASE}/add`, requestData);
  } catch (error) {
    console.error("Error adding to wishlist:", error);
    throw error;
  }
};

// ============================================================
// GET WISHLIST
// ============================================================

export const getWishlist = () => {
  const { isGuest, guestId } = getWishlistOwner();

  // Logged-in user
  if (!isGuest) {
    return axiosInstance.get(`${BASE}/all`);
  }

  // Guest user
  return axiosInstance.get(`${BASE}/all`, {
    params: {
      guestId,
    },
  });
};

// ============================================================
// REMOVE WISHLIST ITEM
// ============================================================

export const removeWishlistItem = (productId) => {
  const { isGuest, guestId } = getWishlistOwner();

  if (isGuest) {
    return axiosInstance.delete(`${BASE}/remove/${productId}`, {
      params: {
        guestId,
      },
    });
  }

  return axiosInstance.delete(`${BASE}/remove/${productId}`);
};

// ============================================================
// REMOVE BY VARIANT
// ============================================================

export const removeByVariant = (variantId) => {
  const { isGuest, guestId } = getWishlistOwner();

  if (isGuest) {
    return axiosInstance.delete(`${BASE}/variant/${variantId}`, {
      params: {
        guestId,
      },
    });
  }

  return axiosInstance.delete(`${BASE}/variant/${variantId}`);
};

// ============================================================
// CLEAR WISHLIST
// ============================================================

export const clearWishlist = () => {
  const { isGuest, guestId } = getWishlistOwner();

  if (isGuest) {
    return axiosInstance.delete(`${BASE}/clear`, {
      params: {
        guestId,
      },
    });
  }

  return axiosInstance.delete(`${BASE}/clear`);
};

// ============================================================
// CHECK WISHLIST
// ============================================================

export const checkWishlist = (productId) => {
  const { isGuest, guestId } = getWishlistOwner();

  if (isGuest) {
    return axiosInstance.get(`${BASE}/check/${productId}`, {
      params: {
        guestId,
      },
    });
  }

  return axiosInstance.get(`${BASE}/check/${productId}`);
};