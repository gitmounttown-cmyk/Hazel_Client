export interface ProfileUser {
  id: string;
  name: string | null;
  email: string | null;
  mobileNumber: string;
  profileImage?: string | null;
  role?: string;
  isVerified?: boolean;
  isActive?: boolean;
}

export interface ProfileApiResponse {
  success: boolean;
  message?: string;
  user: ProfileUser;
}

export interface ProfileFormData {
  name: string;
  email: string;
  mobileNumber: string;
  profileImage: string;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
}