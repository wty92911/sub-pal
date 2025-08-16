import axios, { AxiosInstance, AxiosResponse } from 'axios';
import type {
  User,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  Subscription,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  SubscriptionStats,
  SubscriptionStatus,
  ApiResponse,
  ApiSubscriptionsResponse,
  ApiUserResponse,
  ApiAuthResponse,
  ApiStatsResponse,
  SubscriptionFormValues,
  BillingCycle
} from '@/types';

// ======== API Configuration ========

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

// Create API instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ======== Interceptors ========

// Request interceptor: Add authentication token
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

// Response interceptor: Handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// ======== Utility Functions ========

// Generic response handler
const handleResponse = <T>(response: AxiosResponse): T => {
  if (response.data.data) {
    return response.data.data;
  }
  return response.data;
};

// ======== Authentication API Service ========

export const authApi = {
  /**
   * Register a new user
   * @param data Registration data
   * @returns Registered user information
   */
  register: async (data: RegisterRequest): Promise<User> => {
    const response = await api.post<ApiUserResponse>('/auth/register', data);
    return handleResponse<User>(response);
  },

  /**
   * Login user
   * @param data Login credentials
   * @returns Authentication response with tokens
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<ApiAuthResponse>('/auth/login', data);
    const authData = handleResponse<AuthResponse>(response);

    // Store tokens
    localStorage.setItem('token', authData.token);
    localStorage.setItem('refresh_token', authData.refresh_token);

    return authData;
  },

  /**
   * Logout user and clear tokens
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
  },

  /**
   * Get current authenticated user
   * @returns Current user information
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<ApiUserResponse>('/users/me');
    return handleResponse<User>(response);
  },
};

// ======== Subscription API Service ========

export const subscriptionApi = {
  /**
   * Get all subscriptions for the current user
   * @returns Array of subscriptions
   */
  getAll: async (): Promise<Subscription[]> => {
    const response = await api.get<ApiSubscriptionsResponse>('/subscriptions');
    return response.data.subscriptions;
  },

  /**
   * Get subscription by ID
   * @param id Subscription ID
   * @returns Subscription details
   */
  getById: async (id: string): Promise<Subscription> => {
    const response = await api.get<Subscription>(`/subscriptions/${id}`);
    return response.data;
  },

  /**
   * Create a new subscription
   * @param data Subscription data
   * @returns Created subscription
   */
  create: async (data: CreateSubscriptionRequest): Promise<Subscription> => {
    const response = await api.post<Subscription>('/subscriptions', data);
    return response.data;
  },

  /**
   * Update an existing subscription
   * @param id Subscription ID
   * @param data Updated subscription data
   * @returns Updated subscription
   */
  update: async (id: string, data: Partial<CreateSubscriptionRequest>): Promise<Subscription> => {
    console.log("update data", data);
    const response = await api.put<Subscription>(`/subscriptions/${id}`, data);
    return response.data;
  },

  /**
   * Delete a subscription
   * @param id Subscription ID
   */
  delete: async (id: string): Promise<void> => {
    await api.delete(`/subscriptions/${id}`);
  },

  /**
   * Get subscription statistics
   * @returns Subscription statistics
   */
  getStats: async (): Promise<SubscriptionStats> => {
    const response = await api.get<ApiStatsResponse>('/subscriptions/stats');
    return handleResponse<SubscriptionStats>(response);
  },
};

// ======== Data Transformation Utilities ========

const getBillingCycleDays = (billingCycle: BillingCycle): number => {
  switch (billingCycle) {
    case "daily": return 1;
    case "weekly": return 7;
    case "monthly": return 30;
    case "quarterly": return 90;
    case "yearly": return 365;
    default: return 30;
  }
};
export const subscriptionUtils = {
  /**
   * Convert form data to CreateSubscriptionRequest format
   * @param formData Form data from the UI
   * @returns CreateSubscriptionRequest data
   */
  formDataToApi: (formData: SubscriptionFormValues): CreateSubscriptionRequest => ({
    name: formData.name,
    description: formData.description || undefined,
    amount: String(formData.amount),
    currency: formData.currency === "USD" ? "Usd" : "Cny",
    billing_cycle_days: getBillingCycleDays(formData.billing_cycle),
    category: formData.category || undefined,
    status: formData.status as SubscriptionStatus | "Active",
    start_date: formData.start_date,
    color: formData.color || undefined,
  }),

  /**
   * Convert API subscription to component format
   * @param apiSubscription API subscription data
   * @returns Component subscription format
   */
  apiToComponent: (apiSubscription: Subscription): any => {

    const getBillingCycleFromDays = (days: number): BillingCycle => {
      if (days === 1) return "daily";
      if (days === 7) return "weekly";
      if (days === 30) return "monthly";
      if (days === 90) return "quarterly";
      if (days === 365) return "yearly";
      return "monthly";
    };

    return {
      id: apiSubscription.id,
      name: apiSubscription.name,
      description: apiSubscription.description,
      amount: apiSubscription.amount,
      currency: apiSubscription.currency === "Usd" ? "USD" : "CNY",
      billingCycle: getBillingCycleFromDays(apiSubscription.billing_cycle_days),
      nextBillingDate: new Date(apiSubscription.next_billing_date),
      startDate: apiSubscription.start_date ? new Date(apiSubscription.start_date) : undefined,
      status: apiSubscription.status,
      category: apiSubscription.category || "Uncategorized",
      color: apiSubscription.color,
    };
  },
};

// Export types for backward compatibility
export type {
  User,
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  Subscription,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  SubscriptionStats,
} from '@/types';

export default api;
