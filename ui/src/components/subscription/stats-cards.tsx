import { CreditCard, DollarSign, Calendar, AlertCircle } from 'lucide-react';
import { Subscription } from './subscription-table';

interface StatsCardsProps {
  subscriptions: Subscription[];
}

export function StatsCards({ subscriptions }: StatsCardsProps) {
  const totalSubscriptions = subscriptions.length;
  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');

  const monthlyTotal = activeSubscriptions.reduce((total, sub) => {
    const monthlyAmount = sub.billingCycle === 'monthly' ? sub.amount :
                         sub.billingCycle === 'yearly' ? sub.amount / 12 :
                         sub.billingCycle === 'weekly' ? sub.amount * 4.33 :
                         sub.billingCycle === 'quarterly' ? sub.amount / 3 :
                         sub.amount * (30 / 30); // daily approximation
    return total + monthlyAmount;
  }, 0);

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
