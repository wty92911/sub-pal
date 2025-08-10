import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines class names with tailwind-merge for more reliable class combinations
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency value to a readable string
 */
export function formatCurrency(amount: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}

/**
 * Format date to a readable string
 */
export function formatDate(date: Date, format: "short" | "medium" | "long" = "medium"): string {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: format === "short" ? "short" : "long",
    day: "numeric",
  };

  if (format === "long") {
    options.weekday = "long";
  }

  return new Intl.DateTimeFormat("en-US", options).format(date);
}

/**
 * Calculate the monthly equivalent cost of a subscription based on its billing cycle
 */
export function calculateMonthlyEquivalent(
  amount: number,
  billingCycle: "daily" | "weekly" | "monthly" | "quarterly" | "yearly"
): number {
  switch (billingCycle) {
    case "daily":
      return amount * 30; // Average days in a month
    case "weekly":
      return amount * 4.33; // Average weeks in a month (52/12)
    case "monthly":
      return amount;
    case "quarterly":
      return amount / 3;
    case "yearly":
      return amount / 12;
    default:
      return amount;
  }
}

/**
 * Generate a random ID for temporary use
 */
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

/**
 * Group an array of objects by a specific key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((result, item) => {
    const groupKey = String(item[key]);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<string, T[]>);
}
