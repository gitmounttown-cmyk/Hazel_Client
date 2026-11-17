export interface SendOTPResponse {
  success: boolean;
  message: string;
}

export interface VerifyOTPResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    mobileNumber: string;
    role?: string;
  };
}

export interface ResendOTPResponse {
  success: boolean;
  message: string;
}

export interface GoogleLoginResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    mobileNumber?: string;
    role?: string;
  };
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  mobileNumber?: string;
  [key: string]: any;
}

export interface UpdateUserResponse {
  success: boolean;
  message: string;
  user?: Record<string, unknown>;
}