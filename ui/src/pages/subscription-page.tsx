import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "@/components/subscription/header";
import { Navigation } from "@/components/subscription/navigation";
import { StatsCards } from "@/components/subscription/stats-cards";
import { SubscriptionTable, Subscription } from "@/components/subscription/subscription-table";
import { SubscriptionCards } from "@/components/subscription/subscription-cards";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// Mock data for demonstration
const mockSubscriptions: Subscription[] = [
  {
    id: "1",
    name: "Netflix",
    amount: 15.99,
    currency: "USD",
    billingCycle: "monthly",
    nextBillingDate: new Date(2023, 5, 15),
    category: "Entertainment",
    status: "active",
    color: "#e50914",
  },
  {
    id: "2",
    name: "Spotify",
    amount: 9.99,
    currency: "USD",
    billingCycle: "monthly",
    nextBillingDate: new Date(2023, 5, 20),
    category: "Entertainment",
    status: "active",
    color: "#1db954",
  },
  {
    id: "3",
    name: "Adobe Creative Cloud",
    amount: 52.99,
    currency: "USD",
    billingCycle: "monthly",
    nextBillingDate: new Date(2023, 5, 5),
    category: "Software",
    status: "active",
    color: "#1d4ed8",
  },
  {
    id: "4",
    name: "Amazon Prime",
    amount: 139,
    currency: "USD",
    billingCycle: "yearly",
    nextBillingDate: new Date(2023, 11, 12),
    category: "Shopping",
    status: "active",
    color: "#f59e0b",
  },
  {
    id: "5",
    name: "Gym Membership",
    amount: 35,
    currency: "USD",
    billingCycle: "monthly",
    nextBillingDate: new Date(2023, 6, 1),
    category: "Health",
    status: "paused",
    color: "#8b5cf6",
  },
  {
    id: "6",
    name: "Disney+",
    amount: 7.99,
    currency: "USD",
    billingCycle: "monthly",
    nextBillingDate: new Date(2023, 5, 25),
    category: "Entertainment",
    status: "trial",
    color: "#ef4444",
  },
  {
    id: "7",
    name: "New York Times",
    amount: 4.99,
    currency: "USD",
    billingCycle: "monthly",
    nextBillingDate: new Date(2023, 6, 3),
    category: "News",
    status: "cancelled",
    color: "#1d4ed8",
  }
];

export function SubscriptionPage() {
  const navigate = useNavigate();
  const [subscriptions, setSubscriptions] = useState(mockSubscriptions);
  const [filterOpen, setFilterOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  // Handle filters
  const filteredSubscriptions = subscriptions.filter(sub => {
    if (statusFilter && sub.status !== statusFilter) return false;
    if (categoryFilter && sub.category !== categoryFilter) return false;
    return true;
  });

  // Get unique categories for filter
  const categories = [...new Set(subscriptions.map(sub => sub.category))];

  // Handlers
  const handleEdit = (id: string) => {
    navigate(`/subscriptions/edit/${id}`);
  };

  const handleDelete = (id: string) => {
    setSubscriptions(subscriptions.filter(sub => sub.id !== id));
  };

  const handleAddNew = () => {
    navigate('/subscriptions/new');
  };

  const handleToggleStatus = (id: string) => {
    setSubscriptions(subscriptions.map(sub =>
      sub.id === id
        ? { ...sub, status: sub.status === "active" ? "paused" : "active" }
        : sub
    ));
  };

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

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select
                value={statusFilter || ""}
                onValueChange={(value) => setStatusFilter(value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={categoryFilter || ""}
                onValueChange={(value) => setCategoryFilter(value || null)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category || ""}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setStatusFilter(null);
                  setCategoryFilter(null);
                }}
              >
                Reset
              </Button>
              <Button onClick={() => setFilterOpen(false)}>Apply</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
