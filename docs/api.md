# Sub-Pal API Documentation

## Base URL
```
http://localhost:6666/api/v1
```

## Authentication
All API endpoints except authentication endpoints require a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Error Handling
All endpoints return errors in the following format:
```json
{
  "error": "Error message"
}
```

## Authentication Endpoints

### Register User
```
POST /auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "8e17bda6-07dc-47c6-a494-cca0d85e6099",
    "email": "user@example.com",
    "name": "User Name",
    "preferences": {}
  }
}
```

### Login
```
POST /auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "user": {
      "id": "8e17bda6-07dc-47c6-a494-cca0d85e6099",
      "email": "user@example.com",
      "name": "User Name",
      "preferences": {}
    }
  }
}
```

## User Endpoints

### Get Current User
```
GET /users/me
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "8e17bda6-07dc-47c6-a494-cca0d85e6099",
    "email": "user@example.com",
    "name": "User Name",
    "preferences": {}
  }
}
```

### Get User by ID
```
GET /users/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "8e17bda6-07dc-47c6-a494-cca0d85e6099",
    "email": "user@example.com",
    "name": "User Name",
    "preferences": {}
  }
}
```

## Subscription Endpoints

### Get All Subscriptions
```
GET /subscriptions
```

**Response:**
```json
{
  "subscriptions": [
    {
      "id": "6f3ca694-dc43-47ea-8609-9f627920c616",
      "name": "Netflix",
      "description": "Streaming service",
      "amount": "15.9900",
      "currency": "Usd",
      "billing_cycle_days": 30,
      "start_date": "2024-01-01",
      "next_billing_date": "2025-09-09",
      "status": "Active",
      "category": "Entertainment",
      "color": null,
      "created_at": "2025-08-10T09:34:38.322134Z",
      "updated_at": "2025-08-10T09:34:38.322134Z",
      "user_id": "8e17bda6-07dc-47c6-a494-cca0d85e6099"
    }
  ]
}
```

### Get Subscription by ID
```
GET /subscriptions/{id}
```

**Response:**
```json
{
  "id": "6f3ca694-dc43-47ea-8609-9f627920c616",
  "name": "Netflix",
  "description": "Streaming service",
  "amount": "15.9900",
  "currency": "Usd",
  "billing_cycle_days": 30,
  "start_date": "2024-01-01",
  "next_billing_date": "2025-09-09",
  "status": "Active",
  "category": "Entertainment",
  "color": null,
  "created_at": "2025-08-10T09:34:38.322134Z",
  "updated_at": "2025-08-10T09:34:38.322134Z",
  "user_id": "8e17bda6-07dc-47c6-a494-cca0d85e6099"
}
```

### Create Subscription
```
POST /subscriptions
```

**Request Body:**
```json
{
  "name": "Netflix",
  "description": "Streaming service",
  "amount": 15.99,
  "currency": "Usd",
  "billing_cycle_days": 30,
  "category": "Entertainment",
  "status": "Active",
  "start_date": "2024-01-01"
}
```

**Response:**
```json
{
  "id": "6f3ca694-dc43-47ea-8609-9f627920c616",
  "name": "Netflix",
  "description": "Streaming service",
  "amount": "15.9900",
  "currency": "Usd",
  "billing_cycle_days": 30,
  "start_date": "2024-01-01",
  "next_billing_date": "2024-01-31",
  "status": "Active",
  "category": "Entertainment",
  "color": null,
  "created_at": "2025-08-10T09:34:38.322134Z",
  "updated_at": "2025-08-10T09:34:38.322134Z",
  "user_id": "8e17bda6-07dc-47c6-a494-cca0d85e6099"
}
```

### Update Subscription
```
PUT /subscriptions/{id}
```

**Request Body:**
```json
{
  "name": "Netflix Premium",
  "amount": 19.99,
  "status": "Paused"
}
```

**Response:**
```json
{
  "id": "6f3ca694-dc43-47ea-8609-9f627920c616",
  "name": "Netflix Premium",
  "description": "Streaming service",
  "amount": "19.9900",
  "currency": "Usd",
  "billing_cycle_days": 30,
  "start_date": "2024-01-01",
  "next_billing_date": "2024-01-31",
  "status": "Paused",
  "category": "Entertainment",
  "color": null,
  "created_at": "2025-08-10T09:34:38.322134Z",
  "updated_at": "2025-08-10T09:35:12.123456Z",
  "user_id": "8e17bda6-07dc-47c6-a494-cca0d85e6099"
}
```

### Delete Subscription
```
DELETE /subscriptions/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "Subscription deleted"
}
```

## Important Implementation Notes

### Billing Cycle Conversion

The backend stores billing cycles as days (`billing_cycle_days`), while the frontend uses named cycles. When integrating:

#### Frontend to Backend Conversion
Convert named billing cycles to days:
- `weekly` → 7 days
- `monthly` → 30 days
- `quarterly` → 90 days
- `yearly` → 365 days
- `custom` → user-defined value

```typescript
// Convert billing cycle to days
const getBillingCycleDays = (billingCycle: string): number => {
  switch (billingCycle) {
    case "weekly": return 7;
    case "monthly": return 30;
    case "quarterly": return 90;
    case "yearly": return 365;
    default: return 30;
  }
};
```

#### Backend to Frontend Conversion
Convert days to named billing cycles:
```typescript
// Convert days to billing cycle
const getBillingCycleFromDays = (days: number): string => {
  if (days === 7) return "weekly";
  if (days === 30) return "monthly";
  if (days === 90) return "quarterly";
  if (days === 365) return "yearly";
  return "custom";
};
```

### Currency Conversion
The backend uses enum values (`Usd`, `Cny`), while the frontend uses standard currency codes:

#### Frontend to Backend
```typescript
// Convert component currency to API currency
const mapCurrency = (currency: string): "Usd" | "Cny" => {
  return currency === "USD" ? "Usd" : "Cny";
};
```

#### Backend to Frontend
```typescript
// Convert API currency to component currency
currency: apiSub.currency === "Usd" ? "USD" : "CNY",
```

### Status Conversion
The backend uses enum values (`Active`, `Paused`, `Cancelled`), while the frontend uses lowercase:

#### Frontend to Backend
```typescript
// Convert component status to API status
const mapStatus = (status: string): "Active" | "Paused" | "Cancelled" => {
  switch (status) {
    case "Active": return "Active";
    case "Paused": return "Paused";
    case "Cancelled": return "Cancelled";
    default: return "Active";
  }
};
```

#### Backend to Frontend
```typescript
// Convert API status to component status
const mapStatus = (status: string): "Active" | "Paused" | "Cancelled" | "Trial" => {
  switch (status) {
    case "Active": return "Active";
    case "Paused": return "Paused";
    case "Cancelled": return "Cancelled";
    default: return "Active";
  }
};
```
