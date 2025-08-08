import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the auth token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Types for authentication
export interface RegisterRequest {
  email: string;
  password: string;
  name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

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

// Authentication API methods
export const authApi = {
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<{ success: boolean; data: User }>('/auth/register', data);
    return response.data.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<{ success: boolean; data: AuthResponse }>('/auth/login', data);
    const authData = response.data.data;

    // Store tokens
    localStorage.setItem('token', authData.token);
    localStorage.setItem('refresh_token', authData.refresh_token);

    return authData;
  },

  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<{ success: boolean; data: User }>('/users/me');
    return response.data.data;
  },
};

export default api;
