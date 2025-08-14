use axum::extract::Request;
use axum::middleware::Next;
use axum::response::Response;

/// Middleware to log every request before it's handled
pub async fn request_logger(request: Request, next: Next) -> Response {
    let method = request.method().clone();
    let uri = request.uri().clone();
    let headers = request.headers().clone();

    // Log request details
    tracing::info!("Incoming request: {} {}", method, uri);

    // Log headers (excluding sensitive ones)
    if let Some(user_agent) = headers.get("user-agent") {
        if let Ok(ua) = user_agent.to_str() {
            tracing::debug!("User-Agent: {}", ua);
        }
    }

    if let Some(origin) = headers.get("origin") {
        if let Ok(origin_str) = origin.to_str() {
            tracing::debug!("Origin: {}", origin_str);
        }
    }

    // Log authorization header presence (but not the actual token)
    if headers.contains_key("authorization") {
        tracing::debug!("Authorization header present");
    }

    // Log content type if present
    if let Some(content_type) = headers.get("content-type") {
        if let Ok(ct) = content_type.to_str() {
            tracing::debug!("Content-Type: {}", ct);
        }
    }

    // Log request body size if available
    if let Some(content_length) = headers.get("content-length") {
        if let Ok(cl) = content_length.to_str() {
            tracing::debug!("Content-Length: {}", cl);
        }
    }

    // Process the request
    let response = next.run(request).await;

    // Log response status
    let status = response.status();
    tracing::info!("Request completed: {} {} -> {}", method, uri, status);

    response
}
