import type { AuthResponse, User } from './types';
import { apiClient } from './client';

export class AuthService {
  /**
   * Login with Telegram init data
   * Frontend sends raw initData to backend for validation
   * Backend verifies the signature using bot token
   */
  public async loginWithTelegram(initData: string): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/auth/login/', {
      init_data: initData,
    });

    if (response.access_token) {
      apiClient.setToken(response.access_token);
    }

    return response;
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
      return payload as User;
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
    if (response.access_token) {
      apiClient.setToken(response.access_token);
    }
    return response;
  }
}

export const authService = new AuthService();
