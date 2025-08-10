import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Subscription } from "./subscription-table";

const colorOptions = [
  { value: '#e50914', label: 'Red', class: 'bg-red-500' },
  { value: '#1db954', label: 'Green', class: 'bg-green-500' },
  { value: '#1d4ed8', label: 'Blue', class: 'bg-blue-500' },
  { value: '#f59e0b', label: 'Yellow', class: 'bg-yellow-500' },
  { value: '#8b5cf6', label: 'Purple', class: 'bg-purple-500' },
  { value: '#ef4444', label: 'Orange', class: 'bg-orange-500' },
];

interface SubscriptionFormValues {
  name: string;
  description: string;
  amount: string;
  currency: string;
  billing_cycle_days: string;
  start_date: string;
  category: string;
  color: string;
}

interface AddSubscriptionFormProps {
  subscription?: Subscription;
  onSubmit: (data: SubscriptionFormValues) => void;
  onCancel: () => void;
}

export function AddSubscriptionForm({ subscription, onSubmit, onCancel }: AddSubscriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SubscriptionFormValues>({
    name: subscription?.name || "",
    description: subscription?.description || "",
    amount: subscription?.amount?.toString() || "",
    currency: "USD",
    billing_cycle_days: "30",
    start_date: subscription?.nextBillingDate ? subscription.nextBillingDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    category: subscription?.category || "",
    color: "#1d4ed8",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SubscriptionFormValues, string>>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when field is changed
    if (errors[field as keyof SubscriptionFormValues]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof SubscriptionFormValues, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Amount must be positive";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Subscription Name */}
        <div className="md:col-span-2">
          <Label htmlFor="name">Subscription Name *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="e.g., Netflix, Spotify"
            required
            aria-invalid={!!errors.name}
          />
          {errors.name && (
            <p className="text-sm font-medium text-destructive mt-1">{errors.name}</p>
          )}
        </div>

        {/* Amount & Currency */}
        <div>
          <Label htmlFor="amount">Amount *</Label>
          <div className="flex">
            <Select
              value={formData.currency}
              onValueChange={(value) => handleInputChange('currency', value)}
            >
              <SelectTrigger className="w-20 rounded-r-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="GBP">GBP</SelectItem>
                <SelectItem value="CNY">CNY</SelectItem>
              </SelectContent>
            </Select>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => handleInputChange('amount', e.target.value)}
              placeholder="0.00"
              className="rounded-l-none border-l-0"
              required
              aria-invalid={!!errors.amount}
            />
          </div>
          {errors.amount && (
            <p className="text-sm font-medium text-destructive mt-1">{errors.amount}</p>
          )}
        </div>

        {/* Billing Cycle */}
        <div>
          <Label htmlFor="billing_cycle">Billing Cycle *</Label>
          <Select
            value={formData.billing_cycle_days}
            onValueChange={(value) => handleInputChange('billing_cycle_days', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Weekly (7 days)</SelectItem>
              <SelectItem value="30">Monthly (30 days)</SelectItem>
              <SelectItem value="90">Quarterly (90 days)</SelectItem>
              <SelectItem value="365">Yearly (365 days)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Start Date */}
        <div>
          <Label htmlFor="start_date">Start Date *</Label>
          <Input
            id="start_date"
            type="date"
            value={formData.start_date}
            onChange={(e) => handleInputChange('start_date', e.target.value)}
            required
          />
        </div>

        {/* Category */}
        <div>
          <Label htmlFor="category">Category</Label>
          <Select
            value={formData.category}
            onValueChange={(value) => handleInputChange('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Entertainment">Entertainment</SelectItem>
              <SelectItem value="Software">Software</SelectItem>
              <SelectItem value="News">News</SelectItem>
              <SelectItem value="Fitness">Fitness</SelectItem>
              <SelectItem value="Education">Education</SelectItem>
              <SelectItem value="Business">Business</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="Optional description..."
            rows={3}
          />
        </div>

        {/* Color Picker */}
        <div>
          <Label>Color</Label>
          <div className="flex space-x-2 mt-2">
            {colorOptions.map((color) => (
              <button
                key={color.value}
                type="button"
                onClick={() => handleInputChange('color', color.value)}
                className={`w-8 h-8 rounded-full border-2 ${
                  formData.color === color.value
                    ? 'border-gray-900'
                    : 'border-gray-300'
                } ${color.class} hover:border-gray-400 transition-colors`}
                title={color.label}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : subscription ? "Update Subscription" : "Save Subscription"}
        </Button>
      </div>
    </form>
  );
}
