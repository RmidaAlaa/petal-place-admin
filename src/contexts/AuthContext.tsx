import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authService, User, LoginCredentials, RegisterData, PasswordResetData, PasswordUpdateData, ProfileUpdateData } from '../services/authService';
import { useEmail } from './EmailContext';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_FAILURE'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'UPDATE_USER'; payload: User };

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
};

interface AuthContextType {
  state: AuthState;
  currentUser: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  socialLogin: (provider: 'google' | 'facebook') => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (profileData: ProfileUpdateData) => Promise<void>;
  changePassword: (passwordData: PasswordUpdateData) => Promise<void>;
  sendPasswordResetEmail: (data: PasswordResetData) => Promise<void>;
  verifyEmail: (token: string) => Promise<void>;
  clearError: () => void;
  refreshToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);
  const emailContext = useEmail();

  useEffect(() => {
    const initAuth = async () => {
      try {
        dispatch({ type: 'AUTH_START' });
        
        if (authService.isAuthenticated()) {
          const user = authService.getCurrentUser();
          const token = authService.getAccessToken();
          
          if (user && token) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user, token },
            });
          } else {
            dispatch({ type: 'AUTH_FAILURE', payload: 'Session expired' });
          }
        } else {
          dispatch({ type: 'AUTH_FAILURE', payload: 'No active session' });
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        dispatch({ type: 'AUTH_FAILURE', payload: 'Session initialization failed' });
      }
    };

    initAuth();
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.login(credentials);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user, token: response.token },
      });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Login failed' });
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.register(userData);
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user: response.user, token: response.token },
      });
      
      // Send welcome email
      if (response.user) {
        await emailContext.sendWelcomeEmail({
          customerName: `${response.user.first_name} ${response.user.last_name}`,
          customerEmail: response.user.email,
          loginLink: `${window.location.origin}/profile`,
        });
      }
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Registration failed' });
      throw error;
    }
  };

  const socialLogin = async (provider: 'google' | 'facebook') => {
    try {
      dispatch({ type: 'AUTH_START' });
      await authService.socialLogin(provider);
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Social login failed' });
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      dispatch({ type: 'AUTH_LOGOUT' });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Logout failed' });
      throw error;
    }
  };

  const updateProfile = async (profileData: ProfileUpdateData) => {
    try {
      const updatedUser = await authService.updateProfile(profileData);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Profile update failed' });
      throw error;
    }
  };

  const changePassword = async (passwordData: PasswordUpdateData) => {
    try {
      await authService.updatePassword(passwordData);
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Password change failed' });
      throw error;
    }
  };

  const sendPasswordResetEmail = async (data: PasswordResetData) => {
    try {
      await authService.sendPasswordResetEmail(data);
      
      // Send password reset email
      // Only send the email after successful API call
      await emailContext.sendPasswordReset({
        customerName: data.email.split('@')[0], // Use first part of email as name
        customerEmail: data.email,
        resetLink: `${window.location.origin}/reset-password`,
        expiresIn: '24 hours',
      });
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Password reset email failed' });
      throw error;
    }
  };

  const verifyEmail = async (token: string) => {
    try {
      await authService.verifyEmail(token);
      const user = authService.getCurrentUser();
      if (user) {
        dispatch({ type: 'UPDATE_USER', payload: user });
      }
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Email verification failed' });
      throw error;
    }
  };

  const refreshToken = async () => {
    try {
      return await authService.refreshToken();
    } catch (error: any) {
      dispatch({ type: 'AUTH_FAILURE', payload: error.message || 'Token refresh failed' });
      throw error;
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const value: AuthContextType = {
    state,
    currentUser: state.user,
    login,
    register,
    socialLogin,
    logout,
    updateProfile,
    changePassword,
    sendPasswordResetEmail,
    verifyEmail,
    clearError,
    refreshToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
