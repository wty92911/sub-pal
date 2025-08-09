use axum::{
    Json, Router,
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    routing::get,
};
use chrono::Utc;
use serde_json::json;
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::Subscription;
use crate::services::SubscriptionService;
use crate::utils::auth::extract_auth;
use crate::utils::validate_subscription_request;

/// Create subscription routes
pub fn subscription_routes() -> Router<PgPool> {
    Router::new()
        .route("/", get(get_subscriptions).post(create_subscription))
        .route(
            "/:id",
            get(get_subscription)
                .put(update_subscription)
                .delete(delete_subscription),
        )
}

/// Get all subscriptions for the authenticated user
async fn get_subscriptions(
    headers: HeaderMap,
    State(pool): State<PgPool>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    // Extract auth from headers
    let auth = match extract_auth(&headers) {
        Ok(auth) => auth,
        Err(_) => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(json!({"error": "Unauthorized"})),
            ));
        }
    };

    let subscription_service = SubscriptionService::new(pool);

    match subscription_service.get_subscriptions(auth.user_id).await {
        Ok(response) => Ok(Json(json!(response))),
        Err(_) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": "Failed to retrieve subscriptions"})),
        )),
    }
}

/// Create a new subscription for the authenticated user
async fn create_subscription(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Json(mut req): Json<Subscription>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    // Extract auth from headers
    let auth = match extract_auth(&headers) {
        Ok(auth) => auth,
        Err(_) => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(json!({"error": "Unauthorized"})),
            ));
        }
    };

    req.user_id = auth.user_id;
    req.next_billing_date = req.calculate_next_billing_date(Utc::now().naive_utc().date());
    // Validate the request
    validate_subscription_request(&req)?;

    let subscription_service = SubscriptionService::new(pool);

    match subscription_service.create_subscription(req).await {
        Ok(subscription) => Ok(Json(json!(subscription))),
        Err(_) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": "Failed to create subscription"})),
        )),
    }
}

/// Get a specific subscription by ID
async fn get_subscription(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    // Extract auth from headers
    let auth = match extract_auth(&headers) {
        Ok(auth) => auth,
        Err(_) => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(json!({"error": "Unauthorized"})),
            ));
        }
    };

    let subscription_service = SubscriptionService::new(pool);

    match subscription_service
        .get_subscription(auth.user_id, id)
        .await
    {
        Ok(subscription) => Ok(Json(json!(subscription))),
        Err(sqlx::Error::RowNotFound) => Err((
            StatusCode::NOT_FOUND,
            Json(json!({"error": "Subscription not found"})),
        )),
        Err(_) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": "Failed to retrieve subscription"})),
        )),
    }
}

/// Update a subscription
async fn update_subscription(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
    Json(mut req): Json<Subscription>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    // Extract auth from headers
    let auth = match extract_auth(&headers) {
        Ok(auth) => auth,
        Err(_) => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(json!({"error": "Unauthorized"})),
            ));
        }
    };

    req.user_id = auth.user_id;
    req.next_billing_date = req.calculate_next_billing_date(Utc::now().naive_utc().date());
    // Validate the request
    validate_subscription_request(&req)?;

    let subscription_service = SubscriptionService::new(pool);

    // First check if the subscription belongs to the user
    match subscription_service
        .get_subscription(auth.user_id, id)
        .await
    {
        Ok(_) => {
            // Subscription belongs to user, proceed with update
            match subscription_service.update_subscription(id, req).await {
                Ok(subscription) => Ok(Json(json!(subscription))),
                Err(_) => Err((
                    StatusCode::INTERNAL_SERVER_ERROR,
                    Json(json!({"error": "Failed to update subscription"})),
                )),
            }
        }
        Err(sqlx::Error::RowNotFound) => Err((
            StatusCode::NOT_FOUND,
            Json(json!({"error": "Subscription not found"})),
        )),
        Err(_) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": "Failed to verify subscription ownership"})),
        )),
    }
}

/// Delete a subscription
async fn delete_subscription(
    headers: HeaderMap,
    State(pool): State<PgPool>,
    Path(id): Path<Uuid>,
) -> Result<Json<serde_json::Value>, (StatusCode, Json<serde_json::Value>)> {
    // Extract auth from headers
    let auth = match extract_auth(&headers) {
        Ok(auth) => auth,
        Err(_) => {
            return Err((
                StatusCode::UNAUTHORIZED,
                Json(json!({"error": "Unauthorized"})),
            ));
        }
    };

    let subscription_service = SubscriptionService::new(pool);

    match subscription_service
        .delete_subscription(auth.user_id, id)
        .await
    {
        Ok(_) => Ok(Json(
            json!({"success": true, "message": "Subscription deleted"}),
        )),
        Err(sqlx::Error::RowNotFound) => Err((
            StatusCode::NOT_FOUND,
            Json(json!({"error": "Subscription not found"})),
        )),
        Err(_) => Err((
            StatusCode::INTERNAL_SERVER_ERROR,
            Json(json!({"error": "Failed to delete subscription"})),
        )),
    }
}
