import { CreditCard, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import type { StatsCardsProps } from '@/types';

// Helper function to format large numbers
const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Helper function to format currency with appropriate scaling
const formatCurrency = (amount: number): string => {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(1)}K`;
  } else if (amount >= 100) {
    return `$${amount.toFixed(0)}`;
  } else {
    return `$${amount.toFixed(2)}`;
  }
};

// Helper function to get responsive text size based on content length
const getTextSizeClass = (text: string, isMobile: boolean = false): string => {
  const length = text.length;

  if (isMobile) {
    if (length <= 3) return 'text-xl font-bold';
    if (length <= 6) return 'text-lg font-semibold';
    if (length <= 8) return 'text-base font-semibold';
    return 'text-sm font-medium';
  }

  // Desktop/tablet sizing
  if (length <= 3) return 'text-3xl lg:text-4xl font-bold';
  if (length <= 6) return 'text-2xl lg:text-3xl font-bold';
  if (length <= 8) return 'text-xl lg:text-2xl font-semibold';
  if (length <= 12) return 'text-lg lg:text-xl font-semibold';
  return 'text-base lg:text-lg font-medium';
};

export function StatsCards({ subscriptions }: StatsCardsProps) {
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(sub => sub.status === "Active");

  const monthlyTotal = activeSubscriptions.reduce((total, sub) => {
    const monthlyAmount = sub.billingCycle === "monthly" ? Number(sub.amount) :
                         sub.billingCycle === "yearly" ? Number(sub.amount) / 12 :
                         sub.billingCycle === "weekly" ? Number(sub.amount) * 4.33 :
                         sub.billingCycle === "quarterly" ? Number(sub.amount) / 3 :
                         Number(sub.amount) * (30 / 30); // daily approximation
    return total + Number(monthlyAmount);
  }, Number(0));

  const yearlyTotal = monthlyTotal * 12;

  const expiringSoon = activeSubscriptions.filter(sub => {
    const nextBilling = new Date(sub.nextBillingDate);
    const today = new Date();
    const diffTime = nextBilling.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }).length;

  const stats = [
    {
      name: 'Total Subscriptions',
      value: formatNumber(totalSubscriptions),
      rawValue: totalSubscriptions,
      icon: CreditCard,
      color: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
    },
    {
      name: 'Monthly Cost',
      value: formatCurrency(monthlyTotal),
      rawValue: monthlyTotal,
      icon: DollarSign,
      color: 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400',
    },
    {
      name: 'Yearly Cost',
      value: formatCurrency(yearlyTotal),
      rawValue: yearlyTotal,
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400',
    },
    {
      name: 'Expiring Soon',
      value: formatNumber(expiringSoon),
      rawValue: expiringSoon,
      icon: AlertCircle,
      color: 'bg-orange-100 text-orange-600 dark:bg-orange-900/20 dark:text-orange-400',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 p-4 lg:p-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        const textSizeClass = getTextSizeClass(stat.value);
        const mobileTextSizeClass = getTextSizeClass(stat.value, true);

        // Create tooltip content with exact values
        const tooltipContent = stat.name.includes('Cost')
          ? `Exact: $${stat.rawValue.toFixed(2)}`
          : `Exact: ${stat.rawValue}`;

        return (
          <div
            key={stat.name}
            className="bg-card text-card-foreground rounded-lg shadow p-4 lg:p-6 border hover:shadow-md transition-shadow cursor-help group relative"
            title={tooltipContent}
          >
            <div className="flex flex-col lg:flex-row lg:items-center">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                    <Icon className="w-5 h-5 lg:w-6 lg:h-6" />
                  </div>
                </div>
                <div className="ml-3 lg:ml-4 min-w-0 flex-1">
                  <p className="text-xs lg:text-sm font-medium text-muted-foreground truncate">{stat.name}</p>
                  <div className="mt-1">
                    {/* Mobile text size */}
                    <p className={`lg:hidden ${mobileTextSizeClass} truncate`}>{stat.value}</p>
                    {/* Desktop text size */}
                    <p className={`hidden lg:block ${textSizeClass} truncate`}>{stat.value}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {tooltipContent}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900 dark:border-t-gray-700"></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
