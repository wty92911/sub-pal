import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/subscription/header";
import { Navigation } from "@/components/subscription/navigation";
import { AddSubscriptionForm } from "@/components/subscription/add-subscription-form";
import { Subscription } from "@/components/subscription/subscription-table";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

// Mock data - this would normally come from an API
const mockSubscriptions: Subscription[] = [
  {
    id: "1",
    name: "Netflix",
    amount: 15.99,
    billingCycle: "monthly",
    nextBillingDate: new Date(2023, 5, 15),
    category: "Entertainment",
    status: "active",
  },
  {
    id: "2",
    name: "Spotify",
    amount: 9.99,
    billingCycle: "monthly",
    nextBillingDate: new Date(2023, 5, 20),
    category: "Entertainment",
    status: "active",
  },
];

export function AddSubscriptionPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const isEditMode = Boolean(id);

  useEffect(() => {
    // Simulate API call to fetch subscription data if in edit mode
    if (isEditMode) {
      // Simulate API delay
      const timer = setTimeout(() => {
        const found = mockSubscriptions.find(sub => sub.id === id);
        setSubscription(found || null);
        setIsLoading(false);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setIsLoading(false);
    }
  }, [id, isEditMode]);

  const handleSubmit = async (data: any) => {
    // Simulate API call to save or update subscription
    console.log("Submitting subscription:", data);

    // Wait a bit to simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));

    // Redirect back to subscriptions page
    navigate("/dashboard");
  };

  const handleCancel = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold">Loading...</h1>
              <p className="text-muted-foreground">Please wait while we load your subscription details.</p>
            </div>
          </div>
        </main>
        <Navigation />
      </div>
    );
  }

  // If in edit mode but subscription not found
  if (isEditMode && !subscription) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold">Subscription Not Found</h1>
              <p className="text-muted-foreground">The subscription you're trying to edit doesn't exist.</p>
              <Button onClick={() => navigate("/dashboard")} className="mt-4">
                Back to Subscriptions
              </Button>
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

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="flex items-center gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">
              {isEditMode ? "Edit Subscription" : "Add Subscription"}
            </h1>
          </div>

          <div className="bg-card rounded-lg border shadow-sm p-6">
            <AddSubscriptionForm
              subscription={subscription || undefined}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
            />
          </div>
        </div>
      </main>

      <Navigation />
    </div>
  );
}
