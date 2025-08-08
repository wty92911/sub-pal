use axum::{
    Json, Router,
    extract::{Path, State},
    http::HeaderMap,
    routing::get,
};
use sqlx::PgPool;
use uuid::Uuid;

use crate::models::UserResponse;
use crate::services::UserService;
use crate::utils::auth::extract_user_id_from_token;
use crate::utils::response::{ApiResponse, AppError, success};

/// Create user routes
pub fn user_routes() -> Router<PgPool> {
    Router::new()
        .route("/me", get(get_current_user))
        .route("/{id}", get(get_user_by_id))
}

/// Get the current user
async fn get_current_user(
    State(pool): State<PgPool>,
    headers: HeaderMap,
) -> Result<Json<ApiResponse<UserResponse>>, AppError> {
    // Extract the token from the Authorization header
    let auth_header = headers
        .get("Authorization")
        .ok_or_else(|| AppError::Unauthorized("Missing authorization header".to_string()))?
        .to_str()
        .map_err(|_| AppError::Unauthorized("Invalid authorization header".to_string()))?;

    // Check if it's a Bearer token
    if !auth_header.starts_with("Bearer ") {
        return Err(AppError::Unauthorized("Invalid token format".to_string()));
    }

    // Extract the token
    let token = &auth_header[7..];

    // Extract the user ID from the token
    let user_id = extract_user_id_from_token(token)
        .map_err(|_| AppError::Unauthorized("Invalid token".to_string()))?;

    // Create user service
    let user_service = UserService::new(pool);

    // Get user by ID from the authenticated user
    let user = user_service.get_user_by_id(user_id).await?;

    // Return success response
    Ok(success(user))
}

/// Get user by ID (admin only)
async fn get_user_by_id(
    State(pool): State<PgPool>,
    headers: HeaderMap,
    Path(id): Path<Uuid>,
) -> Result<Json<ApiResponse<UserResponse>>, AppError> {
    // Extract the token from the Authorization header
    let auth_header = headers
        .get("Authorization")
        .ok_or_else(|| AppError::Unauthorized("Missing authorization header".to_string()))?
        .to_str()
        .map_err(|_| AppError::Unauthorized("Invalid authorization header".to_string()))?;

    // Check if it's a Bearer token
    if !auth_header.starts_with("Bearer ") {
        return Err(AppError::Unauthorized("Invalid token format".to_string()));
    }

    // Extract the token
    let token = &auth_header[7..];

    // Extract the user ID from the token
    let auth_user_id = extract_user_id_from_token(token)
        .map_err(|_| AppError::Unauthorized("Invalid token".to_string()))?;

    // Create user service
    let user_service = UserService::new(pool);

    // For now, let's implement a basic security check: users can only access their own data
    // In a real application, you'd check if the user has admin privileges
    if auth_user_id != id {
        return Err(AppError::Forbidden("Access denied".to_string()));
    }

    // Get user by ID
    let user = user_service.get_user_by_id(id).await?;

    // Return success response
    Ok(success(user))
}
