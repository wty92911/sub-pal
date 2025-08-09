pub mod auth;
pub mod subscriptions;
pub mod users;

use axum::Router;
use sqlx::PgPool;

pub use self::auth::auth_routes;
pub use self::subscriptions::subscription_routes;
pub use self::users::user_routes;

/// Create all API routes
pub fn api_routes() -> Router<PgPool> {
    Router::new()
        .nest("/auth", auth_routes())
        .nest("/users", user_routes())
        .nest("/subscriptions", subscription_routes())
}
