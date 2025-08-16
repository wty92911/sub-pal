import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "@/components/subscription/header";
import { Navigation } from "@/components/subscription/navigation";
import { AddSubscriptionForm } from "@/components/subscription/add-subscription-form";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { subscriptionApi, subscriptionUtils } from "@/lib/api";
import type { 
  SubscriptionDisplay, 
  Subscription as ApiSubscription,
  SubscriptionFormValues 
} from "@/types";

// Use utility function for mapping API subscription to component format
const mapApiSubscriptionToComponent = (apiSub: ApiSubscription): SubscriptionDisplay => {
  return subscriptionUtils.apiToComponent(apiSub);
};


export function AddSubscriptionPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [subscription, setSubscription] = useState<SubscriptionDisplay | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isEditMode = Boolean(id);
  useEffect(() => {
    const loadSubscription = async () => {
      if (isEditMode && id) {
        try {
          setIsLoading(true);
          setError(null);
          const apiSubscription = await subscriptionApi.getById(id);
          const componentSubscription = mapApiSubscriptionToComponent(apiSubscription);
          setSubscription(componentSubscription);
        } catch (err: any) {
          setError(err.response?.data?.message || 'Failed to load subscription');
          console.error('Error loading subscription:', err);
        } finally {
          setIsLoading(false);
        }
      } else {
        setIsLoading(false);
      }
    };

    loadSubscription();
  }, [id, isEditMode]);

  const handleSubmit = async (formData: SubscriptionFormValues) => {
    try {
      // Convert form data to structured API format using utility
      const apiData = subscriptionUtils.formDataToApi(formData);

      if (isEditMode && id) {
        await subscriptionApi.update(id, apiData);
      } else {
        await subscriptionApi.create(apiData);
      }
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save subscription');
      console.error('Error saving subscription:', err);
    }
  };

  // (removed) legacy helper left intentionally blank; using form's billing_cycle_days directly

  const handleCancel = () => {
    navigate(-1);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-1 items-center justify-center py-10 pb-20 lg:pb-10">
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
        <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-1 items-center justify-center py-10 pb-20 lg:pb-10">
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

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 lg:pb-6">
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
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

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
