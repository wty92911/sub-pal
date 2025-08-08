use axum::Router;
use clap::Parser;
use std::env;
use std::net::SocketAddr;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod config;
mod models;
mod routes;
mod services;
mod utils;

use config::create_pool;
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

    // Build application with routes
    let app = Router::new()
        .nest("/api/v1", api_routes())
        .with_state(pool)
        .layer(TraceLayer::new_for_http());

    // Start server
    let addr = SocketAddr::from(([127, 0, 0, 1], args.port));
    tracing::info!("listening on {}", addr);

    let listener = tokio::net::TcpListener::bind(addr).await.unwrap();
    axum::serve(listener, app).await.unwrap();
}
