import type { PropsWithChildren, FC } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRawInitData } from '@tma.js/sdk-react';
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

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Check for stored token
        const storedToken = apiClient.getToken();

        if (import.meta.env.DEV) {
          // In dev mode, show token modal if no token is stored
          if (!storedToken) {
            setShowTokenModal(true);
            setIsLoading(false);
            return;
          }
          // Token exists, allow access
          setIsLoading(false);
        } else {
          // In production, require authentication
          if (!storedToken) {
            setShowTokenModal(true);
            setIsLoading(false);
            return;
          }
          // Token exists, allow access
          setIsLoading(false);
        }
      } catch (error) {
        if (!import.meta.env.DEV) {
          setShowTokenModal(true);
        }
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const handleTokenSubmit = (token: string) => {
    apiClient.setToken(token);
    setShowTokenModal(false);
    setIsLoading(false);
  };

  const login = async (initData: string) => {
    setIsLoading(true);
    try {
      const authResponse = await authService.loginWithTelegram(initData);
      setUser(authResponse.user);
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

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
