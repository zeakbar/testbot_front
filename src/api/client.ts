const API_BASE_URL = import.meta.env.VITE_API_URL;

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = this.getStoredToken();
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
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.buildHeaders(),
        ...options,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      throw error;
    }
  }

  public async post<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: this.buildHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      throw error;
    }
  }

  public async put<T>(
    endpoint: string,
    body?: unknown,
    options?: RequestInit
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'PUT',
        headers: this.buildHeaders(),
        body: body ? JSON.stringify(body) : undefined,
        ...options,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      throw error;
    }
  }

  public async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.buildHeaders(),
        ...options,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
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
          this.clearToken();
          window.location.href = '/#/';
        }
        throw new Error(`HTTP ${response.status}`);
      }
      throw error;
    }

    if (!response.ok) {
      if (response.status === 401) {
        this.clearToken();
        window.location.href = '/#/';
      }
      throw new Error(
        typeof data === 'object' && data !== null && 'error' in data
          ? (data as { error: string }).error
          : `HTTP ${response.status}`
      );
    }

    return data as T;
  }
}

export const apiClient = new ApiClient();
