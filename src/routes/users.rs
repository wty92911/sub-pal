use axum::{Json, Router, extract::State, http::HeaderMap, routing::get};
use sqlx::PgPool;
use tracing;

use crate::models::UserResponse;
use crate::services::UserService;
use crate::utils::auth::extract_auth;
use crate::utils::response::{ApiResponse, AppError, success};

/// Create user routes
pub fn user_routes() -> Router<PgPool> {
    Router::new().route("/me", get(get_current_user))
}

/// Get current user
async fn get_current_user(
    headers: HeaderMap,
    State(pool): State<PgPool>,
) -> Result<Json<ApiResponse<UserResponse>>, AppError> {
    // Extract auth from headers
    let auth =
        extract_auth(&headers).map_err(|_| AppError::Unauthorized("Unauthorized".to_string()))?;

    // Log the request
    tracing::info!("Get current user request for user ID: {}", auth.user_id);

    // Create user service
    let user_service = UserService::new(pool);

    // Get user
    let user = user_service.get_user_by_id(auth.user_id).await?;

    tracing::info!("Current user retrieved successfully: {}", user.email);

    // Return success response
    Ok(success(user))
}
