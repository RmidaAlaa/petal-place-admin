export interface AuthFormData {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface AuthFormErrors {
  email: string;
  password: string;
  confirmPassword: string;
  first_name: string;
  last_name: string;
  phone: string;
}

export interface AuthFormTouched {
  email: boolean;
  password: boolean;
  confirmPassword: boolean;
  first_name: boolean;
  last_name: boolean;
  phone: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  first_name: string;
  last_name: string;
  phone?: string;
}