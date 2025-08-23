import { useState, FormEvent } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type {
  SubscriptionFormValues,
  AddSubscriptionFormProps
} from '@/types';
import { COLOR_OPTIONS } from '@/types';

export function AddSubscriptionForm({ subscription, onSubmit, onCancel }: AddSubscriptionFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<SubscriptionFormValues>({
    name: subscription?.name || "",
    description: subscription?.description || "",
    amount: subscription?.amount?.toString() || "",
    currency: subscription?.currency || "USD",
    billing_cycle: subscription?.billingCycle || "monthly",
    start_date: subscription?.startDate?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0],
    category: subscription?.category || "",
    color: subscription?.color || "#1d4ed8",
    status: subscription?.status || "Active",
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
              onValueChange={(value: string) => handleInputChange('currency', value)}
            >
              <SelectTrigger className="w-20 rounded-r-none">
                <SelectValue />
              </SelectTrigger>
             <SelectContent>
               <SelectItem value="USD">USD</SelectItem>
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
            value={formData.billing_cycle}
            onValueChange={(value) => handleInputChange('billing_cycle', value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="weekly">Weekly (7 days)</SelectItem>
              <SelectItem value="monthly">Monthly (30 days)</SelectItem>
              <SelectItem value="quarterly">Quarterly (90 days)</SelectItem>
              <SelectItem value="yearly">Yearly (365 days)</SelectItem>
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
            onValueChange={(value: string) => handleInputChange('category', value)}
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
              <SelectItem value="Retail">Retail</SelectItem>
              <SelectItem value="Transportation">Transportation</SelectItem>
              <SelectItem value="Food">Food</SelectItem>
              <SelectItem value="Lifestyle">Lifestyle</SelectItem>
              <SelectItem value="Utilities">Utilities</SelectItem>
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
            {COLOR_OPTIONS.map((color) => (
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
          variant="secondary"
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
