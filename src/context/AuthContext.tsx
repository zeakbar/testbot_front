import type { PropsWithChildren, FC } from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { useRawInitData } from '@tma.js/sdk-react';
import { authService } from '@/api/auth';
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

  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true);
      try {
        // Try to restore session from localStorage
        const storedUser = authService.getCurrentUser();
        if (storedUser) {
          setUser(storedUser);
          setIsLoading(false);
          return;
        }

        // If no stored session, attempt login with initData
        if (initData) {
          const authResponse = await authService.loginWithTelegram(
            initData.toString()
          );
          setUser(authResponse.user);
        }
      } catch (error) {
        console.error('Authentication failed:', error);
        // Continue without auth for now (development mode)
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, [initData]);

  const login = async (initData: string) => {
    setIsLoading(true);
    try {
      const authResponse = await authService.loginWithTelegram(initData);
      setUser(authResponse.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: authService.isAuthenticated(),
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
