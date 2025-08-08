# Tasks

## Immediate Tasks (Phase 1)

### Database Setup
- [x] Set up PostgreSQL schema for users
- [x] Create migration script for initial tables
- [x] Configure database connection in the application
- [x] Implement repository pattern for database access
- [x] Add user model and schema validation

### Backend Authentication
- [x] Create user registration endpoint
  - [x] Validate input data
  - [x] Hash passwords securely
  - [x] Store user data
  - [x] Generate confirmation tokens
- [x] Create user login endpoint
  - [x] Validate credentials
  - [x] Generate JWT tokens
  - [x] Set proper authentication headers
- [x] Implement middleware for protected routes
  - [x] JWT verification
  - [x] Role-based authorization
  - [x] Error handling for unauthorized access

### Frontend Authentication
- [ ] Create registration form component
  - [ ] Form validation
  - [ ] Error handling
  - [ ] Success feedback
- [ ] Create login form component
  - [ ] Credential validation
  - [ ] Error handling
  - [ ] Token storage
- [ ] Implement authenticated routes with guards
<!-- - [ ] Add user profile management UI -->

## Upcoming Tasks (Phase 2)

### Subscription Management Backend
- [ ] Create subscription database schema
- [ ] Implement CRUD API endpoints for subscriptions
- [ ] Add subscription validation logic
- [ ] Implement subscription cycle calculations

### Subscription Management Frontend
- [ ] Create subscription listing component
- [ ] Build subscription form component
- [ ] Implement subscription filtering and sorting
- [ ] Add subscription details view

## Task Status
- **In Progress**: Backend Authentication
- **Next**: Frontend Authentication
- **Blocked**: None
- **Completed**: Database setup, User registration and login endpoints, JWT authentication
