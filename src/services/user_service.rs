use sqlx::PgPool;
use uuid::Uuid;

use crate::models::{AuthResponse, LoginRequest, RegisterRequest, UserResponse};
use crate::utils::response::AppError;
use crate::utils::{generate_refresh_token, generate_token, hash_password, verify_password};

/// Service for handling user-related operations
pub struct UserService {
    pool: PgPool,
}

impl UserService {
    /// Create a new UserService with the given database pool
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }

    /// Register a new user
    pub async fn register(&self, request: RegisterRequest) -> Result<UserResponse, AppError> {
        // Check if user already exists
        let existing_user = sqlx::query("SELECT id FROM users WHERE email = $1")
            .bind(&request.email)
            .fetch_optional(&self.pool)
            .await
            .map_err(|e| AppError::InternalServerError(format!("Database error: {e}")))?;

        if existing_user.is_some() {
            return Err(AppError::Conflict(format!(
                "User with email {} already exists",
                request.email
            )));
        }

        // Hash password
        let password_hash = hash_password(&request.password)
            .map_err(|e| AppError::InternalServerError(format!("Password hashing error: {e}")))?;

        // Begin transaction
        let mut tx = self
            .pool
            .begin()
            .await
            .map_err(|e| AppError::InternalServerError(format!("Transaction error: {e}")))?;

        // Insert user
        let user = sqlx::query_as::<_, crate::models::User>(
            r#"
            INSERT INTO users (email, password_hash)
            VALUES ($1, $2)
            RETURNING id, email, password_hash, created_at, updated_at
            "#,
        )
        .bind(&request.email)
        .bind(&password_hash)
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| AppError::InternalServerError(format!("User creation error: {e}")))?;

        // Insert user profile
        let profile = sqlx::query_as::<_, crate::models::UserProfile>(
            r#"
            INSERT INTO user_profiles (user_id, name, preferences)
            VALUES ($1, $2, $3)
            RETURNING id, user_id, name, preferences, created_at, updated_at
            "#,
        )
        .bind(user.id)
        .bind(&request.name)
        .bind(serde_json::Value::Object(serde_json::Map::new()))
        .fetch_one(&mut *tx)
        .await
        .map_err(|e| AppError::InternalServerError(format!("Profile creation error: {e}")))?;

        // Commit transaction
        tx.commit()
            .await
            .map_err(|e| AppError::InternalServerError(format!("Transaction commit error: {e}")))?;

        // Return user response
        Ok(user.to_response(Some(&profile)))
    }

    /// Login a user
    pub async fn login(&self, request: LoginRequest) -> Result<AuthResponse, AppError> {
        // Find user by email
        let user = sqlx::query_as::<_, crate::models::User>(
            r#"SELECT id, email, password_hash, created_at, updated_at FROM users WHERE email = $1"#,
        )
        .bind(&request.email)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::InternalServerError(format!("Database error: {e}")))?
        .ok_or_else(|| AppError::Unauthorized("Invalid email or password".to_string()))?;

        // Verify password
        let is_valid = verify_password(&request.password, &user.password_hash).map_err(|e| {
            AppError::InternalServerError(format!("Password verification error: {e}"))
        })?;

        if !is_valid {
            return Err(AppError::Unauthorized(
                "Invalid email or password".to_string(),
            ));
        }

        // Get user profile
        let profile = sqlx::query_as::<_, crate::models::UserProfile>(
            r#"SELECT id, user_id, name, preferences, created_at, updated_at FROM user_profiles WHERE user_id = $1"#,
        )
        .bind(user.id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::InternalServerError(format!("Database error: {e}")))?;

        // Generate tokens
        let token = generate_token(user.id)
            .map_err(|e| AppError::InternalServerError(format!("Token generation error: {e}")))?;

        let refresh_token = generate_refresh_token(user.id).map_err(|e| {
            AppError::InternalServerError(format!("Refresh token generation error: {e}"))
        })?;

        // Return auth response
        Ok(AuthResponse {
            token,
            refresh_token,
            user: user.to_response(profile.as_ref()),
        })
    }

    /// Get user by ID
    pub async fn get_user_by_id(&self, user_id: Uuid) -> Result<UserResponse, AppError> {
        // Get user
        let user = sqlx::query_as::<_, crate::models::User>(
            r#"SELECT id, email, password_hash, created_at, updated_at FROM users WHERE id = $1"#,
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::InternalServerError(format!("Database error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("User with ID {user_id} not found")))?;

        // Get user profile
        let profile = sqlx::query_as::<_, crate::models::UserProfile>(
            r#"SELECT id, user_id, name, preferences, created_at, updated_at FROM user_profiles WHERE user_id = $1"#,
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::InternalServerError(format!("Database error: {e}")))?;

        // Return user response
        Ok(user.to_response(profile.as_ref()))
    }
}
