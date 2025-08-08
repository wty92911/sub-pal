use sqlx::postgres::{PgPool, PgPoolOptions};
use std::env;
use std::time::Duration;

/// Creates a connection pool to the PostgreSQL database
pub async fn create_pool() -> Result<PgPool, sqlx::Error> {
    let database_url =
        env::var("DATABASE_URL").expect("DATABASE_URL environment variable must be set");

    PgPoolOptions::new()
        .max_connections(5)
        .acquire_timeout(Duration::from_secs(3))
        .connect(&database_url)
        .await
}

/// Runs database migrations
pub async fn run_migrations(pool: &PgPool) -> Result<(), sqlx::migrate::MigrateError> {
    sqlx::migrate!("./migrations").run(pool).await
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
