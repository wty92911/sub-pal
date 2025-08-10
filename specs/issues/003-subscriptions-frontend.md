# 003 - Subscriptions Frontend

## 1. Stats
```tsx
import { CreditCard, DollarSign, Calendar, AlertCircle } from 'lucide-react';

interface Subscription {
  id: string;
  name: string;
  amount: number;
  currency: string;
  billing_cycle_days: number;
  status: string;
  next_billing_date: string;
}

interface StatsCardsProps {
  subscriptions: Subscription[];
}

export default function StatsCards({ subscriptions }: StatsCardsProps) {
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');

  const monthlyTotal = activeSubscriptions.reduce((total, sub) => {
    const monthlyAmount = sub.billing_cycle_days === 30 ? sub.amount :
                         sub.billing_cycle_days === 365 ? sub.amount / 12 :
                         sub.billing_cycle_days === 7 ? sub.amount * 4.33 :
                         sub.amount * (30 / sub.billing_cycle_days);
    return total + monthlyAmount;
  }, 0);

  const yearlyTotal = monthlyTotal * 12;

  const expiringSoon = activeSubscriptions.filter(sub => {
    const nextBilling = new Date(sub.next_billing_date);
    const today = new Date();
    const diffTime = nextBilling.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  }).length;

  const stats = [
    {
      name: 'Total Subscriptions',
      value: totalSubscriptions.toString(),
      icon: CreditCard,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      name: 'Monthly Cost',
      value: `$${monthlyTotal.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-100 text-green-600',
    },
    {
      name: 'Yearly Cost',
      value: `$${yearlyTotal.toFixed(2)}`,
      icon: Calendar,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      name: 'Expiring Soon',
      value: expiringSoon.toString(),
      icon: AlertCircle,
      color: 'bg-orange-100 text-orange-600',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 p-4 lg:p-6">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div key={stat.name} className="bg-white rounded-lg shadow p-4 lg:p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${stat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">{stat.name}</p>
                <p className="text-xl lg:text-2xl font-semibold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
```

## 2. Cards
```tsx
import { Edit, Trash2, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';
import { format } from 'date-fns';

interface Subscription {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  billing_cycle_days: number;
  start_date: string;
  next_billing_date: string;
  status: string;
  category?: string;
  color?: string;
}

interface SubscriptionCardsProps {
  subscriptions: Subscription[];
}

export default function SubscriptionCards({ subscriptions }: SubscriptionCardsProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatBillingCycle = (days: number) => {
    if (days === 7) return 'week';
    if (days === 30) return 'month';
    if (days === 90) return 'quarter';
    if (days === 365) return 'year';
    return `${days} days`;
  };

  const handleEdit = (id: string) => {
    console.log('Edit subscription:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete subscription:', id);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    console.log('Toggle status:', id, currentStatus);
  };

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <div key={subscription.id} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                style={{ backgroundColor: subscription.color || '#6b7280' }}
              >
                {subscription.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{subscription.name}</h3>
                <p className="text-sm text-gray-500">{subscription.category}</p>
              </div>
            </div>
            <StatusBadge status={subscription.status} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-gray-500">Price</p>
              <p className="font-medium">
                {formatCurrency(subscription.amount, subscription.currency)}/{formatBillingCycle(subscription.billing_cycle_days)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Next Billing</p>
              <p className="font-medium">
                {format(new Date(subscription.next_billing_date), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEdit(subscription.id)}
              className="text-blue-600 hover:bg-blue-50"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleToggleStatus(subscription.id, subscription.status)}
              className="text-yellow-600 hover:bg-yellow-50"
            >
              {subscription.status === 'active' ? (
                <>
                  <Pause className="w-4 h-4 mr-1" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-1" />
                  Resume
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(subscription.id)}
              className="text-red-600 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
```

## 3. Table
```tsx
import { Edit, Trash2, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import StatusBadge from './StatusBadge';
import { format } from 'date-fns';

interface Subscription {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  billing_cycle_days: number;
  start_date: string;
  next_billing_date: string;
  status: string;
  category?: string;
  color?: string;
}

interface SubscriptionTableProps {
  subscriptions: Subscription[];
}

export default function SubscriptionTable({ subscriptions }: SubscriptionTableProps) {
  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const formatBillingCycle = (days: number) => {
    if (days === 7) return 'Weekly';
    if (days === 30) return 'Monthly';
    if (days === 90) return 'Quarterly';
    if (days === 365) return 'Yearly';
    return `${days} days`;
  };

  const handleEdit = (id: string) => {
    console.log('Edit subscription:', id);
  };

  const handleDelete = (id: string) => {
    console.log('Delete subscription:', id);
  };

  const handleToggleStatus = (id: string, currentStatus: string) => {
    console.log('Toggle status:', id, currentStatus);
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Service
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Price/Cycle
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Start Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Next Billing
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {subscriptions.map((subscription) => (
            <tr key={subscription.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: subscription.color || '#6b7280' }}
                  >
                    {subscription.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {subscription.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {subscription.category}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {formatCurrency(subscription.amount, subscription.currency)}
                </div>
                <div className="text-sm text-gray-500">
                  {formatBillingCycle(subscription.billing_cycle_days)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(subscription.start_date), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(subscription.next_billing_date), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <StatusBadge status={subscription.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(subscription.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleToggleStatus(subscription.id, subscription.status)}
                    className="text-yellow-600 hover:text-yellow-900"
                  >
                    {subscription.status === 'active' ? (
                      <Pause className="w-4 h-4" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(subscription.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```
