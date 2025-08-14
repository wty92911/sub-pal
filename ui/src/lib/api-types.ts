// ======== API Response Types ========

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

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

// ======== Subscription Types ========

export type SubscriptionCurrency = 'Usd' | 'Cny';
export type SubscriptionStatus = 'Active' | 'Paused' | 'Cancelled';

export interface Subscription {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: SubscriptionCurrency;
  billing_cycle_days: number;
  category?: string;
  status: SubscriptionStatus;
  start_date: string;
  next_billing_date: string;
  end_date?: string;
  website?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  color?: string;
}

export interface CreateSubscriptionRequest {
  name: string;
  description?: string;
  amount: string; // Use string for BigDecimal safety
  currency: SubscriptionCurrency;
  billing_cycle_days: number;
  category?: string;
  status: SubscriptionStatus;
  start_date: string;
  color?: string;
  next_billing_date?: string;
  end_date?: string;
  website?: string;
  notes?: string;
}

export interface UpdateSubscriptionRequest extends Partial<CreateSubscriptionRequest> {
  id: string;
}

export interface SubscriptionStats {
  total_active: number;
  total_monthly: number;
  total_yearly: number;
  total_weekly: number;
  total_custom: number;
  monthly_cost: number;
  yearly_cost: number;
  weekly_cost: number;
  custom_cost: number;
}

// ======== Form Data Types ========

export interface SubscriptionFormData {
  name: string;
  description: string;
  amount: string;
  currency: string;
  billing_cycle_days: string;
  start_date: string;
  category: string;
  color: string;
}

// ======== Utility Types ========

export type ApiSubscriptionResponse = ApiResponse<Subscription>;
export type ApiSubscriptionsResponse = { success: boolean; subscriptions: Subscription[] };
export type ApiUserResponse = ApiResponse<User>;
export type ApiAuthResponse = ApiResponse<AuthResponse>;
export type ApiStatsResponse = ApiResponse<SubscriptionStats>;
