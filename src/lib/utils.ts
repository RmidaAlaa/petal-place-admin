import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string) => {
  const minLength = 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const errors: string[] = [];
  if (password.length < minLength) errors.push(`At least ${minLength} characters`);
  if (!hasUppercase) errors.push('One uppercase letter');
  if (!hasLowercase) errors.push('One lowercase letter');
  if (!hasNumber) errors.push('One number');
  if (!hasSpecialChar) errors.push('One special character');

  return {
    isValid: errors.length === 0,
    errors
  };
};

export const validatePhone = (phone: string) => {
  const phoneRegex = /^\+?[1-9]\d{1,14}$/;
  return phoneRegex.test(phone);
};

export const validateName = (name: string) => {
  return name.length >= 2 && /^[a-zA-Z\s-]+$/.test(name);
};
