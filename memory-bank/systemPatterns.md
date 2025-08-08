# System Patterns

## Architecture Patterns
- **Backend API**: RESTful API using Axum
- **Frontend Structure**: Component-based architecture with React
- **Database Access**: SQLx for type-safe SQL queries
- **Authentication**: JWT-based authentication
- **State Management**: Zustand for client-side state

## File Structure Conventions
- **Backend**:
  - `src/main.rs`: Application entry point
  - `src/routes/`: API route handlers
  - `src/models/`: Database models and schemas
  - `src/services/`: Business logic
  - `src/utils/`: Utility functions
  - `src/config/`: Configuration management

- **Frontend**:
  - `ui/src/components/`: Reusable UI components
  - `ui/src/pages/`: Page components
  - `ui/src/hooks/`: Custom React hooks
  - `ui/src/lib/`: Utility functions
  - `ui/src/services/`: API client services
  - `ui/src/store/`: Zustand stores

## Data Flow Patterns
- **API Communication**: Fetch API with async/await
- **Error Handling**: Consistent error response structure
- **Form Handling**: Controlled components with validation
- **Authentication Flow**: Login → JWT storage → Authorization header
- **Data Fetching**: Loading states, error handling, data display

## UI Conventions
- **Component Library**: Radix UI for accessible primitives
- **Styling**: Tailwind CSS with consistent class naming
- **Layout**: Responsive design using Flexbox/Grid
- **Animation**: Minimal animations for improved UX
- **Theme**: Light/dark mode support

## Subscription Data Model
```
Subscription {
  id: UUID,
  userId: UUID,
  name: String,
  description: String,
  cost: Decimal,
  currency: String,
  startDate: DateTime,
  cycle: Enum (Daily, Weekly, Monthly, Quarterly, Half Yearly, Yearly),
  status: Enum (Active, Paused, Cancelled),
  nextPaymentDate: DateTime,
  createdAt: DateTime,
  updatedAt: DateTime
}
``` 