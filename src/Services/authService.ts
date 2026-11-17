import axios, { type AxiosError } from "axios";
import axiosInstance from "../api/axiosInstance";
import type {
  SendOTPResponse,
  VerifyOTPResponse,
  ResendOTPResponse,
  GoogleLoginResponse,
  UpdateUserData,
  UpdateUserResponse,
  APIErrorResponse
} from "../types/auth.types";



export const sendOTP = async (mobileNumber: string): Promise<SendOTPResponse> => {
  try {
    const response = await axiosInstance.post<SendOTPResponse>(
      `/auth/send-otp`,
      { mobileNumber }
    );
    return response.data;
  } catch (error: unknown) {
    const message = axios.isAxiosError<APIErrorResponse>(error) ? error.response?.data?.message
      : "Unable to send OTP.";
    console.error("Send OTP Error:", message);
    throw new Error(message, { cause: error });
  }
};

export const verifyOTP = async (mobileNumber: string, otp: string): Promise<VerifyOTPResponse> => {
  try {
    const response = await axiosInstance.post<VerifyOTPResponse>(
      `/auth/verify-otp`,
      { mobileNumber, otp }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Verify OTP Error:", error);
    if (axios.isAxiosError<APIErrorResponse>(error)) {
      throw (
        error.response?.data || {
          success: false,
          message: "Unable to verify OTP.",
        }
      );
    }

    throw {
      success: false,
      message: "Unable to verify OTP.",
    }
  }
};

export const resendOTP = async (mobileNumber: string): Promise<ResendOTPResponse> => {
  try {
    const response = await axiosInstance.post<ResendOTPResponse>(
      `/auth/resend-otp`,
      { mobileNumber }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Resend OTP Error:", error);
    if (axios.isAxiosError<APIErrorResponse>(error)) {
      throw (
        error.response?.data || {
          success: false,
          message: "Unable to resend OTP.",
        }
      );
    }
    throw {
      success: false,
      message: "Unable to resend OTP."
    }
  }
};

export const googleLogin = async (credential: string): Promise<GoogleLoginResponse> => {
  try {
    const response = await axiosInstance.post<GoogleLoginResponse>(
      `/auth/google`,
      { credential }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Google Login Error:", error);
    if (axios.isAxiosError<APIErrorResponse>(error)) {
      throw (
        error.response?.data || {
          success: false,
          message: "Unable to login with Google.",
        }
      );
    }
    throw {
      success: false,
      message: "Unable to login with Google.",
    }
  }
};

export const isLoggedIn = (): boolean => {
  const token = localStorage.getItem("hazelToken");
  return !!token;
};


export const logout = (): void => {
  localStorage.removeItem("hazelToken");
  localStorage.removeItem("hazelUser");
  sessionStorage.removeItem("hazelMobileNumber");
  localStorage.clear();
  sessionStorage.clear();
};

export const updateUserData = async (userData: UpdateUserData): Promise<UpdateUserResponse> => {
  try {
    const response = await axiosInstance.put<UpdateUserResponse>(
      `/users/update/profile`,
      { ...userData }
    );
    return response.data;
  } catch (error: unknown) {
    console.error("Update User Data Error:", error);
    throw error;
  }
};