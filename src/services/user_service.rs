use sqlx::{PgPool, Row};
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
        let user_row = sqlx::query(
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

        let user = crate::models::User {
            id: user_row.get("id"),
            email: user_row.get("email"),
            password_hash: user_row.get("password_hash"),
            created_at: user_row.get("created_at"),
            updated_at: user_row.get("updated_at"),
        };

        // Insert user profile
        let profile_row = sqlx::query(
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

        let profile = crate::models::UserProfile {
            id: profile_row.get("id"),
            user_id: profile_row.get("user_id"),
            name: profile_row.get("name"),
            preferences: profile_row.get("preferences"),
            created_at: profile_row.get("created_at"),
            updated_at: profile_row.get("updated_at"),
        };

        // Commit transaction
        tx.commit()
            .await
            .map_err(|e| AppError::InternalServerError(format!("Transaction commit error: {e}")))?;

        // Return user response
        Ok(user.to_response(Some(&profile)))
    }

    /// Login a user with optimized single query
    pub async fn login(&self, request: LoginRequest) -> Result<AuthResponse, AppError> {
        // Find user and profile with a single JOIN query using function form
        let result = sqlx::query(
            r#"
            SELECT
                u.id as user_id,
                u.email,
                u.password_hash,
                u.created_at as user_created_at,
                u.updated_at as user_updated_at,
                p.id as profile_id,
                p.name,
                p.preferences,
                p.created_at as profile_created_at,
                p.updated_at as profile_updated_at
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.email = $1
            "#,
        )
        .bind(&request.email)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::InternalServerError(format!("Database error: {e}")))?
        .ok_or_else(|| AppError::Unauthorized("Invalid email or password".to_string()))?;

        // Extract values from the row
        let user_id: uuid::Uuid = result.get("user_id");
        let email: String = result.get("email");
        let password_hash: String = result.get("password_hash");
        let user_created_at: chrono::DateTime<chrono::Utc> = result.get("user_created_at");
        let user_updated_at: chrono::DateTime<chrono::Utc> = result.get("user_updated_at");

        // Create user model from result
        let user = crate::models::User {
            id: user_id,
            email,
            password_hash: password_hash.clone(),
            created_at: user_created_at,
            updated_at: user_updated_at,
        };

        // Verify password
        let is_valid = verify_password(&request.password, &password_hash).map_err(|e| {
            AppError::InternalServerError(format!("Password verification error: {e}"))
        })?;

        if !is_valid {
            return Err(AppError::Unauthorized(
                "Invalid email or password".to_string(),
            ));
        }

        // Create profile model if exists
        let profile = if let Ok(profile_id) = result.try_get::<uuid::Uuid, _>("profile_id") {
            Some(crate::models::UserProfile {
                id: profile_id,
                user_id,
                name: result.try_get("name").ok(),
                preferences: result.get("preferences"),
                created_at: result.get("profile_created_at"),
                updated_at: result.get("profile_updated_at"),
            })
        } else {
            None
        };

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

    /// Get user by ID with optimized single query
    pub async fn get_user_by_id(&self, user_id: Uuid) -> Result<UserResponse, AppError> {
        // Use a single JOIN query to fetch user and profile data together using function form
        let result = sqlx::query(
            r#"
            SELECT
                u.id as user_id,
                u.email,
                u.password_hash,
                u.created_at as user_created_at,
                u.updated_at as user_updated_at,
                p.id as profile_id,
                p.name,
                p.preferences,
                p.created_at as profile_created_at,
                p.updated_at as profile_updated_at
            FROM users u
            LEFT JOIN user_profiles p ON u.id = p.user_id
            WHERE u.id = $1
            "#,
        )
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AppError::InternalServerError(format!("Database error: {e}")))?
        .ok_or_else(|| AppError::NotFound(format!("User with ID {user_id} not found")))?;

        // Extract values from the row
        let user_id: uuid::Uuid = result.get("user_id");
        let email: String = result.get("email");
        let password_hash: String = result.get("password_hash");
        let user_created_at: chrono::DateTime<chrono::Utc> = result.get("user_created_at");
        let user_updated_at: chrono::DateTime<chrono::Utc> = result.get("user_updated_at");

        // Create user model from result
        let user = crate::models::User {
            id: user_id,
            email,
            password_hash,
            created_at: user_created_at,
            updated_at: user_updated_at,
        };

        // Create profile model if exists
        let profile = if let Ok(profile_id) = result.try_get::<uuid::Uuid, _>("profile_id") {
            Some(crate::models::UserProfile {
                id: profile_id,
                user_id,
                name: result.try_get("name").ok(),
                preferences: result.get("preferences"),
                created_at: result.get("profile_created_at"),
                updated_at: result.get("profile_updated_at"),
            })
        } else {
            None
        };

        // Return user response
        Ok(user.to_response(profile.as_ref()))
    }
}
