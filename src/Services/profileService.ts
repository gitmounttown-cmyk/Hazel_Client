import type { AxiosResponse } from "axios";
import axiosInstance from "../api/axiosInstance";
import type { ProfileApiResponse } from "../types/profile.types";

const BASE = "/auth";

export const getProfile = (): Promise<AxiosResponse<ProfileApiResponse>> => 
{
  return axiosInstance.get<ProfileApiResponse>(`${BASE}/me`);
}
  
export const updateProfile = (formData: FormData): Promise<AxiosResponse<ProfileApiResponse>> => {
  return axiosInstance.put<ProfileApiResponse>(`/users/update/profile`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
}
