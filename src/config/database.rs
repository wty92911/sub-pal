use sqlx::postgres::{PgPool, PgPoolOptions};
use std::env;
use std::time::Duration;
use tracing;

/// Creates a connection pool to the PostgreSQL database and runs migrations
pub async fn create_pool() -> Result<PgPool, sqlx::Error> {
    let database_url = env::var("DATABASE_URL")
        .unwrap_or_else(|_| "postgres://postgres:postgres@localhost:5432/sub_pal".to_string());

    tracing::info!("Creating database connection pool...");
    tracing::debug!("Database URL: {}", mask_database_url(&database_url));

    let pool = PgPoolOptions::new()
        .max_connections(5)
        .acquire_timeout(Duration::from_secs(3))
        .connect(&database_url)
        .await?;

    tracing::info!("Database connection pool created successfully");

    // Run database migrations
    tracing::info!("Running database migrations...");
    match sqlx::migrate!("./migrations").run(&pool).await {
        Ok(_) => {
            tracing::info!("Database migrations completed successfully");
        }
        Err(e) => {
            tracing::error!("Failed to run database migrations: {}", e);
            return Err(e.into());
        }
    }

    Ok(pool)
}

/// Mask sensitive information in database URL for logging
fn mask_database_url(url: &str) -> String {
    if let Some(at_pos) = url.find('@') {
        if let Some(colon_pos) = url[..at_pos].rfind(':') {
            let mut masked = url.to_string();
            let password_start = colon_pos + 1;
            let password_end = at_pos;
            masked.replace_range(password_start..password_end, "***");
            return masked;
        }
    }
    url.to_string()
}

#[cfg(test)]
mod tests {
    use super::*;
    use tokio;

    #[tokio::test]
    async fn test_create_pool() {
        // This test requires a valid DATABASE_URL environment variable
        if let Ok(_url) = env::var("DATABASE_URL") {
            let result = create_pool().await;
            assert!(result.is_ok());
        }
    }
}
