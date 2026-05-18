# SmartExpiryItem Backend README

SmartExpiryItem is a Laravel backend API for smart inventory management, expiry tracking, food data lookup, reporting, admin management, and alert notifications.

This project is backend-only. Testing is done through Postman.

## Tech Stack

```text
Laravel 12
PHP 8.2+
Laravel Sanctum
MySQL
Laravel HTTP Client
Postman
```

## Main Features

```text
Authentication with Sanctum tokens
Role management
Admin user management
Inventory CRUD
Inventory query filters
Pagination
Expiry tracking
Low stock detection
Reports
External API gateway integrations
Automatic alerts through Brevo and Telegram
Notification history
Activity logs / audit trail
```

## Gateway Pattern

```text
.env -> config/services.php -> service class -> controller -> validation request -> routes/api.php
```

## Setup

```bash
composer install
copy .env.example .env
php artisan key:generate
php artisan migrate
php artisan db:seed
php artisan config:clear
php artisan serve
```

Local base URL:

```text
http://127.0.0.1:8000/api
```

## Required Environment Keys

```env
OPENFOODFACTS_BASE_URI=https://world.openfoodfacts.org
OPENFOODFACTS_USER_AGENT=SmartInventoryAPI/1.0

USDA_BASE_URI=https://api.nal.usda.gov/fdc/v1
USDA_API_KEY=your_usda_key

THEMEALDB_BASE_URI=https://www.themealdb.com/api/json/v1
THEMEALDB_API_KEY=1

BREVO_BASE_URI=https://api.brevo.com/v3
BREVO_API_KEY=your_brevo_key
BREVO_SENDER_NAME="Smart Inventory"
BREVO_SENDER_EMAIL=your_verified_sender@email.com

TELEGRAM_BASE_URI=https://api.telegram.org
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_DEFAULT_CHAT_ID=your_chat_id
```

## Authentication

Protected routes require:

```text
Authorization: Bearer YOUR_TOKEN
Accept: application/json
Content-Type: application/json
```

## Important Routes

### Authentication

```text
GET  /api/health
POST /api/register
POST /api/login
GET  /api/me
POST /api/logout
```

### Inventory

```text
GET    /api/inventory?per_page=15
POST   /api/inventory
GET    /api/inventory/{id}
PUT    /api/inventory/{id}
DELETE /api/inventory/{id}
```

### Inventory Filters

```text
GET /api/inventory?search=rice
GET /api/inventory?status=low_stock
GET /api/inventory?status=out_of_stock
GET /api/inventory?status=in_stock
GET /api/inventory?status=expired
GET /api/inventory?status=expiring_soon&expires_within_days=30
GET /api/inventory?location=Shelf A
GET /api/inventory?barcode=3017620422003
GET /api/inventory?sort_by=expiration_date&sort_direction=asc
```

### Monitoring And Reports

```text
GET /api/inventory/expiring-soon?days=30
GET /api/inventory/expired
GET /api/inventory/low-stock
GET /api/reports/summary
GET /api/reports/stock-status
```

### External Integrations

```text
GET  /api/open-food-facts/{barcode}
POST /api/usda/lookup
POST /api/mealdb/search
POST /api/mealdb/filter-by-ingredient
POST /api/mealdb/lookup
POST /api/brevo/send-email
POST /api/telegram/send-alert
```

### Alerts And Logs

```text
POST /api/alerts/low-stock
POST /api/alerts/expiring-soon
GET  /api/notifications?per_page=10
GET  /api/notifications/{id}
GET  /api/activity-logs?per_page=10
GET  /api/activity-logs/{id}
```

### Admin

```text
GET    /api/admin/test
GET    /api/admin/roles
GET    /api/admin/users?per_page=10
GET    /api/admin/users/{id}
PUT    /api/admin/users/{id}/role
DELETE /api/admin/users/{id}
```

## Sample Request Bodies

### Login

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

### Create Inventory Item

```json
{
  "food_product_id": 1,
  "name": "Nutella",
  "barcode": "3017620422003",
  "quantity": 5,
  "unit": "pcs",
  "minimum_stock": 2,
  "location": "Shelf A",
  "expiration_date": "2026-12-31"
}
```

### USDA Lookup

```json
{
  "query": "banana",
  "page_size": 3,
  "page_number": 1,
  "data_type": ["Foundation"]
}
```

### Update User Role

```json
{
  "role": "admin"
}
```

## Verification Commands

```bash
php artisan route:list
php artisan migrate:status
php artisan config:clear
```

## Documentation

```text
API_DOCUMENTATION.md
BACKEND_README.md
Postman SmartExpiryItem collection docs
```
---

# Automated Test Coverage

The backend includes Laravel automated tests for the main Postman-ready API behavior.

Latest local result:

```bash
php artisan test
```

```text
11 tests passed
43 assertions
```

Covered areas:

```text
Authentication login, token usage, and current user profile
Inventory creation and inventory query filtering
Low-stock inventory status filtering
Reports summary endpoint
Notification history pagination
Activity log pagination
Admin-only access control
Admin role assignment validation, including already-admin checks
User soft delete and restore workflow
```

Test files:

```text
tests/Feature/CoreApiTest.php
tests/Feature/ManagementApiTest.php
```
