use bigdecimal::BigDecimal;
use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use std::str::FromStr;
use uuid::Uuid;
/// Subscription model representing a subscription in the system
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Subscription {
    #[serde(skip_deserializing)]
    pub id: Uuid,

    // user_id is reset by current user
    #[serde(skip_deserializing)]
    pub user_id: Uuid,

    pub name: String,
    pub description: Option<String>,
    pub amount: BigDecimal,
    #[sqlx(try_from = "String")]
    pub currency: Currency,
    pub billing_cycle_days: i32,
    pub start_date: NaiveDate,

    // calculate from start_date and billing_cycle_days
    #[serde(skip_deserializing)]
    pub next_billing_date: NaiveDate,

    #[sqlx(try_from = "String")]
    pub status: SubscriptionStatus,
    pub category: Option<String>,
    pub color: Option<String>,

    #[serde(skip_serializing_if = "Option::is_none")]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub updated_at: Option<DateTime<Utc>>,
}

/// Subscription list response DTO with additional metrics
#[derive(Debug, Serialize)]
pub struct SubscriptionListResponse {
    pub subscriptions: Vec<Subscription>,
}

/// Represents the status of a subscription
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum SubscriptionStatus {
    Active,
    Paused,
    Cancelled,
}

impl SubscriptionStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            SubscriptionStatus::Active => "Active",
            SubscriptionStatus::Paused => "paused",
            SubscriptionStatus::Cancelled => "cancelled",
        }
    }
}

impl Default for SubscriptionStatus {
    fn default() -> Self {
        Self::Active
    }
}

impl FromStr for SubscriptionStatus {
    type Err = String;

    fn from_str(status: &str) -> Result<Self, Self::Err> {
        match status.to_lowercase().as_str() {
            "active" => Ok(SubscriptionStatus::Active),
            "paused" => Ok(SubscriptionStatus::Paused),
            "cancelled" => Ok(SubscriptionStatus::Cancelled),
            _ => Err(format!("Invalid subscription status: {status}")),
        }
    }
}

impl From<String> for SubscriptionStatus {
    fn from(value: String) -> Self {
        SubscriptionStatus::from_str(&value).unwrap_or_default()
    }
}

/// Represents the currency of a subscription
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub enum Currency {
    Usd,
    Cny,
}

impl Default for Currency {
    fn default() -> Self {
        Self::Cny
    }
}

impl From<Currency> for &'static str {
    fn from(value: Currency) -> Self {
        value.as_str()
    }
}

impl Currency {
    pub fn as_str(&self) -> &'static str {
        match self {
            Currency::Usd => "USD",
            Currency::Cny => "CNY",
        }
    }
}

impl FromStr for Currency {
    type Err = String;

    fn from_str(currency: &str) -> Result<Self, Self::Err> {
        match currency.to_uppercase().as_str() {
            "USD" => Ok(Currency::Usd),
            "CNY" => Ok(Currency::Cny),
            _ => Err(format!(
                "Invalid currency: {currency}. Only USD and CNY are supported."
            )),
        }
    }
}

impl From<String> for Currency {
    fn from(value: String) -> Self {
        Currency::from_str(&value).unwrap_or_default()
    }
}

impl Subscription {
    /// Calculate the next billing date based on the current date and billing cycle
    /// Ensures the next billing date is after the start date
    pub fn calculate_next_billing_date(
        &self,
        start_date: NaiveDate,
        current_date: NaiveDate,
    ) -> NaiveDate {
        let mut next_billing_date = start_date;

        // Ensure the first billing date is at least at the start date
        // If start date is in the future, the first billing will be the start date
        if start_date >= current_date {
            return start_date;
        }

        // For past start dates, calculate the next billing date after current date
        while next_billing_date <= current_date {
            next_billing_date = next_billing_date
                .checked_add_signed(chrono::Duration::days(self.billing_cycle_days as i64))
                .unwrap_or(start_date);
        }
        next_billing_date
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use bigdecimal::BigDecimal;
    use chrono::NaiveDate;
    use uuid::Uuid;

    fn create_test_subscription() -> Subscription {
        Subscription {
            id: Uuid::new_v4(),
            user_id: Uuid::new_v4(),
            name: "Test Subscription".to_string(),
            description: Some("Test Description".to_string()),
            amount: BigDecimal::from(10),
            currency: Currency::Usd,
            billing_cycle_days: 30,
            start_date: NaiveDate::from_ymd_opt(2024, 1, 1).unwrap(),
            next_billing_date: NaiveDate::from_ymd_opt(2024, 1, 1).unwrap(),
            status: SubscriptionStatus::Active,
            category: Some("Test".to_string()),
            color: Some("#FF0000".to_string()),
            created_at: None,
            updated_at: None,
        }
    }

    #[test]
    fn test_calculate_next_billing_date_future_start() {
        let subscription = create_test_subscription();
        let future_start = NaiveDate::from_ymd_opt(2024, 12, 1).unwrap();
        let current_date = NaiveDate::from_ymd_opt(2024, 1, 15).unwrap();

        let next_billing = subscription.calculate_next_billing_date(future_start, current_date);

        // For future subscriptions, next billing should be the start date
        assert_eq!(next_billing, future_start);
    }

    #[test]
    fn test_calculate_next_billing_date_past_start() {
        let subscription = create_test_subscription();
        let past_start = NaiveDate::from_ymd_opt(2024, 1, 1).unwrap();
        let current_date = NaiveDate::from_ymd_opt(2024, 2, 15).unwrap();

        let next_billing = subscription.calculate_next_billing_date(past_start, current_date);

        // Should be after current date
        assert!(next_billing > current_date);
        // Should be after start date
        assert!(next_billing >= past_start);
    }

    #[test]
    fn test_calculate_next_billing_date_start_today() {
        let subscription = create_test_subscription();
        let today = NaiveDate::from_ymd_opt(2024, 1, 15).unwrap();

        let next_billing = subscription.calculate_next_billing_date(today, today);

        // For start date today, next billing should be today
        assert_eq!(next_billing, today);
    }
}
