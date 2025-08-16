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

// ======== API Response Wrappers ========
import type { User, AuthResponse } from './user.types';
import type { Subscription, SubscriptionStats } from './subscription.types';

export type ApiUserResponse = ApiResponse<User>;
export type ApiAuthResponse = ApiResponse<AuthResponse>;
export type ApiSubscriptionResponse = ApiResponse<Subscription>;
export type ApiSubscriptionsResponse = { success: boolean; subscriptions: Subscription[] };
export type ApiStatsResponse = ApiResponse<SubscriptionStats>;