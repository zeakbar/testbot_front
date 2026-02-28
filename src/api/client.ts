const API_BASE_URL = import.meta.env.VITE_API_URL;

type OnTokenRecoveredCallback = () => void;

class ApiClient {
  private token: string | null = null;
  private currentUserId: number | null = null;
  private initData: string | null = null;
  private isRefreshing = false;
  private refreshQueue: Array<(value?: void) => void> = [];
  private onTokenRecovered: OnTokenRecoveredCallback | null = null;

  constructor() {
    this.token = this.getStoredToken();
  }

  public setInitData(initData: string | null): void {
    this.initData = initData;
  }

  public setOnTokenRecovered(callback: OnTokenRecoveredCallback): void {
    this.onTokenRecovered = callback;
  }

  /**
   * Extract user_id from JWT token payload
   */
  private extractUserIdFromToken(token: string): number | null {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const payload = JSON.parse(jsonPayload) as Record<string, unknown>;
      return typeof payload.user_id === 'number' ? payload.user_id : null;
    } catch {
      return null;
    }
  }

  /**
   * Get storage key for user's token
   */
  private getTokenStorageKey(userId: number): string {
    return `access_token_${userId}`;
  }

  /**
   * Get stored token for a specific user
   */
  private getStoredToken(): string | null {
    try {
      // If we have currentUserId, use it to get the token
      if (this.currentUserId) {
        const key = this.getTokenStorageKey(this.currentUserId);
        return localStorage.getItem(key);
      }

      // Otherwise, try to migrate old single-token format if it exists
      const oldToken = localStorage.getItem('access_token');
      if (oldToken) {
        const userId = this.extractUserIdFromToken(oldToken);
        if (userId) {
          this.currentUserId = userId;
          const key = this.getTokenStorageKey(userId);
          localStorage.setItem(key, oldToken);
          localStorage.removeItem('access_token');
          return oldToken;
        }
      }

      return null;
    } catch {
      return null;
    }
  }

  public setToken(token: string): void {
    this.token = token;

    // Extract user_id from token to use as storage key
    const userId = this.extractUserIdFromToken(token);
    if (!userId) {
      console.warn('Could not extract user_id from token');
      return;
    }

    this.currentUserId = userId;

    try {
      const key = this.getTokenStorageKey(userId);
      localStorage.setItem(key, token);

      // Clean up old single-key format if it exists
      try {
        localStorage.removeItem('access_token');
      } catch {
        // Ignore cleanup errors
      }
    } catch {
      console.warn('Failed to store token in localStorage');
    }
  }

  public setCurrentUserId(userId: number): void {
    this.currentUserId = userId;
    // Try to load token for this user
    this.token = this.getStoredToken();
  }

  public getCurrentUserId(): number | null {
    return this.currentUserId;
  }

  public getToken(): string | null {
    return this.token;
  }

  public clearToken(): void {
    this.token = null;

    try {
      // Clear token for current user
      if (this.currentUserId) {
        const key = this.getTokenStorageKey(this.currentUserId);
        localStorage.removeItem(key);
      } else {
        // Fallback: also try to remove old single-key format
        localStorage.removeItem('access_token');
      }
    } catch {
      console.warn('Failed to clear token from localStorage');
    }

    this.currentUserId = null;
  }

  public isAuthenticated(): boolean {
    return !!this.token;
  }

  private buildHeaders(contentType = 'application/json'): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': contentType,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  public async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.requestWithRetry(async () => {
      // Handle full URLs directly (from pagination next/previous)
      let url: string;
      if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
        // Convert HTTP to HTTPS to avoid mixed content issues
        url = endpoint.replace(/^http:/, 'https:');
      } else {
        url = `${API_BASE_URL}${endpoint}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: this.buildHeaders(),
        credentials: 'include',
        ...options,
      });

      return this.handleResponse<T>(response);
    });
  }

  public async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.requestWithRetry(async () => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.buildHeaders(),
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      });

      return this.handleResponse<T>(response);
    });
  }

  public async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.requestWithRetry(async () => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.buildHeaders(),
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      });

      return this.handleResponse<T>(response);
    });
  }

  public async patch<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.requestWithRetry(async () => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PATCH',
        headers: this.buildHeaders(),
        credentials: 'include',
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      });

      return this.handleResponse<T>(response);
    });
  }

  public async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.requestWithRetry(async () => {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.buildHeaders(),
        credentials: 'include',
        ...options,
      });

      return this.handleResponse<T>(response);
    });
  }

  private async requestWithRetry<T>(
    request: () => Promise<T>
  ): Promise<T> {
    try {
      return await request();
    } catch (error) {
      // If we're refreshing, wait for it to complete
      if (this.isRefreshing) {
        await new Promise((resolve) => {
          this.refreshQueue.push(resolve);
        });
        // Retry the request after refresh
        try {
          return await request();
        } catch (retryError) {
          throw retryError;
        }
      }
      throw error;
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    let data: unknown;

    try {
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
    } catch (error) {
      if (!response.ok) {
        if (response.status === 401) {
          await this.handleTokenExpired();
        }
        throw new Error(`HTTP ${response.status}`);
      }
      throw error;
    }

    if (!response.ok) {
      if (response.status === 401) {
        await this.handleTokenExpired();
      }
      throw new Error(
        typeof data === 'object' && data !== null && 'error' in data
          ? (data as { error: string }).error
          : `HTTP ${response.status}`
      );
    }

    return data as T;
  }

  private async handleTokenExpired(): Promise<void> {
    if (this.isRefreshing) {
      // Already refreshing, wait for it
      return;
    }

    this.isRefreshing = true;

    try {
      if (!this.initData) {
        this.clearToken();
        window.location.href = '/#/';
        return;
      }

      // Send login request with raw initData to get new token
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          init_data: this.initData,
        }),
      });

      const data = await response.json() as Record<string, unknown>;

      if (response.ok && typeof data.access === 'string') {
        // New token acquired, update it with user_id based storage
        this.setToken(data.access);
        // Notify that token was recovered
        if (this.onTokenRecovered) {
          this.onTokenRecovered();
        }
        // Execute all queued requests
        this.refreshQueue.forEach((resolve) => resolve());
      } else {
        // Login failed, clear token and redirect
        this.clearToken();
        window.location.href = '/#/';
      }
    } catch (error) {
      this.clearToken();
      window.location.href = '/#/';
    } finally {
      this.refreshQueue = [];
      this.isRefreshing = false;
    }
  }
}

export const apiClient = new ApiClient();
