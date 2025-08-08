use axum::{
    Json,
    http::StatusCode,
    response::{IntoResponse, Response},
};
use serde::Serialize;

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

impl IntoResponse for AppError {
    fn into_response(self) -> Response {
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

/// Convert a standard error to an AppError::InternalServerError
impl<E> From<E> for AppError
where
    E: std::error::Error,
{
    fn from(err: E) -> Self {
        AppError::InternalServerError(err.to_string())
    }
}
