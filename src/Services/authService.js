import axios from "axios";

// const API_URL = "http://localhost:5004/api/auth";
import axiosInstance from "../api/axiosInstance";

// ============================================================
// SEND OTP
// ============================================================

export const sendOTP = async (mobileNumber) => {
  try {
    const response = await axiosInstance.post(
      `/auth/send-otp`,
      {
        mobileNumber,
      }
    );

    return response.data;
  } catch (error) {
    const message =
      error.response?.data?.message ||
      "Unable to send OTP.";

    throw new Error(message, {
      cause: error,
    });
  }
};

// ============================================================
// VERIFY OTP
// ============================================================

export const verifyOTP = async (
  mobileNumber,
  otp
) => {
  try {
    const response = await axiosInstance.post(
      `/auth/verify-otp`,
      {
        mobileNumber,
        otp,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Verify OTP Error:",
      error
    );

    throw (
      error.response?.data || {
        success: false,
        message: "Unable to verify OTP.",
      }
    );
  }
};

// ============================================================
// RESEND OTP
// ============================================================

export const resendOTP = async (
  mobileNumber
) => {
  try {
    const response = await axiosInstance.post(
      `/auth/resend-otp`,
      {
        mobileNumber,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Resend OTP Error:",
      error
    );

    throw (
      error.response?.data || {
        success: false,
        message: "Unable to resend OTP.",
      }
    );
  }
};

// ============================================================
// GOOGLE LOGIN
// ============================================================

export const googleLogin = async (
  credential
) => {
  try {
    const response = await axiosInstance.post(
      `/auth/google`,
      {
        credential,
      }
    );

    return response.data;
  } catch (error) {
    console.error(
      "Google Login Error:",
      error
    );

    throw (
      error.response?.data || {
        success: false,
        message:
          "Unable to login with Google.",
      }
    );
  }
};

//add logout function to clear localStorage and sessionStorage
export const logout = () => {
  localStorage.removeItem("hazelToken");
  localStorage.removeItem("hazelUser");
  sessionStorage.removeItem("hazelMobileNumber");
  localStorage.clear();
  sessionStorage.clear();
}