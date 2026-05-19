# SmartExpiryItem Postman Demo Guide

Use this guide for the backend demo and graded project update.

## Demo Goal

Show that the Laravel backend works as an API gateway. Postman calls the local Laravel API, then Laravel calls external services through service classes.

```text
Postman -> Laravel API -> Service Class -> External API
```

## Required Setup

Start the Laravel server:

```bash
php artisan serve
```

Base URL:

```text
http://127.0.0.1:8000
```

Collection variables:

```text
laravel_local = http://127.0.0.1:8000
authToken = token from login response
inventoryId = existing inventory item ID
barcode = 3017620422003
```

Use Bearer token authorization for protected endpoints:

```text
Authorization: Bearer {{authToken}}
```

## Recommended Live Demo Order

### 1. Health Check

```http
GET /api/health
```

Purpose: prove the Laravel API is running.

### 2. Login

```http
POST /api/login
```

Sample body:

```json
{
  "email": "test@example.com",
  "password": "password"
}
```

Purpose: get a Sanctum Bearer token.

### 3. Current User

```http
GET /api/me
```

Purpose: prove protected routes work with the Bearer token.

### 4. External Food API Gateway

```http
GET /api/open-food-facts/3017620422003
```

Purpose: show Laravel calling Open Food Facts through the backend gateway.

Optional external integrations:

```http
POST /api/usda/lookup
POST /api/mealdb/search
POST /api/telegram/send-alert
POST /api/brevo/send-email
```

### 5. Inventory CRUD

Create inventory item:

```http
POST /api/inventory
```

Sample body:

```json
{
  "name": "Rice",
  "barcode": "1234567890123",
  "quantity": 3,
  "minimum_stock": 5,
  "unit": "kg",
  "expiration_date": "2026-06-30",
  "location": "Shelf A"
}
```

Retrieve inventory:

```http
GET /api/inventory
```

Retrieve by ID:

```http
GET /api/inventory/{{inventoryId}}
```

Update by ID:

```http
PUT /api/inventory/{{inventoryId}}
```

Delete by ID:

```http
DELETE /api/inventory/{{inventoryId}}
```

### 6. Monitoring

```http
GET /api/inventory/low-stock
GET /api/inventory/expired
GET /api/inventory/expiring-soon?days=30
```

Purpose: show expiry and stock monitoring.

### 7. Reports

```http
GET /api/reports/summary
GET /api/reports/stock-status
```

Purpose: show backend summary/report endpoints.

### 8. Alerts and Logs

```http
POST /api/alerts/low-stock
GET /api/notifications
GET /api/activity-logs
```

Purpose: show alert processing and saved backend history.

### 9. Admin User Management

```http
GET /api/admin/users
GET /api/admin/users/deleted
PUT /api/admin/users/{id}/role
DELETE /api/admin/users/{id}
PUT /api/admin/users/{id}/restore
```

Purpose: show admin-only protected management routes.

## Test Proof

Run:

```bash
php artisan test
```

Expected result:

```text
11 tests passed
43 assertions
```

## Short Explanation For Instructor

This backend follows the API gateway style. Credentials are stored in `.env`, loaded by `config/services.php`, used by service classes, then exposed through thin controllers with FormRequest validation. All main routes are Postman-ready, and the external APIs are called through Laravel instead of directly from the client.
