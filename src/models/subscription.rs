use bigdecimal::BigDecimal;
use chrono::{DateTime, NaiveDate, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use std::convert::TryFrom;
use std::str::FromStr;
use uuid::Uuid;

/// Subscription model representing a subscription in the system
#[derive(Debug, Serialize, Deserialize, FromRow)]
pub struct Subscription {
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
            SubscriptionStatus::Active => "active",
            SubscriptionStatus::Paused => "paused",
            SubscriptionStatus::Cancelled => "cancelled",
        }
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

impl TryFrom<String> for SubscriptionStatus {
    type Error = String;

    fn try_from(status: String) -> Result<Self, Self::Error> {
        Self::from_str(&status)
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

impl TryFrom<String> for Currency {
    type Error = String;

    fn try_from(currency: String) -> Result<Self, Self::Error> {
        Self::from_str(&currency)
    }
}

impl Subscription {
    /// Calculate the next billing date based on the current date and billing cycle
    pub fn calculate_next_billing_date(&self, current_date: NaiveDate) -> NaiveDate {
        current_date
            .checked_add_signed(chrono::Duration::days(self.billing_cycle_days as i64))
            .unwrap_or(current_date)
    }
}
