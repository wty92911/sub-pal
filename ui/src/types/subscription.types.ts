// ======== Subscription Core Types ========

export type SubscriptionCurrency = 'Usd' | 'Cny' | 'USD' | 'CNY';
export type SubscriptionStatus = 'Active' | 'Paused' | 'Cancelled' | 'Trial';
export type BillingCycle = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

// ======== API Subscription Types ========

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

// ======== Frontend Subscription Types (for components) ========

export interface SubscriptionDisplay {
  id: string;
  name: string;
  description?: string;
  amount: string | number;
  currency: string;
  billingCycle: BillingCycle;
  nextBillingDate: Date;
  startDate?: Date;
  status: SubscriptionStatus;
  category?: string;
  color?: string;
}

// ======== Component Prop Types ========

export interface SubscriptionTableProps {
  subscriptions: SubscriptionDisplay[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export interface SubscriptionCardsProps {
  subscriptions: SubscriptionDisplay[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export interface StatsCardsProps {
  subscriptions: SubscriptionDisplay[];
}

export interface StatusBadgeProps {
  status: SubscriptionStatus;
}

// ======== Color Options ========

export interface ColorOption {
  value: string;
  label: string;
  class: string;
}

export const COLOR_OPTIONS: ColorOption[] = [
  { value: '#e50914', label: 'Red', class: 'bg-red-500' },
  { value: '#1db954', label: 'Green', class: 'bg-green-500' },
  { value: '#1d4ed8', label: 'Blue', class: 'bg-blue-500' },
  { value: '#f59e0b', label: 'Yellow', class: 'bg-yellow-500' },
  { value: '#8b5cf6', label: 'Purple', class: 'bg-purple-500' },
  { value: '#ef4444', label: 'Orange', class: 'bg-orange-500' },
];