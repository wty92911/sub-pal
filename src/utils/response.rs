use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::Serialize;
use std::fmt;
use tracing;
use uuid;

/// Standard API response format for success responses
#[derive(Debug, Serialize)]
pub struct ApiResponse<T>
where
    T: Serialize,
{
    pub success: bool,
    pub data: T,
}

/// Standard API response format for error responses
#[derive(Debug, Serialize)]
pub struct ApiError {
    pub success: bool,
    pub error: ErrorDetails,
}

/// Enhanced error details for API error responses
#[derive(Debug, Serialize)]
pub struct ErrorDetails {
    /// Machine-readable error code for frontend handling
    pub code: String,
    /// Human-readable error message
    pub message: String,
    /// User-friendly message with actionable guidance
    pub user_message: String,
    /// Error category for UI styling and handling
    pub category: ErrorCategory,
    /// Additional context and debugging information
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<serde_json::Value>,
    /// Suggested actions for users
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub suggestions: Vec<String>,
}

/// Error categories for consistent UI handling
#[derive(Debug, Serialize, Clone, PartialEq)]
#[serde(rename_all = "snake_case")]
pub enum ErrorCategory {
    /// Authentication and authorization errors
    Auth,
    /// Input validation errors
    Validation,
    /// Resource not found errors
    NotFound,
    /// Resource conflicts and business rule violations
    Conflict,
    /// Server-side errors
    Server,
}

/// Create a success response with the given data
pub fn success<T: Serialize>(data: T) -> Json<ApiResponse<T>> {
    Json(ApiResponse {
        success: true,
        data,
    })
}

/// Enhanced error type with user-friendly messaging
#[derive(Debug)]
pub enum AppError {
    /// Authentication required or credentials invalid
    Unauthorized {
        message: String,
        user_message: String,
        suggestions: Vec<String>,
    },

    /// Input validation failed
    ValidationError {
        message: String,
        user_message: String,
        field_errors: Option<serde_json::Value>,
        suggestions: Vec<String>,
    },
    /// Requested resource not found
    NotFound {
        message: String,
        user_message: String,
        resource_type: String,
        suggestions: Vec<String>,
    },
    /// Resource conflict or business rule violation
    Conflict {
        message: String,
        user_message: String,
        conflict_type: String,
        suggestions: Vec<String>,
    },
    /// Internal server error
    InternalServerError {
        message: String,
        user_message: String,
    },
    /// Database connection or query errors
    DatabaseError {
        message: String,
        user_message: String,
        operation: String,
    },
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::Unauthorized { message, .. } => write!(f, "Unauthorized: {message}"),
            AppError::ValidationError { message, .. } => write!(f, "Validation Error: {message}"),
            AppError::NotFound { message, .. } => write!(f, "Not Found: {message}"),
            AppError::Conflict { message, .. } => write!(f, "Conflict: {message}"),
            AppError::InternalServerError { message, .. } => {
                write!(f, "Internal Server Error: {message}")
            }
            AppError::DatabaseError { message, .. } => write!(f, "Database Error: {message}"),
        }
    }
}

impl std::error::Error for AppError {}

/// Convenience constructors for AppError
impl AppError {
    /// Create an unauthorized error with default message
    pub fn unauthorized(message: impl Into<String>) -> Self {
        let msg = message.into();
        Self::Unauthorized {
            message: msg.clone(),
            user_message: "Please log in to access this resource.".to_string(),
            suggestions: vec![
                "Check your credentials and try logging in again.".to_string(),
                "If you just logged in, please wait a moment and try again.".to_string(),
            ],
        }
    }

    /// Create an unauthorized error with custom user message
    pub fn unauthorized_with_message(
        message: impl Into<String>,
        user_message: impl Into<String>,
    ) -> Self {
        Self::Unauthorized {
            message: message.into(),
            user_message: user_message.into(),
            suggestions: vec!["Please verify your credentials and try again.".to_string()],
        }
    }

    /// Create a validation error
    pub fn validation_error(message: impl Into<String>, user_message: impl Into<String>) -> Self {
        Self::ValidationError {
            message: message.into(),
            user_message: user_message.into(),
            field_errors: None,
            suggestions: vec!["Please check the form and correct any errors.".to_string()],
        }
    }

    /// Create a not found error
    pub fn not_found(resource_type: impl Into<String>, message: impl Into<String>) -> Self {
        let resource = resource_type.into();
        let msg = message.into();
        Self::NotFound {
            message: msg,
            user_message: format!(
                "The requested {} could not be found.",
                resource.to_lowercase()
            ),
            resource_type: resource,
            suggestions: vec![
                "Check the ID or name and try again.".to_string(),
                "Make sure you have permission to access this resource.".to_string(),
            ],
        }
    }

    /// Create a conflict error
    pub fn conflict(conflict_type: impl Into<String>, message: impl Into<String>) -> Self {
        let conflict = conflict_type.into();
        let msg = message.into();
        Self::Conflict {
            message: msg,
            user_message: format!(
                "This action conflicts with existing data ({}). Please resolve the conflict and try again.",
                conflict.to_lowercase()
            ),
            conflict_type: conflict,
            suggestions: vec![
                "Choose a different name or value.".to_string(),
                "Check for existing records that might conflict.".to_string(),
            ],
        }
    }

    /// Create an internal server error
    pub fn internal_error(message: impl Into<String>) -> Self {
        Self::InternalServerError {
            message: message.into(),
            user_message: "An unexpected error occurred. Please try again later.".to_string(),
        }
    }

    /// Create a database error
    pub fn database_error(operation: impl Into<String>, message: impl Into<String>) -> Self {
        Self::DatabaseError {
            message: message.into(),
            user_message:
                "Unable to process your request due to a database issue. Please try again."
                    .to_string(),
            operation: operation.into(),
        }
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        // Generate error ID for internal server errors
        let error_id = uuid::Uuid::new_v4().to_string();

        // Log the error before converting to response
        match &self {
            AppError::InternalServerError { message, .. } => {
                tracing::error!("[{}] Internal Server Error: {}", error_id, message);
            }
            AppError::DatabaseError {
                message, operation, ..
            } => {
                tracing::error!(
                    "[{}] Database Error during {}: {}",
                    error_id,
                    operation,
                    message
                );
            }
            AppError::Unauthorized { message, .. } => {
                tracing::warn!("Unauthorized: {}", message);
            }
            AppError::NotFound {
                message,
                resource_type,
                ..
            } => {
                tracing::warn!("Not Found - {}: {}", resource_type, message);
            }
            AppError::Conflict {
                message,
                conflict_type,
                ..
            } => {
                tracing::warn!("Conflict - {}: {}", conflict_type, message);
            }
            AppError::ValidationError { message, .. } => {
                tracing::warn!("Validation Error: {}", message);
            }
        }

        let (status, error_code, message, user_message, category, details, suggestions) = match self
        {
            AppError::Unauthorized {
                message,
                user_message,
                suggestions,
            } => (
                StatusCode::UNAUTHORIZED,
                "AUTH_UNAUTHORIZED".to_string(),
                message,
                user_message,
                ErrorCategory::Auth,
                None,
                suggestions,
            ),
            AppError::ValidationError {
                message,
                user_message,
                field_errors,
                suggestions,
            } => (
                StatusCode::BAD_REQUEST,
                "VALIDATION_FAILED".to_string(),
                message,
                user_message,
                ErrorCategory::Validation,
                field_errors,
                suggestions,
            ),
            AppError::NotFound {
                message,
                user_message,
                resource_type,
                suggestions,
            } => {
                let mut details = serde_json::Map::new();
                details.insert(
                    "resource_type".to_string(),
                    serde_json::Value::String(resource_type),
                );
                (
                    StatusCode::NOT_FOUND,
                    "RESOURCE_NOT_FOUND".to_string(),
                    message,
                    user_message,
                    ErrorCategory::NotFound,
                    Some(serde_json::Value::Object(details)),
                    suggestions,
                )
            }
            AppError::Conflict {
                message,
                user_message,
                conflict_type,
                suggestions,
            } => {
                let mut details = serde_json::Map::new();
                details.insert(
                    "conflict_type".to_string(),
                    serde_json::Value::String(conflict_type),
                );
                (
                    StatusCode::CONFLICT,
                    "RESOURCE_CONFLICT".to_string(),
                    message,
                    user_message,
                    ErrorCategory::Conflict,
                    Some(serde_json::Value::Object(details)),
                    suggestions,
                )
            }
            AppError::InternalServerError {
                message,
                user_message,
                ..
            } => {
                let mut details = serde_json::Map::new();
                details.insert("error_id".to_string(), serde_json::Value::String(error_id));
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "INTERNAL_ERROR".to_string(),
                    message,
                    user_message,
                    ErrorCategory::Server,
                    Some(serde_json::Value::Object(details)),
                    vec![
                        "Please try again later. If the problem persists, contact support."
                            .to_string(),
                    ],
                )
            }
            AppError::DatabaseError {
                message,
                user_message,
                operation,
            } => {
                let mut details = serde_json::Map::new();
                details.insert(
                    "operation".to_string(),
                    serde_json::Value::String(operation),
                );
                details.insert("error_id".to_string(), serde_json::Value::String(error_id));
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "DATABASE_ERROR".to_string(),
                    message,
                    user_message,
                    ErrorCategory::Server,
                    Some(serde_json::Value::Object(details)),
                    vec!["Please try again. If the issue continues, contact support.".to_string()],
                )
            }
        };

        let body = Json(ApiError {
            success: false,
            error: ErrorDetails {
                code: error_code,
                message,
                user_message,
                category,
                details,
                suggestions,
            },
        });

        (status, body).into_response()
    }
}
