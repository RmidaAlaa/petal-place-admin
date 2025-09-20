import { supabase } from '@/integrations/supabase/client';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'customer' | 'admin' | 'florist';
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  avatar_url?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role?: 'customer' | 'admin' | 'florist';
}

export interface PasswordResetData {
  email: string;
}

export interface PasswordUpdateData {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileUpdateData {
  first_name?: string;
  last_name?: string;
  phone?: string;
  avatar_url?: string;
}

class AuthService {
  private readonly STORAGE_KEYS = {
    ACCESS_TOKEN: 'access_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_DATA: 'user_data'
  };

  // Register new user
  async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
            role: data.role || 'customer'
          }
        }
      });

      if (error) throw error;

      if (!authData.user) {
        throw new Error('Registration failed');
      }

      // Create user profile in custom table
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: authData.user.id,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          role: data.role || 'customer',
          is_active: true,
          email_verified: false
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }

      const user: User = {
        id: authData.user.id,
        email: data.email,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        role: data.role || 'customer',
        is_active: true,
        email_verified: false,
        created_at: new Date().toISOString(),
        avatar_url: authData.user.user_metadata?.avatar_url
      };

      this.setTokens(authData.session?.access_token, authData.session?.refresh_token);
      this.setUserData(user);

      return {
        user,
        token: authData.session?.access_token || '',
        refresh_token: authData.session?.refresh_token || ''
      };
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  }

  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });

      if (error) throw error;

      if (!authData.user || !authData.session) {
        throw new Error('Login failed');
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (profileError) {
        throw new Error('Failed to fetch user profile');
      }

      const user: User = {
        id: profile.id,
        email: profile.email,
        first_name: profile.first_name,
        last_name: profile.last_name,
        phone: profile.phone,
        role: profile.role,
        is_active: profile.is_active,
        email_verified: profile.email_verified,
        created_at: profile.created_at,
        avatar_url: profile.avatar_url
      };

      this.setTokens(authData.session.access_token, authData.session.refresh_token);
      this.setUserData(user);

      return {
        user,
        token: authData.session.access_token,
        refresh_token: authData.session.refresh_token
      };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  }

  // Social login (Google, Facebook)
  async socialLogin(provider: 'google' | 'facebook'): Promise<void> {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Social login failed');
    }
  }

  // Logout user
  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      this.clearTokens();
      this.clearUserData();
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(data: PasswordResetData): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Password reset email failed');
    }
  }

  // Update password
  async updatePassword(data: PasswordUpdateData): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: data.newPassword
      });

      if (error) throw error;
    } catch (error: any) {
      throw new Error(error.message || 'Password update failed');
    }
  }

  // Update user profile
  async updateProfile(data: ProfileUpdateData): Promise<User> {
    try {
      const currentUser = this.getCurrentUser();
      if (!currentUser) throw new Error('User not authenticated');

      const { data: updatedProfile, error } = await supabase
        .from('user_profiles')
        .update(data)
        .eq('id', currentUser.id)
        .select()
        .single();

      if (error) throw error;

      const updatedUser: User = {
        ...currentUser,
        ...updatedProfile
      };

      this.setUserData(updatedUser);
      return updatedUser;
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  }

  // Get current user
  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(this.STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem(this.STORAGE_KEYS.ACCESS_TOKEN);
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  // Refresh access token
  async refreshToken(): Promise<string> {
    try {
      const refreshToken = localStorage.getItem(this.STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) throw new Error('No refresh token');

      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken
      });

      if (error) throw error;

      if (data.session?.access_token) {
        this.setTokens(data.session.access_token, data.session.refresh_token);
        return data.session.access_token;
      }

      throw new Error('Token refresh failed');
    } catch (error: any) {
      this.logout();
      throw new Error(error.message || 'Token refresh failed');
    }
  }

  // Verify email
  async verifyEmail(token: string): Promise<void> {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) throw error;

      // Update email verification status
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        const updatedUser = { ...currentUser, email_verified: true };
        this.setUserData(updatedUser);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Email verification failed');
    }
  }

  // Private helper methods
  private setTokens(accessToken?: string, refreshToken?: string): void {
    if (accessToken) {
      localStorage.setItem(this.STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    }
    if (refreshToken) {
      localStorage.setItem(this.STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    }
  }

  private setUserData(user: User): void {
    localStorage.setItem(this.STORAGE_KEYS.USER_DATA, JSON.stringify(user));
  }

  private clearTokens(): void {
    localStorage.removeItem(this.STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(this.STORAGE_KEYS.REFRESH_TOKEN);
  }

  private clearUserData(): void {
    localStorage.removeItem(this.STORAGE_KEYS.USER_DATA);
  }
}

export const authService = new AuthService();
