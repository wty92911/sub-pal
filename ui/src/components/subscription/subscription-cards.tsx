import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { format } from 'date-fns';
import { Subscription } from './subscription-table';

interface SubscriptionCardsProps {
  subscriptions: Subscription[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}

export function SubscriptionCards({ subscriptions, onEdit, onDelete, onToggleStatus }: SubscriptionCardsProps) {
  const formatCurrency = (amount: number, currency?: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  };

  const formatBillingCycle = (billingCycle: string) => {
    if (billingCycle === 'weekly') return 'week';
    if (billingCycle === 'monthly') return 'month';
    if (billingCycle === 'quarterly') return 'quarter';
    if (billingCycle === 'yearly') return 'year';
    return billingCycle;
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
            <div className="flex items-center space-x-2">
              <Toggle
                checked={subscription.status === 'active'}
                onCheckedChange={() => onToggleStatus(subscription.id)}
                disabled={subscription.status === 'cancelled' || subscription.status === 'trial'}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div>
              <p className="text-gray-500">Price</p>
              <p className="font-medium">
                {formatCurrency(subscription.amount, subscription.currency)}/{formatBillingCycle(subscription.billingCycle)}
              </p>
            </div>
            <div>
              <p className="text-gray-500">Next Billing</p>
              <p className="font-medium">
                {format(new Date(subscription.nextBillingDate), 'MMM dd, yyyy')}
              </p>
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(subscription.id)}
              className="text-blue-600 hover:bg-blue-50"
            >
              <Edit className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(subscription.id)}
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
