import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/subscription/header";
import { Navigation } from "@/components/subscription/navigation";
import { StatsCards } from "@/components/subscription/stats-cards";
import { SubscriptionTable } from "@/components/subscription/subscription-table";
import { SubscriptionCards } from "@/components/subscription/subscription-cards";
import { Button } from "@/components/ui/button";
import { Plus, BarChart3 } from "lucide-react";
import { subscriptionApi, subscriptionUtils } from "@/lib/api";
import type {
  SubscriptionCurrency,
  SubscriptionStatus,
  Subscription as ApiSubscription,
  SubscriptionDisplay,
  SubscriptionFormValues
} from "@/types";

// Use utility function for mapping API subscription to component format
const mapApiSubscriptionToComponent = (apiSub: ApiSubscription): SubscriptionDisplay => {
  return subscriptionUtils.apiToComponent(apiSub);
};


export function SubscriptionPage() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<SubscriptionDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load subscriptions on component mount
  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    try {
      setLoading(true);
      setError(null);
      const apiData = await subscriptionApi.getAll();
      console.log('loadSubscriptions, all data:', apiData);
      const mappedData = apiData.map(mapApiSubscriptionToComponent);
      setSubscriptions(mappedData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load subscriptions');
      console.error('Error loading subscriptions:', err);
    } finally {
      setLoading(false);
    }
  };


  // Handlers
  const handleEdit = (id: string) => {
    navigate(`/subscriptions/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    try {
      await subscriptionApi.delete(id);
      setSubscriptions(subscriptions.filter(sub => sub.id !== id));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete subscription');
      console.error('Error deleting subscription:', err);
    }
  };

  const handleAddNew = () => {
    navigate('/subscriptions/new');
  };

  const handleViewStatistics = () => {
    navigate('/statistics');
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const subscription = subscriptions.find(sub => sub.id === id);
      if (!subscription) return;

      // Convert component status to API status and create proper update request
      const newStatus = subscription.status === "Active" ? "Paused" : "Active";
      console.log("newStatus, subscription", newStatus, subscription);
      const formData = {
        name: subscription.name,
        description: subscription.description,
        amount: subscription.amount.toString(),
        currency: subscription.currency as SubscriptionCurrency,
        billing_cycle: subscription.billingCycle,
        category: subscription.category,
        status: newStatus as SubscriptionStatus,
        start_date: subscription.startDate?.toISOString().split('T')[0],
        color: subscription.color,
      } as SubscriptionFormValues;
      const updateData = subscriptionUtils.formDataToApi(formData);

      const updatedApiSubscription = await subscriptionApi.update(id, updateData);
      console.log("updatedApiSubscription", updatedApiSubscription);
      const updatedSubscription = mapApiSubscriptionToComponent(updatedApiSubscription);

      setSubscriptions(subscriptions.map(sub =>
        sub.id === id ? updatedSubscription : sub
      ));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update subscription status');
      console.error('Error updating subscription status:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-16">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading subscriptions...</p>
          </div>
        </main>
        <Navigation />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-16">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-destructive mb-4">{error}</p>
              <Button onClick={loadSubscriptions}>Retry</Button>
            </div>
          </div>
        </main>
        <Navigation />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 pb-16">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold tracking-tight">Subscriptions</h1>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleViewStatistics}
              className="flex items-center gap-1"
            >
              <BarChart3 className="h-4 w-4" />
              Statistics
            </Button>

            <Button onClick={handleAddNew}>
              <Plus className="mr-1 h-4 w-4" />
              Add New
            </Button>
          </div>
        </div>

        <StatsCards subscriptions={subscriptions} />

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <SubscriptionTable
            subscriptions={subscriptions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </div>

        {/* Mobile Cards View */}
        <div className="lg:hidden">
          <SubscriptionCards
            subscriptions={subscriptions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </main>

      <Navigation />
    </div>
  );
}
