// ======== Form Types ========

import type { SubscriptionStatus, BillingCycle, SubscriptionDisplay } from './subscription.types';

export interface SubscriptionFormValues {
  name: string;
  description: string;
  amount: string;
  currency: string;
  billing_cycle: BillingCycle;
  start_date: string;
  category: string;
  color: string;
  status: SubscriptionStatus;
}

// Legacy form data interface for backward compatibility
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

// ======== Form Component Props ========

export interface AddSubscriptionFormProps {
  subscription?: SubscriptionDisplay;
  onSubmit: (data: SubscriptionFormValues) => void;
  onCancel: () => void;
}

export interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}

export interface RegisterFormProps {
  onSubmit: (email: string, password: string, name?: string) => Promise<void>;
  isLoading?: boolean;
  error?: string | null;
}