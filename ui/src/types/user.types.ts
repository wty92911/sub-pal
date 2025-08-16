// ======== User & Authentication Types ========

export interface User {
  id: string;
  email: string;
  name?: string;
  preferences?: Record<string, unknown>;
}

export interface AuthResponse {
  token: string;
  refresh_token: string;
  user: User;
}

export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

// ======== Auth Context Types ========

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}