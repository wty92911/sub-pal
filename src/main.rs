use axum::Router;
use axum::http::Method;
use clap::Parser;
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
use middleware::request_logger;
use routes::api_routes;

#[derive(Parser)]
#[command(name = "sub-pal")]
#[command(about = "Subscription Service Management Panel")]
#[command(version)]
struct Args {
    /// Path to the .env file
    #[arg(short, long, default_value = ".env")]
    env_file: String,

    /// Database URL override
    #[arg(long)]
    database_url: Option<String>,

    /// Log level
    #[arg(short, long, default_value = "info")]
    log_level: String,

    /// Server port
    #[arg(short, long, default_value = "3000")]
    port: u16,
}

#[tokio::main]
async fn main() {
    let args = Args::parse();

    // Load environment variables from .env file
    match dotenv::from_filename(&args.env_file) {
        Ok(_) => tracing::info!("Successfully loaded .env file: {}", args.env_file),
        Err(e) => tracing::error!("Error loading .env file {}: {}", args.env_file, e),
    }

    // Set database URL if provided via command line
    if let Some(db_url) = args.database_url {
        tracing::info!("Setting DATABASE_URL from command line argument");
        unsafe {
            std::env::set_var("DATABASE_URL", db_url);
        }
    } else if env::var("DATABASE_URL").is_err() {
        tracing::info!("Setting DATABASE_URL to default value");
        unsafe {
            std::env::set_var(
                "DATABASE_URL",
                "postgres://postgres:postgres@localhost:5432/sub_pal",
            );
        }
    }

    // Initialize tracing
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::new(
            env::var("RUST_LOG").unwrap_or_else(|_| args.log_level.clone()),
        ))
        .with(tracing_subscriber::fmt::layer())
        .init();

    // Create database connection pool
    let pool = create_pool().await.expect("Failed to create database pool");

    // Configure CORS
    let allowed_origins = AllowOrigin::list(vec![
        "http://localhost:5173".parse().unwrap(),
        "http://192.168.31.123:5173".parse().unwrap(),
        "http://wty92911.top:5173".parse().unwrap(),
    ]);

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
        .layer(axum::middleware::from_fn(request_logger));

    // Start server
    let addr = SocketAddr::from(([0, 0, 0, 0], args.port));
    tracing::info!("listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
