# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sub-Pal is a Subscription Service Management Panel built with Rust backend (Axum) and React frontend. It allows users to manage, track, and analyze their subscription services with features including user authentication, subscription CRUD operations, and analytics.

## Development Commands

### Backend (Rust)
- **Build**: `cargo build` or `make build`
- **Run**: `cargo run` (starts server on port 3000 by default)
- **Test**: `cargo nextest run --all-features` or `make test`
- **Database setup**: Run `./scripts/docker/start_postgres.sh` to start PostgreSQL in Docker
- **Migrations**: Migrations are in `migrations/` directory and run automatically on startup

### Frontend (React)
- **Navigate to frontend**: `cd ui/`
- **Install deps**: `npm install` (or use yarn as `yarn.lock` exists)
- **Dev server**: `npm run dev` (runs on port 5173)
- **Build**: `npm run build`
- **Lint**: `npm run lint`
- **Test**: `npm run test` (uses Vitest)

### Environment Setup
- Copy `.env.example` to `.env` if it exists
- Default database URL: `postgres://postgres:postgres@localhost:5432/sub_pal`
- Frontend proxy configured for backend at `http://192.168.31.123:3000`

## Architecture

### Backend Structure
The Rust backend follows a layered architecture:

- **`src/main.rs`**: Application entry point with server setup and CORS configuration
- **`src/routes/`**: API route definitions organized by domain (auth, users, subscriptions)
- **`src/services/`**: Business logic layer (user_service, subscription_service)
- **`src/models/`**: Data models (User, Subscription)
- **`src/utils/`**: Utilities (auth, response helpers, validation)
- **`src/config/`**: Configuration management (database connection)
- **`src/middleware.rs`**: Custom middleware (request logging)

Key components:
- **Axum**: Web framework with typed routing
- **SQLx**: Type-safe SQL queries with PostgreSQL
- **JWT**: Token-based authentication
- **Argon2**: Password hashing

### Frontend Structure
React SPA with TypeScript:

- **`src/pages/`**: Route components (login, dashboard, subscriptions, statistics)
- **`src/components/`**: Reusable UI components organized by domain (auth/, subscription/, ui/)
- **`src/lib/`**: Core utilities (API client, auth context, types)
- **`src/hooks/`**: Custom React hooks

Key libraries:
- **React Router**: Navigation and routing
- **Zustand**: State management
- **Radix UI**: Component primitives
- **Tailwind CSS**: Styling
- **Recharts**: Data visualization
- **React Hook Form + Zod**: Form handling and validation

### Database Schema
PostgreSQL with the following key tables:
- **users**: User authentication and profiles
- **subscriptions**: Subscription details with billing cycles, amounts, status
- Migrations in `migrations/` directory

### API Structure
REST API at `/api/v1/` with endpoints:
- **Auth**: `/auth/register`, `/auth/login`
- **Users**: `/users/me`
- **Subscriptions**: `/subscriptions` (CRUD + stats)

## Development Guidelines

### Code Quality (from .cursor/rules/)
- Use meaningful names that reveal purpose
- Keep functions small and focused (single responsibility)
- Extract repeated code into reusable functions
- Write self-documenting code, use comments for "why" not "what"
- Maintain clean file structure and consistent naming

### React Best Practices
- Use functional components with hooks
- Implement proper state management (local state vs Context)
- Use controlled components for forms
- Implement Error Boundaries for error handling
- Follow accessibility guidelines (semantic HTML, ARIA attributes)
- Write unit tests with React Testing Library

### Rust Best Practices
- Follow Rust idioms and the official style guide
- Use type-safe SQL queries with SQLx
- Implement proper error handling with custom error types
- Use async/await patterns appropriately
- Write comprehensive tests

### Environment Preferences
- Using Nushell as primary shell (shell-agnostic commands preferred)
- Use Makefiles for build automation
- Prefer small, focused commits with meaningful messages

## Testing

### Backend Testing
- Use `cargo nextest run --all-features` for running tests
- Test files should be co-located with source files or in `tests/` directory

### Frontend Testing
- Use Vitest with jsdom environment for testing
- Tests configured in `vite.config.ts`
- Run with `npm run test`

## Common Tasks

### Adding New Subscription Fields
1. Update database schema in new migration file
2. Update `models/subscription.rs` struct
3. Update `services/subscription_service.rs` for business logic
4. Update API routes in `routes/subscriptions.rs`
5. Update frontend types in `lib/api-types.ts`
6. Update form components and validation

### Authentication Flow
- JWT tokens stored in localStorage
- API client automatically adds Authorization header
- Protected routes use `ProtectedRoute` component
- Auth context manages user state across the app

### Database Changes
1. Create new migration file in `migrations/`
2. Update corresponding Rust models
3. Update service layer for new functionality
4. Run migration automatically on app startup

## Important Files
- **Backend entry**: `src/main.rs`
- **Frontend entry**: `ui/src/main.tsx`
- **API client**: `ui/src/lib/api.ts`
- **Auth context**: `ui/src/lib/auth-context.tsx`
- **Database config**: `src/config/database.rs`
- **Build configs**: `Cargo.toml`, `ui/package.json`