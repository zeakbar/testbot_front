import type { AuthResponse, User, UserProfileResponse } from './types';
import { apiClient } from './client';

export class AuthService {
  /**
   * Login with Telegram init data
   * Frontend sends raw initData to backend for validation
   * Backend verifies the signature using bot token
   */
  public async loginWithTelegram(initData: string): Promise<AuthResponse> {
    if (!initData || typeof initData !== 'string') {
      throw new Error('Invalid initData: must be a non-empty string');
    }

    try {
      const response = await apiClient.post<AuthResponse>('/auth/login/', {
        init_data: initData,
      });

      if (response.access) {
        apiClient.setToken(response.access);
      }

      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout and clear stored token
   */
  public logout(): void {
    apiClient.clearToken();
  }

  /**
   * Get current user from token
   */
  public getCurrentUser(): User | null {
    const token = apiClient.getToken();
    if (!token) return null;

    try {
      const payload = this.parseJwt(token);
      return payload as unknown as User;
    } catch {
      return null;
    }
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return apiClient.isAuthenticated();
  }

  /**
   * Parse JWT token (without verification on frontend, backend verified it)
   */
  private parseJwt(token: string): Record<string, unknown> {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );

    return JSON.parse(jsonPayload);
  }

  /**
   * Refresh token (optional, for future use)
   */
  public async refreshToken(): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/refresh/', {});
    if (response.access) {
      apiClient.setToken(response.access);
    }
    return response;
  }

  /**
   * Get current user's full profile with stats
   */
  public async getCurrentUserProfile(): Promise<UserProfileResponse> {
    return apiClient.get<UserProfileResponse>('/users/me/');
  }
}

export const authService = new AuthService();
