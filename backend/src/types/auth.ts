export interface RegisterRequestBody {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: 'customer' | 'admin' | 'florist';
}

export interface LoginRequestBody {
  email: string;
  password: string;
}

export interface AuthResponse {
  message: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  token: string;
}

export interface TokenPayload {
  userId: number;
  email: string;
  role: string;
}

export interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  phone: string;
  role: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: Date;
}

export interface UserProfileResponse {
  user: UserProfile;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface ChangePasswordResponse {
  message: string;
}