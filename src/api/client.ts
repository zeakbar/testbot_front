const API_BASE_URL = import.meta.env.VITE_API_URL;

type OnTokenRecoveredCallback = () => void;

class ApiClient {
  private token: string | null = null;
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

  private getStoredToken(): string | null {
    try {
      return localStorage.getItem('access_token');
    } catch {
      return null;
    }
  }

  public setToken(token: string): void {
    this.token = token;
    try {
      localStorage.setItem('access_token', token);
    } catch {
      console.warn('Failed to store token in localStorage');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  public clearToken(): void {
    this.token = null;
    try {
      localStorage.removeItem('access_token');
    } catch {
      console.warn('Failed to clear token from localStorage');
    }
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
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.buildHeaders(),
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

      // Send login request with raw initData
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

      if (response.ok && data.access) {
        // New token acquired, update it
        this.setToken(data.access as string);
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
