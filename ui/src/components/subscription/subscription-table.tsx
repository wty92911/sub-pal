import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { format } from 'date-fns';

export interface Subscription {
  id: string;
  name: string;
  description?: string;
  amount: number;
  currency?: string;
  billingCycle: "monthly" | "yearly" | "quarterly" | "weekly" | "daily";
  nextBillingDate: Date;
  startDate?: Date;
  status: "active" | "paused" | "cancelled" | "trial";
  category?: string;
  color?: string;
}

interface SubscriptionTableProps {
  subscriptions: Subscription[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function SubscriptionTable({ subscriptions, onEdit, onDelete, onToggleStatus }: SubscriptionTableProps) {
  const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatBillingCycle = (billingCycle: string) => {
    if (billingCycle === 'weekly') return 'Weekly';
    if (billingCycle === 'monthly') return 'Monthly';
    if (billingCycle === 'quarterly') return 'Quarterly';
    if (billingCycle === 'yearly') return 'Yearly';
    return billingCycle;
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
                  {formatBillingCycle(subscription.billingCycle)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {subscription.startDate ? format(new Date(subscription.startDate), 'MMM dd, yyyy') : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {format(new Date(subscription.nextBillingDate), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Toggle
                  checked={subscription.status === 'active'}
                  onCheckedChange={() => onToggleStatus(subscription.id)}
                  disabled={subscription.status === 'cancelled' || subscription.status === 'trial'}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(subscription.id)}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(subscription.id)}
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
