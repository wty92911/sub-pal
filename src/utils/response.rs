use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::Serialize;
use std::fmt;
use tracing;

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

/// Error details for API error responses
#[derive(Debug, Serialize)]
pub struct ErrorDetails {
    pub code: String,
    pub message: String,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub details: Option<serde_json::Value>,
}

/// Create a success response with the given data
pub fn success<T: Serialize>(data: T) -> Json<ApiResponse<T>> {
    Json(ApiResponse {
        success: true,
        data,
    })
}

/// Custom error type for API errors
#[derive(Debug)]
pub enum AppError {
    BadRequest(String),
    Unauthorized(String),
    _Forbidden(String),
    NotFound(String),
    Conflict(String),
    InternalServerError(String),
    _ValidationError {
        message: String,
        details: serde_json::Value,
    },
}

impl fmt::Display for AppError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            AppError::BadRequest(msg) => write!(f, "Bad Request: {msg}"),
            AppError::Unauthorized(msg) => write!(f, "Unauthorized: {msg}"),
            AppError::_Forbidden(msg) => write!(f, "Forbidden: {msg}"),
            AppError::NotFound(msg) => write!(f, "Not Found: {msg}"),
            AppError::Conflict(msg) => write!(f, "Conflict: {msg}"),
            AppError::InternalServerError(msg) => write!(f, "Internal Server Error: {msg}"),
            AppError::_ValidationError { message, details } => {
                write!(f, "Validation Error: {message} - Details: {details:?}")
            }
        }
    }
}

impl std::error::Error for AppError {}

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
        // Log the error before converting to response
        match &self {
            AppError::InternalServerError(msg) => {
                tracing::error!("Internal Server Error: {}", msg);
            }
            AppError::BadRequest(msg) => {
                tracing::warn!("Bad Request: {}", msg);
            }
            AppError::Unauthorized(msg) => {
                tracing::warn!("Unauthorized: {}", msg);
            }
            AppError::NotFound(msg) => {
                tracing::warn!("Not Found: {}", msg);
            }
            AppError::Conflict(msg) => {
                tracing::warn!("Conflict: {}", msg);
            }
            AppError::_Forbidden(msg) => {
                tracing::warn!("Forbidden: {}", msg);
            }
            AppError::_ValidationError { message, details } => {
                tracing::warn!("Validation Error: {} - Details: {:?}", message, details);
            }
        }

        let (status, error_code, error_message, details) = match self {
            AppError::BadRequest(message) => (
                StatusCode::BAD_REQUEST,
                "BAD_REQUEST".to_string(),
                message,
                None,
            ),
            AppError::Unauthorized(message) => (
                StatusCode::UNAUTHORIZED,
                "UNAUTHORIZED".to_string(),
                message,
                None,
            ),
            AppError::_Forbidden(message) => (
                StatusCode::FORBIDDEN,
                "FORBIDDEN".to_string(),
                message,
                None,
            ),
            AppError::NotFound(message) => (
                StatusCode::NOT_FOUND,
                "NOT_FOUND".to_string(),
                message,
                None,
            ),
            AppError::Conflict(message) => {
                (StatusCode::CONFLICT, "CONFLICT".to_string(), message, None)
            }
            AppError::InternalServerError(message) => (
                StatusCode::INTERNAL_SERVER_ERROR,
                "INTERNAL_SERVER_ERROR".to_string(),
                message,
                None,
            ),
            AppError::_ValidationError { message, details } => (
                StatusCode::BAD_REQUEST,
                "VALIDATION_ERROR".to_string(),
                message,
                Some(details),
            ),
        };

        let body = Json(ApiError {
            success: false,
            error: ErrorDetails {
                code: error_code,
                message: error_message,
                details,
            },
        });

        (status, body).into_response()
    }
}
