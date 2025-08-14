import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/subscription/header";
import { Navigation } from "@/components/subscription/navigation";
import { StatsCards } from "@/components/subscription/stats-cards";
import { SubscriptionTable, Subscription } from "@/components/subscription/subscription-table";
import { SubscriptionCards } from "@/components/subscription/subscription-cards";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Plus } from "lucide-react";
import { subscriptionApi, Subscription as ApiSubscription, subscriptionUtils } from "@/lib/api";
import type { CreateSubscriptionRequest, SubscriptionCurrency, SubscriptionStatus } from "@/lib/api-types";
import { SubscriptionFormValues } from "@/components/subscription/add-subscription-form";

// Use utility function for mapping API subscription to component format
const mapApiSubscriptionToComponent = (apiSub: ApiSubscription): Subscription => {
  return subscriptionUtils.apiToComponent(apiSub);
};

const getBillingCycleDays = (billingCycle: string): number => {
  switch (billingCycle) {
    case "weekly": return 7;
    case "monthly": return 30;
    case "quarterly": return 90;
    case "yearly": return 365;
    default: return 30;
  }
};

export function SubscriptionPage() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

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

  // Handle filters
  const filteredSubscriptions = subscriptions.filter(sub => {
    if (statusFilter && sub.status !== statusFilter) return false;
    if (categoryFilter && sub.category !== categoryFilter) return false;
    return true;
  });

  // Get unique categories for filter
  const categories = [...new Set(subscriptions.map(sub => sub.category))].filter(Boolean) as string[];

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
              <p className="text-red-600 mb-4">{error}</p>
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
              onClick={() => setFilterOpen(true)}
              className="flex items-center gap-1"
            >
              <Filter className="h-4 w-4" />
              Filter
            </Button>

            <Button onClick={handleAddNew}>
              <Plus className="mr-1 h-4 w-4" />
              Add New
            </Button>
          </div>
        </div>

        <StatsCards subscriptions={filteredSubscriptions} />

        {/* Desktop Table View */}
        <div className="hidden lg:block">
          <SubscriptionTable
            subscriptions={filteredSubscriptions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </div>

        {/* Mobile Cards View */}
        <div className="lg:hidden">
          <SubscriptionCards
            subscriptions={filteredSubscriptions}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onToggleStatus={handleToggleStatus}
          />
        </div>
      </main>

      <Navigation />

      {/* Filter Dialog */}
      <Dialog open={filterOpen} onOpenChange={setFilterOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Filter Subscriptions</DialogTitle>
            <DialogDescription>
              Filter your subscriptions by status and category.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter || ""} onValueChange={(value) => setStatusFilter(value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                  <SelectItem value="Trial">Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select value={categoryFilter || ""} onValueChange={(value) => setCategoryFilter(value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="All categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter(null);
                  setCategoryFilter(null);
                }}
              >
                Clear Filters
              </Button>
              <Button onClick={() => setFilterOpen(false)}>Apply</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
