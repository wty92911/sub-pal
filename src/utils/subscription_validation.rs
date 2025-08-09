use axum::{Json, http::StatusCode};
use bigdecimal::BigDecimal;
use chrono::Utc;
use serde_json::json;

use crate::models::Subscription;

/// Validates a subscription request
pub fn validate_subscription_request(
    request: &Subscription,
) -> Result<(), (StatusCode, Json<serde_json::Value>)> {
    // Validate name
    if request.name.trim().is_empty() {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "Subscription name cannot be empty"})),
        ));
    }

    // Validate amount
    if request.amount <= BigDecimal::from(0) {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "Amount must be non-negative"})),
        ));
    }

    // Validate billing cycle days
    if request.billing_cycle_days <= 0 {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "Billing cycle days must be positive"})),
        ));
    }

    // Validate start_date is not in the future
    let today = Utc::now().date_naive();
    if request.start_date > today {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "Start date cannot be in the future"})),
        ));
    }

    // Validate next billing date is not in the past
    if request.next_billing_date < today {
        return Err((
            StatusCode::BAD_REQUEST,
            Json(json!({"error": "Next billing date cannot be in the past"})),
        ));
    }

    // Validate color if provided (should be a valid hex color code)
    if let Some(color) = &request.color {
        if !validate_color_code(color) {
            return Err((
                StatusCode::BAD_REQUEST,
                Json(json!({"error": "Invalid color code format. Use #RRGGBB format."})),
            ));
        }
    }

    Ok(())
}

/// Validates if a string is a valid hex color code
fn validate_color_code(color: &str) -> bool {
    if !color.starts_with('#') || color.len() != 7 {
        return false;
    }

    for c in color[1..].chars() {
        if !c.is_ascii_hexdigit() {
            return false;
        }
    }

    true
}
