use axum::extract::{ConnectInfo, Request};
use axum::http::{HeaderValue, StatusCode};
use axum::middleware::Next;
use axum::response::{IntoResponse, Response};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::{Arc, Mutex};
use std::time::{Duration, Instant};

#[derive(Clone)]
pub struct RateLimitConfig {
    pub max_requests: usize,
    pub window_duration: Duration,
    pub block_duration: Duration,
}

impl Default for RateLimitConfig {
    fn default() -> Self {
        Self {
            max_requests: 100,                        // 100 requests
            window_duration: Duration::from_secs(60), // per minute
            block_duration: Duration::from_secs(300), // block for 5 minutes
        }
    }
}

#[derive(Debug)]
struct ClientInfo {
    request_count: usize,
    window_start: Instant,
    blocked_until: Option<Instant>,
}

impl Default for ClientInfo {
    fn default() -> Self {
        Self {
            request_count: 1,
            window_start: Instant::now(),
            blocked_until: None,
        }
    }
}

#[derive(Clone)]
pub struct RateLimiter {
    clients: Arc<Mutex<HashMap<String, ClientInfo>>>,
    config: RateLimitConfig,
}

impl RateLimiter {
    pub fn new(config: RateLimitConfig) -> Self {
        Self {
            clients: Arc::new(Mutex::new(HashMap::new())),
            config,
        }
    }

    #[allow(dead_code)] // Utility function for future use
    pub fn with_default_config() -> Self {
        Self::new(RateLimitConfig::default())
    }

    pub fn check_rate_limit(&self, client_ip: &str) -> Result<(), StatusCode> {
        let mut clients = self.clients.lock().unwrap();
        let now = Instant::now();

        let client_info = clients.entry(client_ip.to_string()).or_default();

        // Check if client is currently blocked
        if let Some(blocked_until) = client_info.blocked_until {
            if now < blocked_until {
                tracing::warn!(
                    "Rate limit: Client {} is blocked until {:?}",
                    client_ip,
                    blocked_until
                );
                return Err(StatusCode::TOO_MANY_REQUESTS);
            } else {
                // Unblock the client
                client_info.blocked_until = None;
                client_info.request_count = 1;
                client_info.window_start = now;
                return Ok(());
            }
        }

        // Check if we need to reset the window
        if now.duration_since(client_info.window_start) >= self.config.window_duration {
            client_info.request_count = 1;
            client_info.window_start = now;
            return Ok(());
        }

        // Increment request count
        client_info.request_count += 1;

        // Check if limit is exceeded
        if client_info.request_count > self.config.max_requests {
            client_info.blocked_until = Some(now + self.config.block_duration);
            tracing::warn!(
                "Rate limit exceeded for client {}: {} requests in {:?} window. Blocking for {:?}",
                client_ip,
                client_info.request_count,
                self.config.window_duration,
                self.config.block_duration
            );
            return Err(StatusCode::TOO_MANY_REQUESTS);
        }

        Ok(())
    }

    /// Clean up expired entries to prevent memory leaks
    #[allow(dead_code)] // Utility function for memory management
    pub fn cleanup_expired(&self) {
        let mut clients = self.clients.lock().unwrap();
        let now = Instant::now();

        clients.retain(|_ip, info| {
            // Remove clients whose block has expired and haven't made requests recently
            if let Some(blocked_until) = info.blocked_until {
                now < blocked_until
            } else {
                // Keep clients that have made requests in the last window + some buffer
                now.duration_since(info.window_start)
                    < self.config.window_duration + Duration::from_secs(300)
            }
        });

        tracing::debug!("Rate limiter cleanup: {} active clients", clients.len());
    }

    /// Get current status for a client (for debugging/monitoring)
    pub fn get_client_status(&self, client_ip: &str) -> Option<(usize, Duration, bool)> {
        let clients = self.clients.lock().unwrap();
        if let Some(info) = clients.get(client_ip) {
            let now = Instant::now();
            let is_blocked = info.blocked_until.is_some_and(|until| now < until);
            let window_remaining = self
                .config
                .window_duration
                .saturating_sub(now.duration_since(info.window_start));

            Some((info.request_count, window_remaining, is_blocked))
        } else {
            None
        }
    }
}

/// Rate limiting middleware
pub async fn rate_limit_middleware(
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    request: Request,
    next: Next,
) -> Response {
    // Get the rate limiter from the request extensions or create a default one
    static RATE_LIMITER: std::sync::OnceLock<RateLimiter> = std::sync::OnceLock::new();
    let rate_limiter = RATE_LIMITER.get_or_init(|| {
        RateLimiter::new(RateLimitConfig {
            max_requests: 60, // 60 requests per minute for general endpoints
            window_duration: Duration::from_secs(60),
            block_duration: Duration::from_secs(300), // 5 minute block
        })
    });

    let client_ip = addr.ip().to_string();

    // Check rate limit
    match rate_limiter.check_rate_limit(&client_ip) {
        Ok(()) => {
            let mut response = next.run(request).await;

            // Add rate limit headers to response
            if let Some((count, remaining, _)) = rate_limiter.get_client_status(&client_ip) {
                let headers = response.headers_mut();

                if let Ok(count_header) = HeaderValue::from_str(&count.to_string()) {
                    headers.insert("X-RateLimit-Requests", count_header);
                }

                if let Ok(limit_header) =
                    HeaderValue::from_str(&rate_limiter.config.max_requests.to_string())
                {
                    headers.insert("X-RateLimit-Limit", limit_header);
                }

                if let Ok(remaining_header) =
                    HeaderValue::from_str(&remaining.as_secs().to_string())
                {
                    headers.insert("X-RateLimit-Reset", remaining_header);
                }
            }

            response
        }
        Err(status) => {
            tracing::warn!("Rate limit exceeded for IP: {}", client_ip);

            let mut response = status.into_response();
            let headers = response.headers_mut();

            // Add rate limit headers
            if let Ok(retry_after) =
                HeaderValue::from_str(&rate_limiter.config.block_duration.as_secs().to_string())
            {
                headers.insert("Retry-After", retry_after);
            }

            if let Ok(limit_header) =
                HeaderValue::from_str(&rate_limiter.config.max_requests.to_string())
            {
                headers.insert("X-RateLimit-Limit", limit_header);
            }

            response
        }
    }
}

/// Stricter rate limiting for authentication endpoints
pub async fn auth_rate_limit_middleware(
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    request: Request,
    next: Next,
) -> Response {
    static AUTH_RATE_LIMITER: std::sync::OnceLock<RateLimiter> = std::sync::OnceLock::new();
    let rate_limiter = AUTH_RATE_LIMITER.get_or_init(|| {
        RateLimiter::new(RateLimitConfig {
            max_requests: 5, // Only 5 auth attempts per minute
            window_duration: Duration::from_secs(60),
            block_duration: Duration::from_secs(900), // 15 minute block for auth abuse
        })
    });

    let client_ip = addr.ip().to_string();

    match rate_limiter.check_rate_limit(&client_ip) {
        Ok(()) => next.run(request).await,
        Err(status) => {
            tracing::warn!("Auth rate limit exceeded for IP: {}", client_ip);
            status.into_response()
        }
    }
}

// Background task to periodically clean up expired entries
#[allow(dead_code)] // Utility function for background cleanup
pub fn start_cleanup_task(rate_limiter: RateLimiter) {
    tokio::spawn(async move {
        let mut interval = tokio::time::interval(Duration::from_secs(300)); // Every 5 minutes

        loop {
            interval.tick().await;
            rate_limiter.cleanup_expired();
        }
    });
}
