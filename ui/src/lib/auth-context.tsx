import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi, User } from './api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

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
  const [error, setError] = useState<string | null>(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const userData = await authApi.getCurrentUser();
          setUser(userData);
        }
      } catch (err) {
        console.error('Auth check failed:', err);
        // Clear invalid tokens
        localStorage.removeItem('token');
        localStorage.removeItem('refresh_token');
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

      // Use the error message from the API interceptor if available
      let errorMessage = err.userMessage || 'Login failed. Please check your credentials.';

      // If no userMessage is set, try to extract from response
      if (!err.userMessage && err.response) {
        // Server responded with an error
        if (err.response.data) {
          if (typeof err.response.data === 'object') {
            // Handle the specific format: {"success":false,"error":{"code":"UNAUTHORIZED","message":"Invalid email or password"}}
            if (err.response.data.error && typeof err.response.data.error === 'object' && err.response.data.error.message) {
              errorMessage = err.response.data.error.message;
            } else if (err.response.data.error && typeof err.response.data.error === 'string') {
              errorMessage = err.response.data.error;
            } else if (err.response.data.message) {
              errorMessage = err.response.data.message;
            }
          } else if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          }
        } else if (err.response.status === 401) {
          errorMessage = 'Invalid email or password. Please try again.';
        } else if (err.response.status === 404) {
          errorMessage = 'Account not found. Please check your email address.';
        } else if (err.response.status === 400) {
          errorMessage = 'Invalid login information. Please check your email and password.';
        } else if (err.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }

      console.log('Setting error in auth context:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
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

      // Use the error message from the API interceptor if available
      let errorMessage = err.userMessage || 'Registration failed. Please try again.';

      // If no userMessage is set, try to extract from response
      if (!err.userMessage && err.response) {
        // Server responded with an error
        if (err.response.data) {
          if (typeof err.response.data === 'object') {
            // Handle the specific format: {"success":false,"error":{"code":"CONFLICT","message":"Email already exists"}}
            if (err.response.data.error && typeof err.response.data.error === 'object' && err.response.data.error.message) {
              errorMessage = err.response.data.error.message;
            } else if (err.response.data.error && typeof err.response.data.error === 'string') {
              errorMessage = err.response.data.error;
            } else if (err.response.data.message) {
              errorMessage = err.response.data.message;
            }
          } else if (typeof err.response.data === 'string') {
            errorMessage = err.response.data;
          }
        } else if (err.response.status === 409) {
          errorMessage = 'An account with this email already exists.';
        } else if (err.response.status === 400) {
          errorMessage = 'Invalid registration information. Please check your details.';
        } else if (err.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (err.request) {
        // Request was made but no response received
        errorMessage = 'Unable to connect to the server. Please check your internet connection.';
      }

      console.log('Setting error in auth context:', errorMessage);
      setError(errorMessage);
      throw new Error(errorMessage);
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
