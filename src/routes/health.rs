use axum::{Router, extract::State, http::StatusCode, response::Json, routing::get};
use serde_json::{Value, json};
use sqlx::PgPool;

/// Health check endpoint that verifies database connectivity
async fn health_check(State(pool): State<PgPool>) -> Result<Json<Value>, StatusCode> {
    // Check database connection
    match sqlx::query("SELECT 1").execute(&pool).await {
        Ok(_) => Ok(Json(json!({
            "status": "healthy",
            "database": "connected",
            "timestamp": chrono::Utc::now().to_rfc3339()
        }))),
        Err(e) => {
            tracing::error!("Database health check failed: {}", e);
            Err(StatusCode::SERVICE_UNAVAILABLE)
        }
    }
}

/// Simple liveness check that doesn't depend on external services
async fn liveness_check() -> Json<Value> {
    Json(json!({
        "status": "alive",
        "timestamp": chrono::Utc::now().to_rfc3339()
    }))
}

/// Readiness check that verifies all dependencies are ready
async fn readiness_check(State(pool): State<PgPool>) -> Result<Json<Value>, StatusCode> {
    // Check database connection
    match sqlx::query("SELECT 1").execute(&pool).await {
        Ok(_) => Ok(Json(json!({
            "status": "ready",
            "checks": {
                "database": "ok"
            },
            "timestamp": chrono::Utc::now().to_rfc3339()
        }))),
        Err(e) => {
            tracing::error!("Readiness check failed - database: {}", e);
            Err(StatusCode::SERVICE_UNAVAILABLE)
        }
    }
}

/// Create health check routes
pub fn health_routes() -> Router<PgPool> {
    Router::new()
        .route("/health", get(health_check))
        .route("/health/live", get(liveness_check))
        .route("/health/ready", get(readiness_check))
}
