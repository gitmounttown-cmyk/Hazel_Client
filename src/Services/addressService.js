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

const BASE = "/addresses";

export const createAddress = (data) => {
  try {
    const { isGuest, guestId } = getWishlistOwner();

    const requestData = {
      ...data,
      guestId: isGuest ? guestId : undefined,
    };

    return axiosInstance.post(`${BASE}/create`, requestData);
  } catch (error) {
    console.error("Error creating address:", error);
    throw error;
  }
};

export const getAddresses = (params = {}) =>
  axiosInstance.get(`${BASE}/all`, { params });

export const getAddressById = (id) => axiosInstance.get(`${BASE}/${id}`);

export const updateAddress = (id, data) =>
  axiosInstance.put(`${BASE}/update/${id}`, data);

export const deleteAddress = (id) =>
  axiosInstance.delete(`${BASE}/delete/${id}`);

export const setDefaultAddress = (id) =>
  axiosInstance.patch(`${BASE}/${id}/default`);

// get user addresss
export const getUserAddresses = (userId) =>
  axiosInstance.get(`${BASE}/user/${userId}`);