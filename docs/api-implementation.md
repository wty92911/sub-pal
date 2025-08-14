# API Implementation Details

## Billing Cycle Conversion

The backend stores billing cycles as days (`billing_cycle_days`), while the frontend uses named cycles. This document explains how to handle the conversion between these two formats.

### Backend Storage

In the backend, subscription billing cycles are stored as integer values representing days:
- Weekly: 7 days
- Monthly: 30 days
- Quarterly: 90 days
- Yearly: 365 days
- Custom: Any other value

### Frontend Representation

In the frontend, billing cycles are represented as string values:
- `"weekly"`
- `"monthly"`
- `"quarterly"`
- `"yearly"`
- `"custom"` (for any non-standard cycle)

### Conversion Functions

#### Backend to Frontend Conversion

When receiving data from the backend, convert `billing_cycle_days` to a named cycle:

```typescript
// Convert billing cycle days to named cycle
const getBillingCycleFromDays = (days: number): "weekly" | "monthly" | "quarterly" | "yearly" | "daily" => {
  if (days === 7) return "weekly";
  if (days === 30) return "monthly";
  if (days === 90) return "quarterly";
  if (days === 365) return "yearly";
  return "custom"; // Default to custom for non-standard values
};
```

#### Frontend to Backend Conversion

When sending data to the backend, convert the named cycle to `billing_cycle_days`:

```typescript
// Convert billing cycle to days
const getBillingCycleDays = (billingCycle: string): number => {
  switch (billingCycle) {
    case "weekly": return 7;
    case "monthly": return 30;
    case "quarterly": return 90;
    case "yearly": return 365;
    default: return 30; // Default to monthly
  }
};
```

## Status Conversion

The backend uses Pascal case enum values (`Active`, `Paused`, `Cancelled`), while the frontend uses lowercase values.

### Backend to Frontend Conversion

```typescript
// Convert API status to component status
const mapStatus = (status: string): "Active" | "paused" | "cancelled" | "trial" => {
  switch (status) {
    case "Active": return "Active";
    case "Paused": return "paused";
    case "Cancelled": return "cancelled";
    default: return "Active";
  }
};
```

### Frontend to Backend Conversion

```typescript
// Convert component status to API status
const mapStatus = (status: string): "Active" | "Paused" | "Cancelled" => {
  switch (status) {
    case "Active": return "Active";
    case "paused": return "Paused";
    case "cancelled": return "Cancelled";
    default: return "Active";
  }
};
```

## Currency Conversion

The backend uses enum values (`Usd`, `Cny`), while the frontend uses standard currency codes.

### Backend to Frontend Conversion

```typescript
// Convert API currency to component currency
currency: apiSub.currency === "Usd" ? "USD" : "CNY",
```

### Frontend to Backend Conversion

```typescript
// Convert component currency to API currency
const mapCurrency = (currency: string): "Usd" | "Cny" => {
  return currency === "USD" ? "Usd" : "Cny";
};
```

## Implementation in Components

### In Subscription Page

```typescript
// Map API subscription to component subscription
const mapApiSubscriptionToComponent = (apiSub: ApiSubscription): Subscription => {
  // Convert API status to component status
  const mapStatus = (status: string): "Active" | "paused" | "cancelled" | "trial" => {
    switch (status) {
      case "Active": return "Active";
      case "Paused": return "paused";
      case "Cancelled": return "cancelled";
      default: return "Active";
    }
  };

  // Convert billing cycle days to named cycle
  const getBillingCycleFromDays = (days: number): "weekly" | "monthly" | "quarterly" | "yearly" | "daily" => {
    if (days === 7) return "weekly";
    if (days === 30) return "monthly";
    if (days === 90) return "quarterly";
    if (days === 365) return "yearly";
    return "monthly"; // Default to monthly
  };

  return {
    id: apiSub.id,
    name: apiSub.name,
    description: apiSub.description,
    amount: apiSub.amount,
    currency: apiSub.currency === "Usd" ? "USD" : "CNY",
    billingCycle: getBillingCycleFromDays(apiSub.billing_cycle_days),
    nextBillingDate: new Date(apiSub.next_billing_date),
    startDate: apiSub.start_date ? new Date(apiSub.start_date) : undefined,
    status: mapStatus(apiSub.status),
    category: apiSub.category || "Uncategorized",
    color: undefined, // API doesn't provide color, will use default
  };
};
```

### In Add/Edit Subscription Page

When submitting a form:

```typescript
const handleSubmit = async (formData: any) => {
  try {
    // Convert form data to API format
    const apiData = {
      name: formData.name,
      description: formData.description,
      amount: formData.amount,
      currency: formData.currency === "USD" ? "Usd" : "Cny" as 'Usd' | 'Cny',
      billing_cycle_days: getBillingCycleDays(formData.billingCycle),
      category: formData.category,
      status: formData.status === "Active" ? "Active" : formData.status === "paused" ? "Paused" : "Cancelled" as 'Active' | 'Paused' | 'Cancelled',
      start_date: formData.startDate?.toISOString().split('T')[0],
    };

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

// Helper function for converting billing cycle to days
const getBillingCycleDays = (billingCycle: string): number => {
  switch (billingCycle) {
    case "weekly": return 7;
    case "monthly": return 30;
    case "quarterly": return 90;
    case "yearly": return 365;
    default: return 30;
  }
};
```
