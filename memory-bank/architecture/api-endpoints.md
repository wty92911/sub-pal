# API Endpoints: Subscription Service Management Panel

## Overview
This document defines the REST API endpoints for the Subscription Service Management Panel. The API follows RESTful principles and uses JSON for request and response payloads.

## Base URL
All API endpoints are relative to the base URL:
```
/api/v1
```

## Authentication
Most endpoints require authentication using JWT tokens. The token should be included in the `Authorization` header:
```
Authorization: Bearer <token>
```

## Response Format
All API responses follow a standard format:

### Success Response
```json
{
  "success": true,
  "data": {
    // Response data specific to the endpoint
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {} // Optional additional error details
  }
}
```

## API Endpoints

### Authentication

#### Register a new user
- **URL**: `/auth/register`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword",
    "name": "John Doe"
  }
  ```
- **Success Response**:
  - **Code**: `201 Created`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid",
        "email": "user@example.com"
      }
    }
    ```
- **Error Responses**:
  - **Code**: `400 Bad Request` (Invalid input)
  - **Code**: `409 Conflict` (Email already exists)

#### Login
- **URL**: `/auth/login`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "password": "securepassword"
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "token": "jwt_token",
        "refreshToken": "refresh_token",
        "user": {
          "id": "uuid",
          "email": "user@example.com",
          "name": "John Doe"
        }
      }
    }
    ```
- **Error Responses**:
  - **Code**: `400 Bad Request` (Invalid input)
  - **Code**: `401 Unauthorized` (Invalid credentials)

#### Refresh Token
- **URL**: `/auth/refresh`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "refreshToken": "refresh_token"
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "token": "new_jwt_token",
        "refreshToken": "new_refresh_token"
      }
    }
    ```
- **Error Responses**:
  - **Code**: `400 Bad Request` (Invalid input)
  - **Code**: `401 Unauthorized` (Invalid or expired refresh token)

#### Logout
- **URL**: `/auth/logout`
- **Method**: `POST`
- **Auth Required**: Yes
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "message": "Logged out successfully"
      }
    }
    ```

#### Request Password Reset
- **URL**: `/auth/password-reset/request`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "message": "Password reset email sent"
      }
    }
    ```

#### Reset Password
- **URL**: `/auth/password-reset/confirm`
- **Method**: `POST`
- **Auth Required**: No
- **Request Body**:
  ```json
  {
    "token": "reset_token",
    "password": "new_password"
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "message": "Password reset successful"
      }
    }
    ```
- **Error Responses**:
  - **Code**: `400 Bad Request` (Invalid input)
  - **Code**: `401 Unauthorized` (Invalid or expired token)

### User Profile

#### Get Current User Profile
- **URL**: `/users/me`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid",
        "email": "user@example.com",
        "name": "John Doe",
        "preferences": {
          "currency": "USD",
          "notifications": {
            "email": true,
            "browser": true
          }
        },
        "createdAt": "2023-01-01T00:00:00Z"
      }
    }
    ```

#### Update User Profile
- **URL**: `/users/me`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "John Smith",
    "preferences": {
      "currency": "EUR",
      "notifications": {
        "email": false,
        "browser": true
      }
    }
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid",
        "email": "user@example.com",
        "name": "John Smith",
        "preferences": {
          "currency": "EUR",
          "notifications": {
            "email": false,
            "browser": true
          }
        },
        "updatedAt": "2023-01-02T00:00:00Z"
      }
    }
    ```
- **Error Responses**:
  - **Code**: `400 Bad Request` (Invalid input)

#### Change Password
- **URL**: `/users/me/password`
- **Method**: `PUT`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "currentPassword": "current_password",
    "newPassword": "new_password"
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "message": "Password changed successfully"
      }
    }
    ```
- **Error Responses**:
  - **Code**: `400 Bad Request` (Invalid input)
  - **Code**: `401 Unauthorized` (Incorrect current password)

### Subscriptions

#### List Subscriptions
- **URL**: `/subscriptions`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `status` (optional): Filter by status (Active, Paused, Cancelled)
  - `sort` (optional): Sort field (name, cost, nextPaymentDate)
  - `order` (optional): Sort order (asc, desc)
  - `page` (optional): Page number for pagination
  - `limit` (optional): Items per page (default: 20)
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "items": [
          {
            "id": "uuid1",
            "name": "Netflix",
            "description": "Streaming service",
            "cost": 14.99,
            "currency": "USD",
            "startDate": "2023-01-01",
            "cycle": "Monthly",
            "status": "Active",
            "nextPaymentDate": "2023-02-01"
          },
          {
            "id": "uuid2",
            "name": "Spotify",
            "description": "Music streaming",
            "cost": 9.99,
            "currency": "USD",
            "startDate": "2023-01-15",
            "cycle": "Monthly",
            "status": "Active",
            "nextPaymentDate": "2023-02-15"
          }
        ],
        "pagination": {
          "total": 10,
          "page": 1,
          "limit": 20,
          "pages": 1
        }
      }
    }
    ```

#### Get Subscription
- **URL**: `/subscriptions/{id}`
- **Method**: `GET`
- **Auth Required**: Yes
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid1",
        "name": "Netflix",
        "description": "Streaming service",
        "cost": 14.99,
        "currency": "USD",
        "startDate": "2023-01-01",
        "cycle": "Monthly",
        "status": "Active",
        "nextPaymentDate": "2023-02-01",
        "createdAt": "2023-01-01T00:00:00Z",
        "updatedAt": "2023-01-01T00:00:00Z"
      }
    }
    ```
- **Error Responses**:
  - **Code**: `404 Not Found` (Subscription not found)

#### Create Subscription
- **URL**: `/subscriptions`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "name": "Disney+",
    "description": "Streaming service",
    "cost": 7.99,
    "currency": "USD",
    "startDate": "2023-01-20",
    "cycle": "Monthly",
    "status": "Active"
  }
  ```
- **Success Response**:
  - **Code**: `201 Created`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid3",
        "name": "Disney+",
        "description": "Streaming service",
        "cost": 7.99,
        "currency": "USD",
        "startDate": "2023-01-20",
        "cycle": "Monthly",
        "status": "Active",
        "nextPaymentDate": "2023-02-20",
        "createdAt": "2023-01-20T00:00:00Z",
        "updatedAt": "2023-01-20T00:00:00Z"
      }
    }
    ```
- **Error Responses**:
  - **Code**: `400 Bad Request` (Invalid input)

#### Update Subscription
- **URL**: `/subscriptions/{id}`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "cost": 9.99,
    "description": "Updated description"
  }
  ```
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid3",
        "name": "Disney+",
        "description": "Updated description",
        "cost": 9.99,
        "currency": "USD",
        "startDate": "2023-01-20",
        "cycle": "Monthly",
        "status": "Active",
        "nextPaymentDate": "2023-02-20",
        "updatedAt": "2023-01-21T00:00:00Z"
      }
    }
    ```
- **Error Responses**:
  - **Code**: `400 Bad Request` (Invalid input)
  - **Code**: `404 Not Found` (Subscription not found)

#### Delete Subscription
- **URL**: `/subscriptions/{id}`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "message": "Subscription deleted successfully"
      }
    }
    ```
- **Error Responses**:
  - **Code**: `404 Not Found` (Subscription not found)

#### Pause Subscription
- **URL**: `/subscriptions/{id}/pause`
- **Method**: `POST`
- **Auth Required**: Yes
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid3",
        "status": "Paused",
        "updatedAt": "2023-01-22T00:00:00Z"
      }
    }
    ```
- **Error Responses**:
  - **Code**: `404 Not Found` (Subscription not found)
  - **Code**: `400 Bad Request` (Already paused)

#### Resume Subscription
- **URL**: `/subscriptions/{id}/resume`
- **Method**: `POST`
- **Auth Required**: Yes
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid3",
        "status": "Active",
        "nextPaymentDate": "2023-02-20",
        "updatedAt": "2023-01-23T00:00:00Z"
      }
    }
    ```
- **Error Responses**:
  - **Code**: `404 Not Found` (Subscription not found)
  - **Code**: `400 Bad Request` (Not paused)

### Payment Records

#### List Payment Records for Subscription
- **URL**: `/subscriptions/{id}/payments`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `page` (optional): Page number for pagination
  - `limit` (optional): Items per page (default: 20)
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "items": [
          {
            "id": "uuid1",
            "subscriptionId": "uuid3",
            "amount": 9.99,
            "currency": "USD",
            "paymentDate": "2023-01-20",
            "notes": "Initial payment",
            "createdAt": "2023-01-20T00:00:00Z"
          }
        ],
        "pagination": {
          "total": 1,
          "page": 1,
          "limit": 20,
          "pages": 1
        }
      }
    }
    ```
- **Error Responses**:
  - **Code**: `404 Not Found` (Subscription not found)

#### Add Payment Record
- **URL**: `/subscriptions/{id}/payments`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
  ```json
  {
    "amount": 9.99,
    "currency": "USD",
    "paymentDate": "2023-02-20",
    "notes": "Monthly payment"
  }
  ```
- **Success Response**:
  - **Code**: `201 Created`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid2",
        "subscriptionId": "uuid3",
        "amount": 9.99,
        "currency": "USD",
        "paymentDate": "2023-02-20",
        "notes": "Monthly payment",
        "createdAt": "2023-02-20T00:00:00Z"
      }
    }
    ```
- **Error Responses**:
  - **Code**: `400 Bad Request` (Invalid input)
  - **Code**: `404 Not Found` (Subscription not found)

### Statistics

#### Get Monthly Expenses
- **URL**: `/statistics/monthly`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `year` (optional): Year to get statistics for (default: current year)
  - `currency` (optional): Currency to convert all amounts to
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "currency": "USD",
        "months": [
          {
            "month": 1,
            "year": 2023,
            "total": 32.97,
            "subscriptionCount": 3
          },
          {
            "month": 2,
            "year": 2023,
            "total": 32.97,
            "subscriptionCount": 3
          }
        ],
        "yearlyTotal": 395.64,
        "averageMonthly": 32.97
      }
    }
    ```

#### Get Yearly Expenses
- **URL**: `/statistics/yearly`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `currency` (optional): Currency to convert all amounts to
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "currency": "USD",
        "years": [
          {
            "year": 2022,
            "total": 120.00,
            "subscriptionCount": 1
          },
          {
            "year": 2023,
            "total": 395.64,
            "subscriptionCount": 3
          }
        ],
        "totalAllYears": 515.64,
        "averageYearly": 257.82
      }
    }
    ```

#### Get Subscription Breakdown
- **URL**: `/statistics/breakdown`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `currency` (optional): Currency to convert all amounts to
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "currency": "USD",
        "byCycle": [
          {
            "cycle": "Monthly",
            "count": 2,
            "total": 24.98
          },
          {
            "cycle": "Yearly",
            "count": 1,
            "total": 7.99
          }
        ],
        "byCategory": [
          {
            "category": "Streaming",
            "count": 2,
            "total": 22.98
          },
          {
            "category": "Music",
            "count": 1,
            "total": 9.99
          }
        ],
        "totalMonthly": 32.97,
        "totalYearly": 395.64
      }
    }
    ```

#### Export Data
- **URL**: `/statistics/export`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `format` (required): Export format (csv, pdf)
  - `type` (required): Export type (subscriptions, payments, monthly, yearly)
  - `year` (optional): Year to filter by
  - `month` (optional): Month to filter by
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**: Binary file with appropriate Content-Type header

### Notifications

#### Get Notifications
- **URL**: `/notifications`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `read` (optional): Filter by read status (true, false)
  - `page` (optional): Page number for pagination
  - `limit` (optional): Items per page (default: 20)
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "items": [
          {
            "id": "uuid1",
            "type": "Renewal",
            "message": "Your Netflix subscription will renew in 3 days",
            "read": false,
            "createdAt": "2023-01-28T00:00:00Z"
          },
          {
            "id": "uuid2",
            "type": "Payment",
            "message": "Payment of $14.99 recorded for Netflix",
            "read": true,
            "createdAt": "2023-01-01T00:00:00Z"
          }
        ],
        "pagination": {
          "total": 2,
          "page": 1,
          "limit": 20,
          "pages": 1
        }
      }
    }
    ```

#### Mark Notification as Read
- **URL**: `/notifications/{id}/read`
- **Method**: `POST`
- **Auth Required**: Yes
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "id": "uuid1",
        "read": true,
        "updatedAt": "2023-01-29T00:00:00Z"
      }
    }
    ```
- **Error Responses**:
  - **Code**: `404 Not Found` (Notification not found)

#### Mark All Notifications as Read
- **URL**: `/notifications/read-all`
- **Method**: `POST`
- **Auth Required**: Yes
- **Success Response**:
  - **Code**: `200 OK`
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "count": 5,
        "updatedAt": "2023-01-29T00:00:00Z"
      }
    }
    ``` 