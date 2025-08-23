use axum::{Json, Router, extract::State, routing::post};
use sqlx::PgPool;
use tracing;

use crate::middleware::auth_rate_limit_middleware;
use crate::models::{AuthResponse, LoginRequest, RegisterRequest, UserResponse};
use crate::services::UserService;
use crate::utils::response::{ApiResponse, AppError, success};

/// Create authentication routes
pub fn auth_routes() -> Router<PgPool> {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .layer(axum::middleware::from_fn(auth_rate_limit_middleware))
}

/// Register a new user
async fn register(
    State(pool): State<PgPool>,
    Json(request): Json<RegisterRequest>,
) -> Result<Json<ApiResponse<UserResponse>>, AppError> {
    // Log the request
    tracing::info!("Register request received for email: {}", request.email);

    // Validate input
    if request.email.is_empty() {
        tracing::warn!("Register request failed: Email is empty");
        return Err(AppError::validation_error(
            "Email is required for registration",
            "Please enter a valid email address to create your account.",
        ));
    }
    if request.password.is_empty() {
        tracing::warn!("Register request failed: Password is empty");
        return Err(AppError::validation_error(
            "Password is required for registration",
            "Please create a password to secure your account.",
        ));
    }
    if request.password.len() < 8 {
        tracing::warn!("Register request failed: Password too short");
        return Err(AppError::validation_error(
            "Password must be at least 8 characters",
            "Your password must be at least 8 characters long for security.",
        ));
    }

    // Create user service
    let user_service = UserService::new(pool);

    // Capture email for logging before moving request
    let email = request.email.clone();

    // Register user with detailed error logging
    let user = match user_service.register(request).await {
        Ok(user_response) => {
            tracing::info!("User registered successfully: {}", user_response.email);
            user_response
        }
        Err(e) => {
            tracing::error!(
                "Registration failed for email '{}': Error type: {:?}, Message: {}",
                email,
                std::mem::discriminant(&e),
                e
            );
            return Err(e);
        }
    };

    // Return success response
    Ok(success(user))
}

/// Login a user
async fn login(
    State(pool): State<PgPool>,
    Json(request): Json<LoginRequest>,
) -> Result<Json<ApiResponse<AuthResponse>>, AppError> {
    // Log the request with more detail
    tracing::info!(
        "=== LOGIN REQUEST START === Email: {}, Password length: {}",
        request.email,
        request.password.len()
    );

    // Validate input
    if request.email.is_empty() {
        tracing::warn!("Login request failed: Email is empty");
        return Err(AppError::validation_error(
            "Email is required for login",
            "Please enter your email address to sign in.",
        ));
    }
    if request.password.is_empty() {
        tracing::warn!("Login request failed: Password is empty");
        return Err(AppError::validation_error(
            "Password is required for login",
            "Please enter your password to sign in.",
        ));
    }

    // Create user service
    let user_service = UserService::new(pool);

    // Capture email for logging before moving request
    let email = request.email.clone();

    // Login user with detailed error logging
    let auth = match user_service.login(request).await {
        Ok(auth_response) => {
            tracing::info!("User logged in successfully: {}", auth_response.user.email);
            auth_response
        }
        Err(e) => {
            tracing::error!(
                "Login failed for email '{}': Error type: {:?}, Message: {}",
                email,
                std::mem::discriminant(&e),
                e
            );
            return Err(e);
        }
    };

    // Return success response
    tracing::info!("=== LOGIN REQUEST SUCCESS === Email: {}", auth.user.email);
    Ok(success(auth))
}
