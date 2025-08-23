import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from './api';
import { getSecureToken, removeSecureToken } from './secure-storage';
import { ErrorHandler } from './error-handler';
import type { AuthContextType, User, ApiError } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getSecureToken('token');
        if (token) {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Clear invalid tokens
        removeSecureToken('token');
        removeSecureToken('refresh_token');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const clearError = () => setError(null);

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const authData = await authApi.login({ email, password });
      setUser(authData.user);
    } catch (err: any) {
      console.error('Login error details:', err);

      const apiError = ErrorHandler.extractError(err);
      setError(apiError);

      throw new Error(apiError.user_message);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, name?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      await authApi.register({ email, password, name });
    } catch (err: any) {
      console.error('Registration error details:', err);

      const apiError = ErrorHandler.extractError(err);
      setError(apiError);

      throw new Error(apiError.user_message);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, isLoading, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};
