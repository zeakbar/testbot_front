import type { PropsWithChildren, FC } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRawInitData, retrieveLaunchParams } from '@tma.js/sdk-react';
import { authService } from '@/api/auth';
import { apiClient } from '@/api/client';
import type { User } from '@/api/types';
import { Loading } from '@/components/Loading/Loading';
import { DevTokenModal } from '@/components/DevTokenModal/DevTokenModal';

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
  const [showTokenModal, setShowTokenModal] = useState(false);
  const initData = useRawInitData();

  const login = async (initDataString: string) => {
    setIsLoading(true);
    try {
      const authResponse = await authService.loginWithTelegram(initDataString);
      setUser(authResponse.user);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenSubmit = (token: string) => {
    apiClient.setToken(token);
    setShowTokenModal(false);
    setIsLoading(false);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        const storedToken = apiClient.getToken();
        const isDev = import.meta.env.VITE_DEV === 'true' || import.meta.env.VITE_DEV === true;

        // Try to get initData from hook or launch params
        let actualInitData = initData;
        if (!actualInitData) {
          try {
            const launchParams = retrieveLaunchParams();
            actualInitData = launchParams.initData;
          } catch {
            // Could not retrieve initData from launch params
          }
        }

        if (isDev) {
          // In debug mode, try to authenticate with initData if available
          if (actualInitData && typeof actualInitData === 'string') {
            try {
              await login(actualInitData);
              return;
            } catch (error) {
              // Fall back to token modal
              setShowTokenModal(true);
              setIsLoading(false);
              return;
            }
          }

          // No initData available, show token modal
          if (!storedToken) {
            setShowTokenModal(true);
            setIsLoading(false);
            return;
          }

          // Token exists, allow access
          setIsLoading(false);
        } else {
          // In production mode, require authentication via initData
          if (actualInitData && typeof actualInitData === 'string') {
            try {
              await login(actualInitData);
              return;
            } catch (error) {
              setShowTokenModal(true);
              setIsLoading(false);
              return;
            }
          }

          // Fallback to stored token
          if (!storedToken) {
            setShowTokenModal(true);
            setIsLoading(false);
            return;
          }

          // Token exists, allow access
          setIsLoading(false);
        }
      } catch (error) {
        setShowTokenModal(true);
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [initData]);

  const logout = () => {
    authService.logout();
    apiClient.clearToken();
    setUser(null);
    setShowTokenModal(true);
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

  if (showTokenModal) {
    return <DevTokenModal onSubmit={handleTokenSubmit} />;
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
