use axum::{Json, Router, extract::State, routing::post};
use sqlx::PgPool;

use crate::models::{AuthResponse, LoginRequest, RegisterRequest, UserResponse};
use crate::services::UserService;
use crate::utils::response::{ApiResponse, AppError, success};

/// Create authentication routes
pub fn auth_routes() -> Router<PgPool> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
}

/// Register a new user
async fn register(
    State(pool): State<PgPool>,
    Json(request): Json<RegisterRequest>,
) -> Result<Json<ApiResponse<UserResponse>>, AppError> {
    // Validate input
    if request.email.is_empty() {
        return Err(AppError::BadRequest("Email is required".to_string()));
    }
    if request.password.is_empty() {
        return Err(AppError::BadRequest("Password is required".to_string()));
    }
    if request.password.len() < 8 {
        return Err(AppError::BadRequest(
            "Password must be at least 8 characters".to_string(),
        ));
    }

    // Create user service
    let user_service = UserService::new(pool);

    // Register user
    let user = user_service.register(request).await?;

    // Return success response
    Ok(success(user))
}

/// Login a user
async fn login(
    State(pool): State<PgPool>,
    Json(request): Json<LoginRequest>,
) -> Result<Json<ApiResponse<AuthResponse>>, AppError> {
    // Validate input
    if request.email.is_empty() {
        return Err(AppError::BadRequest("Email is required".to_string()));
    }
    if request.password.is_empty() {
        return Err(AppError::BadRequest("Password is required".to_string()));
    }

    // Create user service
    let user_service = UserService::new(pool);

    // Login user
    let auth = user_service.login(request).await?;

    // Return success response
    Ok(success(auth))
}
