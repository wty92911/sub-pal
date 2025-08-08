use axum::{Json, Router, extract::State, routing::get};
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::UserResponse;
use crate::services::UserService;
use crate::utils::response::{ApiResponse, AppError, success};

/// Create user routes
pub fn user_routes() -> Router<PgPool> {
    Router::new().route("/me", get(get_current_user))
}

/// Get the current user
async fn get_current_user(
    State(pool): State<PgPool>,
    // In a real application, we would extract the user ID from the JWT token
    // For now, we'll just use a placeholder user ID for testing
) -> Result<Json<ApiResponse<UserResponse>>, AppError> {
    // Create user service
    let user_service = UserService::new(pool);

    // Use a placeholder user ID for testing
    // In a real application, this would come from the JWT token
    let user_id = Uuid::parse_str("00000000-0000-0000-0000-000000000000")
        .map_err(|_| AppError::InternalServerError("Invalid user ID".to_string()))?;

    // Get user by ID
    let user = user_service.get_user_by_id(user_id).await?;

    // Return success response
    Ok(success(user))
}
