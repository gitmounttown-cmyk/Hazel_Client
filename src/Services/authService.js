import axiosInstance from "../api/axiosInstance";

export const sendOTP = async (mobileNumber) => {
  try {
    const response = await axiosInstance.post(
      `/auth/send-otp`,
      { mobileNumber }
    );
    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Unable to send OTP.";
    throw new Error(message, { cause: error });
  }
};

export const verifyOTP = async (mobileNumber, otp) => {
  try {
    const response = await axiosInstance.post(
      `/auth/verify-otp`,
      { mobileNumber, otp }
    );
    return response.data;
  } catch (error) {
    console.error("Verify OTP Error:", error);
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to verify OTP.",
      }
    );
  }
};

export const resendOTP = async (mobileNumber) => {
  try {
    const response = await axiosInstance.post(
      `/auth/resend-otp`,
      { mobileNumber }
    );
    return response.data;
  } catch (error) {
    console.error("Resend OTP Error:", error);
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to resend OTP.",
      }
    );
  }
};

export const googleLogin = async (credential) => {
  try {
    const response = await axiosInstance.post(
      `/auth/google`,
      { credential }
    );
    return response.data;
  } catch (error) {
    console.error("Google Login Error:", error);
    throw (
      error.response?.data || {
        success: false,
        message: "Unable to login with Google.",
      }
    );
  }
};

export const isLoggedIn = () => {
  const token = localStorage.getItem("hazelToken");
  return !!token;
};

export const logout = () => {
  localStorage.removeItem("hazelToken");
  localStorage.removeItem("hazelUser");
  sessionStorage.removeItem("hazelMobileNumber");
  localStorage.clear();
  sessionStorage.clear();
};

export const updateUserData = async (userData) => {
  try {
    const response = await axiosInstance.put(
      `/users/update/profile`,
      { ...userData }
    );
    return response.data;
  } catch (error) {
    console.error("Update User Data Error:", error);
    throw error;
  }
};