use axum::extract::Request;
use axum::http::{HeaderName, HeaderValue};
use axum::middleware::Next;
use axum::response::Response;
use std::str::FromStr;

/// Security headers middleware to add essential security headers
pub async fn security_headers(request: Request, next: Next) -> Response {
    let mut response = next.run(request).await;

    let headers = response.headers_mut();

    // Add security headers
    if let Ok(header_value) = HeaderValue::from_str("deny") {
        headers.insert(
            HeaderName::from_str("X-Frame-Options").unwrap(),
            header_value,
        );
    }

    if let Ok(header_value) = HeaderValue::from_str("nosniff") {
        headers.insert(
            HeaderName::from_str("X-Content-Type-Options").unwrap(),
            header_value,
        );
    }

    if let Ok(header_value) = HeaderValue::from_str("1; mode=block") {
        headers.insert(
            HeaderName::from_str("X-XSS-Protection").unwrap(),
            header_value,
        );
    }

    if let Ok(header_value) = HeaderValue::from_str("no-referrer-when-downgrade") {
        headers.insert(
            HeaderName::from_str("Referrer-Policy").unwrap(),
            header_value,
        );
    }

    if let Ok(header_value) = HeaderValue::from_str(
        "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'",
    ) {
        headers.insert(
            HeaderName::from_str("Content-Security-Policy").unwrap(),
            header_value,
        );
    }

    if let Ok(header_value) = HeaderValue::from_str("max-age=31536000; includeSubDomains") {
        headers.insert(
            HeaderName::from_str("Strict-Transport-Security").unwrap(),
            header_value,
        );
    }

    response
}
