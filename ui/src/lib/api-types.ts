// ======== DEPRECATED: Use @/types instead ========
// This file is kept for backward compatibility only.
// All new code should import from @/types

// Re-export all types from the new centralized location
export * from '@/types';

// Legacy exports for backward compatibility
export type {
  ApiResponse,
  ApiError,
  User,
  AuthResponse, 
  RegisterRequest,
  LoginRequest,
  Subscription,
  SubscriptionCurrency,
  SubscriptionStatus,
  CreateSubscriptionRequest,
  UpdateSubscriptionRequest,
  SubscriptionStats,
  SubscriptionFormData,
  ApiSubscriptionResponse,
  ApiSubscriptionsResponse,
  ApiUserResponse,
  ApiAuthResponse,
  ApiStatsResponse
} from '@/types';
