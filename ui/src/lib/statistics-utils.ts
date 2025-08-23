import { Subscription } from '@/types';

export interface CategoryData {
  name: string;
  value: number;
  count: number;
}

export interface MonthlyData {
  name: string;
  cost: number;
}

export interface TopSubscription {
  name: string;
  cost: number;
  category?: string;
}

export interface EnhancedStats {
  monthly: number;
  yearly: number;
  weekly: number;
  totalActive: number;
  averagePerSubscription: number;
  categoryCosts: CategoryData[];
  topSubscriptions: TopSubscription[];
  monthlyCosts: MonthlyData[];
  statusBreakdown: { status: string; count: number; cost: number }[];
}

/**
 * Calculate comprehensive statistics from subscription data
 */
export const calculateStatistics = (
  subscriptions: Subscription[],
  timeRange: "30days" | "90days" | "6months" | "1year" = "30days"
): EnhancedStats => {
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'Active');

  // Calculate costs normalized to monthly amounts
  const monthlyTotalCost = activeSubscriptions.reduce((total, sub) => {
    const monthlyAmount = normalizeToMonthly(sub.amount, sub.billing_cycle_days);
    return total + monthlyAmount;
  }, 0);

  // Calculate category breakdown
  const categoryMap = new Map<string, { total: number; count: number }>();
  activeSubscriptions.forEach(sub => {
    const category = sub.category || 'Uncategorized';
    const monthlyAmount = normalizeToMonthly(sub.amount, sub.billing_cycle_days);

    if (categoryMap.has(category)) {
      const existing = categoryMap.get(category)!;
      categoryMap.set(category, {
        total: existing.total + monthlyAmount,
        count: existing.count + 1
      });
    } else {
      categoryMap.set(category, { total: monthlyAmount, count: 1 });
    }
  });

  const categoryCosts: CategoryData[] = Array.from(categoryMap.entries()).map(([name, data]) => ({
    name,
    value: data.total,
    count: data.count
  })).sort((a, b) => b.value - a.value);

  // Calculate top subscriptions (by monthly cost)
  const topSubscriptions: TopSubscription[] = activeSubscriptions
    .map(sub => ({
      name: sub.name,
      cost: normalizeToMonthly(sub.amount, sub.billing_cycle_days),
      category: sub.category
    }))
    .sort((a, b) => b.cost - a.cost)
    .slice(0, 5);

  // Generate monthly trend data (for the last 12 months)
  const monthlyCosts = generateMonthlyTrendData(activeSubscriptions, timeRange);

  // Status breakdown
  const statusMap = new Map<string, { count: number; cost: number }>();
  subscriptions.forEach(sub => {
    const monthlyAmount = normalizeToMonthly(sub.amount, sub.billing_cycle_days);

    if (statusMap.has(sub.status)) {
      const existing = statusMap.get(sub.status)!;
      statusMap.set(sub.status, {
        count: existing.count + 1,
        cost: existing.cost + (sub.status === 'Active' ? monthlyAmount : 0)
      });
    } else {
      statusMap.set(sub.status, {
        count: 1,
        cost: sub.status === 'Active' ? monthlyAmount : 0
      });
    }
  });

  const statusBreakdown = Array.from(statusMap.entries()).map(([status, data]) => ({
    status,
    count: data.count,
    cost: data.cost
  }));

  return {
    monthly: monthlyTotalCost,
    yearly: monthlyTotalCost * 12,
    weekly: monthlyTotalCost / 4.33, // Average weeks per month
    totalActive: activeSubscriptions.length,
    averagePerSubscription: activeSubscriptions.length > 0 ? monthlyTotalCost / activeSubscriptions.length : 0,
    categoryCosts,
    topSubscriptions,
    monthlyCosts,
    statusBreakdown
  };
};

/**
 * Normalize subscription amount to monthly cost
 */
const normalizeToMonthly = (amount: number, billingCycleDays: number): number => {
  // Convert billing cycle to monthly equivalent
  const monthlyMultiplier = 30 / billingCycleDays;
  return amount * monthlyMultiplier;
};

/**
 * Generate monthly trend data based on time range
 */
const generateMonthlyTrendData = (
  subscriptions: Subscription[],
  timeRange: "30days" | "90days" | "6months" | "1year"
): MonthlyData[] => {
  const now = new Date();
  const months: MonthlyData[] = [];

  let monthsToShow: number;
  switch (timeRange) {
    case "30days":
      monthsToShow = 1;
      break;
    case "90days":
      monthsToShow = 3;
      break;
    case "6months":
      monthsToShow = 6;
      break;
    case "1year":
    default:
      monthsToShow = 12;
      break;
  }

  for (let i = monthsToShow - 1; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });

    // Calculate cost for subscriptions active during this month
    const monthCost = subscriptions.reduce((total, sub) => {
      const startDate = new Date(sub.start_date);
      const endDate = sub.end_date ? new Date(sub.end_date) : null;

      // Check if subscription was active during this month
      if (startDate <= date && (!endDate || endDate >= date) && sub.status === 'Active') {
        return total + normalizeToMonthly(sub.amount, sub.billing_cycle_days);
      }
      return total;
    }, 0);

    months.push({
      name: monthName,
      cost: monthCost
    });
  }

  return months;
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency === 'CNY' ? 'CNY' : 'USD'
  }).format(amount);
};

/**
 * Get percentage of total for a category
 */
export const getCategoryPercentage = (categoryValue: number, total: number): number => {
  return total > 0 ? (categoryValue / total) * 100 : 0;
};
