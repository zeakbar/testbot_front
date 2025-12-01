import type { PropsWithChildren, FC } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRawInitData, retrieveLaunchParams } from '@tma.js/sdk-react';
import { authService } from '@/api/auth';
import { apiClient } from '@/api/client';
import type { User } from '@/api/types';
import { Loading } from '@/components/Loading/Loading';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (initData: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: FC<PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const initData = useRawInitData();

  const login = async (initDataString: string) => {
    setIsLoading(true);
    try {
      const authResponse = await authService.loginWithTelegram(initDataString);
      setUser(authResponse.user);
      // Ensure API client has the correct user_id for token storage
      apiClient.setCurrentUserId(authResponse.user.user_id);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Try to get initData from hook or launch params
        let actualInitData = initData;
        if (!actualInitData) {
          try {
            const launchParams = retrieveLaunchParams();
            if (typeof launchParams.initData === 'string') {
              actualInitData = launchParams.initData;
            }
          } catch {
            // Could not retrieve initData from launch params
          }
        }

        // Store initData in API client for seamless 401 recovery
        if (actualInitData && typeof actualInitData === 'string') {
          apiClient.setInitData(actualInitData);

          // Extract user_id from initData to load correct token for this user
          try {
            const initDataObj = parseInitData(actualInitData);
            if (initDataObj?.id) {
              apiClient.setCurrentUserId(initDataObj.id);
            }
          } catch {
            // Could not parse initData, continue anyway
          }
        }

        // When token is recovered from 401, allow app to continue
        apiClient.setOnTokenRecovered(() => {
          setIsLoading(false);
        });

        const storedToken = apiClient.getToken();

        // Try to authenticate with initData
        if (actualInitData && typeof actualInitData === 'string') {
          try {
            await login(actualInitData);
            return;
          } catch (error) {
            // If login failed, can't proceed without valid initData
            setIsLoading(false);
            return;
          }
        }

        // If we have a stored token for current user, allow access
        if (storedToken) {
          setIsLoading(false);
          return;
        }

        // No initData and no stored token - cannot proceed
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [initData]);

  /**
   * Parse initData to extract user information
   */
  const parseInitData = (
    initDataStr: string
  ): { id?: number; [key: string]: unknown } | null => {
    try {
      const params = new URLSearchParams(initDataStr);
      const userParam = params.get('user');
      if (userParam) {
        return JSON.parse(userParam) as { id?: number; [key: string]: unknown };
      }
      return null;
    } catch {
      return null;
    }
  };

  const logout = () => {
    authService.logout();
    apiClient.clearToken();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: apiClient.isAuthenticated(),
    login,
    logout,
  };

  if (isLoading) {
    return <Loading message="Ilovani yuklanmoqda..." />;
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
