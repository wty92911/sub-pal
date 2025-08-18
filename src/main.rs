use axum::Router;
use axum::http::Method;
use std::env;
use std::net::SocketAddr;
use tower_http::cors::{AllowOrigin, CorsLayer};
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod middleware;
mod models;
mod routes;
mod services;
mod utils;

use config::create_pool;
use middleware::{rate_limit_middleware, request_logger, security_headers};
use routes::api_routes;

// Configuration loaded from environment variables (provided by Docker)
struct Config {
    log_level: String,
    port: u16,
    host: String,
}

impl Config {
    fn from_env() -> Self {
        Self {
            log_level: env::var("RUST_LOG").unwrap_or_else(|_| "info".to_string()),
            port: env::var("PORT")
                .unwrap_or_else(|_| "3000".to_string())
                .parse()
                .unwrap_or(3000),
            host: env::var("HOST").unwrap_or_else(|_| "0.0.0.0".to_string()),
        }
    }
}

#[tokio::main]
async fn main() {
    // Load configuration from environment variables (provided by Docker)
    let config = Config::from_env();

    tracing::info!(
        "Starting Sub-Pal with config - Host: {}, Port: {}, Log Level: {}",
        config.host,
        config.port,
        config.log_level
    );

    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(&config.log_level))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Create database connection pool
    let pool = match create_pool().await {
        Ok(pool) => {
            tracing::info!("Database connection pool created successfully");
            pool
        }
        Err(e) => {
            tracing::error!("Failed to create database pool: {}", e);
            std::process::exit(1);
        }
    };

    // Configure CORS with proper error handling
    let allowed_origins = {
        let origins_str = env::var("ALLOWED_ORIGINS").unwrap_or_else(|_| {
            "http://localhost:5173,http://192.168.31.123:5173,http://wty92911.top:5173".to_string()
        });

        let origins: Vec<&str> = origins_str.split(',').map(|s| s.trim()).collect();

        let parsed_origins: Result<Vec<_>, _> =
            origins.iter().map(|origin| origin.parse()).collect();

        match parsed_origins {
            Ok(origins) => AllowOrigin::list(origins),
            Err(e) => {
                tracing::error!("Failed to parse CORS origins: {}", e);
                std::process::exit(1);
            }
        }
    };

    // Define allowed methods
    let allowed_methods = vec![
        Method::GET,
        Method::POST,
        Method::PUT,
        Method::DELETE,
        Method::OPTIONS,
    ];

    // Define allowed headers
    let allowed_headers = vec![
        axum::http::header::CONTENT_TYPE,
        axum::http::header::AUTHORIZATION,
        axum::http::header::ACCEPT,
    ];

    let cors = CorsLayer::new()
        .allow_origin(allowed_origins)
        .allow_methods(allowed_methods)
        .allow_headers(allowed_headers)
        .allow_credentials(true);

    // Build application with routes and middleware
    let app = Router::new()
        .nest("/api/v1", api_routes())
        .with_state(pool)
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .layer(axum::middleware::from_fn(security_headers))
        .layer(axum::middleware::from_fn(rate_limit_middleware))
        .layer(axum::middleware::from_fn(request_logger));

    // Start server with proper error handling
    let host_parts: Vec<u8> = config
        .host
        .split('.')
        .map(|s| s.parse().unwrap_or(0))
        .collect();
    let host_addr = if host_parts.len() == 4 {
        [host_parts[0], host_parts[1], host_parts[2], host_parts[3]]
    } else {
        [0, 0, 0, 0] // Default to 0.0.0.0 if parsing fails
    };

    let addr = SocketAddr::from((host_addr, config.port));
    tracing::info!("Starting server on {}", addr);

    let listener = match tokio::net::TcpListener::bind(addr).await {
        Ok(listener) => {
            tracing::info!("Server successfully bound to {}", addr);
            listener
        }
        Err(e) => {
            tracing::error!("Failed to bind to address {}: {}", addr, e);
            std::process::exit(1);
        }
    };

    if let Err(e) = axum::serve(listener, app).await {
        tracing::error!("Server error: {}", e);
        std::process::exit(1);
    }
}
