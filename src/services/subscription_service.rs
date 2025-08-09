use sqlx::{Pool, Postgres};
use uuid::Uuid;

use crate::models::{Currency, Subscription, SubscriptionListResponse, SubscriptionStatus};

pub struct SubscriptionService {
    pool: Pool<Postgres>,
}

impl SubscriptionService {
    pub fn new(pool: Pool<Postgres>) -> Self {
        Self { pool }
    }

    /// Create a new subscription
    pub async fn create_subscription(
        &self,
        req: Subscription,
    ) -> Result<Subscription, sqlx::Error> {
        let row = sqlx::query!(
            r#"
            INSERT INTO subscriptions
            (user_id, name, description, amount, currency, billing_cycle_days,
             start_date, next_billing_date, status, category, color)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            RETURNING id, user_id, name, description, amount,
                     currency as "currency!: String",
                     billing_cycle_days, start_date, next_billing_date,
                     status as "status!: String",
                     category, color, created_at, updated_at
            "#,
            req.user_id,
            req.name,
            req.description,
            req.amount,
            req.currency.as_str(),
            req.billing_cycle_days,
            req.start_date,
            req.next_billing_date,
            req.status.as_str(),
            req.category,
            req.color
        )
        .fetch_one(&self.pool)
        .await?;

        // Convert to Subscription model
        Ok(Subscription {
            id: row.id,
            user_id: row.user_id,
            name: row.name,
            description: row.description,
            amount: row.amount,
            currency: Currency::try_from(row.currency).unwrap_or_default(),
            billing_cycle_days: row.billing_cycle_days.unwrap_or(0),
            start_date: row.start_date,
            next_billing_date: row.next_billing_date,
            status: SubscriptionStatus::try_from(row.status).unwrap_or(SubscriptionStatus::Active),
            category: row.category,
            color: row.color,
            created_at: Some(row.created_at),
            updated_at: Some(row.updated_at),
        })
    }

    /// Get a subscription by id
    pub async fn get_subscription(
        &self,
        user_id: Uuid,
        subscription_id: Uuid,
    ) -> Result<Subscription, sqlx::Error> {
        let row = sqlx::query!(
            r#"
            SELECT id, user_id, name, description, amount,
                   currency as "currency!: String",
                   billing_cycle_days, start_date, next_billing_date,
                   status as "status!: String",
                   category, color, created_at, updated_at
            FROM subscriptions
            WHERE id = $1 AND user_id = $2
            "#,
            subscription_id,
            user_id
        )
        .fetch_one(&self.pool)
        .await?;

        // Convert to Subscription model
        Ok(Subscription {
            id: row.id,
            user_id: row.user_id,
            name: row.name,
            description: row.description,
            amount: row.amount,
            currency: Currency::try_from(row.currency).unwrap_or_default(),
            billing_cycle_days: row.billing_cycle_days.unwrap_or(0),
            start_date: row.start_date,
            next_billing_date: row.next_billing_date,
            status: SubscriptionStatus::try_from(row.status).unwrap_or(SubscriptionStatus::Active),
            category: row.category,
            color: row.color,
            created_at: Some(row.created_at),
            updated_at: Some(row.updated_at),
        })
    }

    /// Get all subscriptions for a user
    pub async fn get_subscriptions(
        &self,
        user_id: Uuid,
    ) -> Result<SubscriptionListResponse, sqlx::Error> {
        let rows = sqlx::query!(
            r#"
            SELECT id, user_id, name, description, amount,
                   currency as "currency!: String",
                   billing_cycle_days, start_date, next_billing_date,
                   status as "status!: String",
                   category, color, created_at, updated_at
            FROM subscriptions
            WHERE user_id = $1
            ORDER BY created_at DESC
            "#,
            user_id
        )
        .fetch_all(&self.pool)
        .await?;

        // Convert to Subscription models
        let subscriptions = rows
            .into_iter()
            .map(|row| Subscription {
                id: row.id,
                user_id: row.user_id,
                name: row.name,
                description: row.description,
                amount: row.amount,
                currency: Currency::try_from(row.currency).unwrap_or_default(),
                billing_cycle_days: row.billing_cycle_days.unwrap_or(0),
                start_date: row.start_date,
                next_billing_date: row.next_billing_date,
                status: SubscriptionStatus::try_from(row.status)
                    .unwrap_or(SubscriptionStatus::Active),
                category: row.category,
                color: row.color,
                created_at: Some(row.created_at),
                updated_at: Some(row.updated_at),
            })
            .collect();

        Ok(SubscriptionListResponse { subscriptions })
    }

    /// Update a subscription
    pub async fn update_subscription(
        &self,
        subscription_id: Uuid,
        req: Subscription,
    ) -> Result<Subscription, sqlx::Error> {
        // Update the subscription
        let row = sqlx::query!(
            r#"
            UPDATE subscriptions
            SET name = $2, description = $3, amount = $4, currency = $5,
                billing_cycle_days = $6, start_date = $7,
                next_billing_date = $8, status = $9, category = $10, color = $11
            WHERE id = $1
            RETURNING id, user_id, name, description, amount,
                     currency as "currency!: String",
                     billing_cycle_days, start_date, next_billing_date,
                     status as "status!: String",
                     category, color, created_at, updated_at
            "#,
            subscription_id,
            req.name,
            req.description,
            req.amount,
            req.currency.as_str(),
            req.billing_cycle_days,
            req.start_date,
            req.next_billing_date,
            req.status.as_str(),
            req.category,
            req.color
        )
        .fetch_one(&self.pool)
        .await?;

        // Convert to Subscription model
        Ok(Subscription {
            id: row.id,
            user_id: row.user_id,
            name: row.name,
            description: row.description,
            amount: row.amount,
            currency: Currency::try_from(row.currency).unwrap_or_default(),
            billing_cycle_days: row.billing_cycle_days.unwrap_or(0),
            start_date: row.start_date,
            next_billing_date: row.next_billing_date,
            status: SubscriptionStatus::try_from(row.status).unwrap_or(SubscriptionStatus::Active),
            category: row.category,
            color: row.color,
            created_at: Some(row.created_at),
            updated_at: Some(row.updated_at),
        })
    }

    /// Delete a subscription
    pub async fn delete_subscription(
        &self,
        user_id: Uuid,
        subscription_id: Uuid,
    ) -> Result<(), sqlx::Error> {
        sqlx::query!(
            r#"
            DELETE FROM subscriptions
            WHERE id = $1 AND user_id = $2
            "#,
            subscription_id,
            user_id
        )
        .execute(&self.pool)
        .await?;

        Ok(())
    }
}
