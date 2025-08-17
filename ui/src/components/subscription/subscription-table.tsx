import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { format } from 'date-fns';
import type { SubscriptionTableProps } from '@/types';

export function SubscriptionTable({ subscriptions, onEdit, onDelete, onToggleStatus }: SubscriptionTableProps) {
  const formatCurrency = (amount: string, currency?: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(Number(amount));
  };

  const formatBillingCycle = (billingCycle: string) => {
    if (billingCycle === 'weekly') return 'Weekly';
    if (billingCycle === 'monthly') return 'Monthly';
    if (billingCycle === 'quarterly') return 'Quarterly';
    if (billingCycle === 'yearly') return 'Yearly';
    return billingCycle;
  };

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow overflow-hidden border">
      <table className="min-w-full divide-y divide-border">
        <thead className="bg-muted/50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Service
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Price/Cycle
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Start Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Next Billing
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Status
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-card divide-y divide-border">
          {subscriptions.map((subscription) => (
            <tr key={subscription.id} className="hover:bg-muted/30">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
                    style={{ backgroundColor: subscription.color || '#6b7280' }}
                  >
                    {subscription.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium">
                      {subscription.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {subscription.category}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium">
                  {formatCurrency(String(subscription.amount), subscription.currency)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formatBillingCycle(subscription.billingCycle)}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {subscription.startDate ? format(new Date(subscription.startDate), 'MMM dd, yyyy') : 'N/A'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm">
                {format(new Date(subscription.nextBillingDate), 'MMM dd, yyyy')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Toggle
                  checked={subscription.status === "Active"}
                  onCheckedChange={() => onToggleStatus(String(subscription.id))}
                  disabled={subscription.status === "Cancelled" || subscription.status === "Trial"}
                />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(String(subscription.id))}
                    className="text-primary hover:text-primary/80"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(String(subscription.id))}
                    className="text-destructive hover:text-destructive/80"
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
