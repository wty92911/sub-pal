import React, { useMemo, useCallback } from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Toggle } from '@/components/ui/toggle';
import { format } from 'date-fns';
import type { SubscriptionCardsProps } from '@/types';

// Memoized formatter functions
const formatCurrency = (amount: string, currency?: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD',
  }).format(Number(amount));
};

const formatBillingCycle = (billingCycle: string) => {
  if (billingCycle === 'weekly') return 'week';
  if (billingCycle === 'monthly') return 'month';
  if (billingCycle === 'quarterly') return 'quarter';
  if (billingCycle === 'yearly') return 'year';
  return billingCycle;
};

// Individual subscription card component for better memoization
const SubscriptionCard = React.memo(({
  subscription,
  onEdit,
  onDelete,
  onToggleStatus
}: {
  subscription: any;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string) => void;
}) => {
  const handleEdit = useCallback(() => {
    onEdit(String(subscription.id));
  }, [onEdit, subscription.id]);

  const handleDelete = useCallback(() => {
    onDelete(String(subscription.id));
  }, [onDelete, subscription.id]);

  const handleToggleStatus = useCallback(() => {
    onToggleStatus(String(subscription.id));
  }, [onToggleStatus, subscription.id]);

  const formattedPrice = useMemo(() =>
    formatCurrency(String(subscription.amount), subscription.currency),
    [subscription.amount, subscription.currency]
  );

  const formattedCycle = useMemo(() =>
    formatBillingCycle(subscription.billingCycle),
    [subscription.billingCycle]
  );

  const formattedDate = useMemo(() =>
    format(new Date(subscription.nextBillingDate), 'MMM dd, yyyy'),
    [subscription.nextBillingDate]
  );

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow p-4 border">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold"
            style={{ backgroundColor: subscription.color || '#6b7280' }}
          >
            {subscription.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="font-medium">{subscription.name}</h3>
            <p className="text-sm text-muted-foreground">{subscription.category}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Toggle
            checked={subscription.status === "Active"}
            onCheckedChange={handleToggleStatus}
            disabled={subscription.status === "Cancelled" || subscription.status === "Trial"}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mb-4">
        <div>
          <p className="text-muted-foreground">Price</p>
          <p className="font-medium">
            {formattedPrice}/{formattedCycle}
          </p>
        </div>
        <div>
          <p className="text-muted-foreground">Next Billing</p>
          <p className="font-medium">
            {formattedDate}
          </p>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEdit}
          className="text-primary hover:bg-accent"
        >
          <Edit className="w-4 h-4 mr-1" />
          Edit
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          className="text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="w-4 h-4 mr-1" />
          Delete
        </Button>
      </div>
    </div>
  );
});

SubscriptionCard.displayName = 'SubscriptionCard';

export function SubscriptionCards({ subscriptions, onEdit, onDelete, onToggleStatus }: SubscriptionCardsProps) {

  return (
    <div className="space-y-4">
      {subscriptions.map((subscription) => (
        <SubscriptionCard
          key={subscription.id}
          subscription={subscription}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleStatus={onToggleStatus}
        />
      ))}
    </div>
  );
}
