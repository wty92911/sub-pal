# Technical Context

## Backend Architecture
- **Language**: Rust (2024 Edition)
- **Framework**: Axum 0.8 for HTTP server
- **Runtime**: Tokio 1.x with full features
- **Database**: PostgreSQL via SQLx 0.7 with tokio-rustls runtime
- **Logging**: Tracing 0.1 with tracing-subscriber 0.3

## Frontend Architecture
- **Framework**: React 19.x
- **Build Tool**: Vite 6.x
- **Language**: TypeScript 5.8
- **CSS Framework**: Tailwind CSS 4.x
- **UI Components**: Radix UI primitives
- **State Management**: Zustand 5.x
- **Data Visualization**: Recharts 2.x
- **Table Management**: TanStack React Table 8.x
- **Icons**: Lucide React

## Development Tools
- **Linting**: ESLint 9.x
- **Testing**: Vitest 3.x with JSDOM
- **Type Checking**: TypeScript 5.8
- **Package Management**: Both npm (package-lock.json) and Yarn (yarn.lock) present

## Project Structure
- **Backend**: Standard Rust project structure with Cargo
- **Frontend**: Located in `/ui` directory with React/TypeScript setup
- **API Routes**: Basic route setup in `src/main.rs`

## Current Status
- Basic project scaffold in place
- Minimal backend server running on port 3000
- Frontend dependencies installed but minimal implementation 