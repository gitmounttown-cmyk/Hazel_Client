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

export const getAllNotifications = async () => {
  try {
    const { isGuest, guestId } = getWishlistOwner();

    const response = await axiosInstance.get("/notifications/all", {
      params: {
        ...(isGuest && { guestId }),
      },
    });
    return response.data;
  } catch (error) {
    console.warn("Error fetching notifications (safe fallback):", error?.response?.data || error.message);
    // Return a safe empty notifications structure instead of throwing to prevent console crash
    return { success: false, notifications: [] };
  }
};

export const getNotifications = async () => {
  try {
    const { isGuest, guestId } = getWishlistOwner();

    const response = await axiosInstance.get("/notifications/my", {
      params: {
        ...(isGuest && { guestId }),
      },
    });
    return response.data;
  } catch (error) {
    console.warn("Error fetching notifications (safe fallback):", error?.response?.data || error.message);
    // Return a safe empty notifications structure instead of throwing to prevent console crash
    return { success: false, notifications: [] };
  }
};

export const updateNotificationRead = async (id) => {
  try {
    const { isGuest, guestId } = getWishlistOwner();

    const requestData = {
      notificationId: id,
      ...(isGuest && { guestId }),
    };

    const response = await axiosInstance.patch(`/notifications/read/${id}`, requestData);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};


export const markAllNotificationsRead = async () => {
  try {
    const { isGuest, guestId } = getWishlistOwner();

    const requestData = isGuest ? { guestId } : {};

    const response = await axiosInstance.patch("/notifications/read-all", requestData);

    return response.data;
  } catch (error) {
    console.error(
      "Mark all notifications as read error:",
      error.response?.data || error.message
    );
    throw error;
  }
};