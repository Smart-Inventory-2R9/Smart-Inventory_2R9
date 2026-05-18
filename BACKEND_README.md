# SmartExpiryItem Backend README

SmartExpiryItem is a Laravel backend API for smart inventory management, expiry tracking, food data lookup, reporting, and alert notifications.

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
Inventory CRUD
Expiry tracking
Low stock detection
Reports
External API gateway integrations
Automatic alerts through Brevo and Telegram
```

## External Integrations

The backend calls these external services through Laravel service classes:

```text
Open Food Facts API - barcode product lookup
USDA FoodData Central API - food and nutrition lookup
TheMealDB API - recipe search and meal lookup
Brevo Email API - transactional email alerts
Telegram Bot API - Telegram alert messages
```

## Gateway Pattern

The project follows this backend style:

```text
.env -> config/services.php -> service class -> controller -> validation request -> routes/api.php
```

## Setup

Install dependencies:

```bash
composer install
```

Copy environment file if needed:

```bash
copy .env.example .env
```

Generate app key:

```bash
php artisan key:generate
```

Run migrations:

```bash
php artisan migrate
```

Seed roles:

```bash
php artisan db:seed
```

Clear config cache after editing `.env`:

```bash
php artisan config:clear
```

Run local server:

```bash
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

Login or register first to get a Bearer token.

Protected routes require:

```text
Authorization: Bearer YOUR_TOKEN
Accept: application/json
Content-Type: application/json
```

## Important API Routes

### Authentication

```text
GET  /api/health
POST /api/register
POST /api/login
GET  /api/me
POST /api/logout
GET  /api/admin/test
```

### Inventory CRUD

```text
GET    /api/inventory
POST   /api/inventory
GET    /api/inventory/{id}
PUT    /api/inventory/{id}
DELETE /api/inventory/{id}
```

### Expiry And Stock Monitoring

```text
GET /api/inventory/expiring-soon?days=30
GET /api/inventory/expired
GET /api/inventory/low-stock
```

### Reports

```text
GET /api/reports/summary
GET /api/reports/stock-status
```

### External API Gateway Routes

```text
GET  /api/open-food-facts/{barcode}
POST /api/usda/lookup
POST /api/mealdb/search
POST /api/mealdb/filter-by-ingredient
POST /api/mealdb/lookup
POST /api/brevo/send-email
POST /api/telegram/send-alert
```

### Automatic Alerts

```text
POST /api/alerts/low-stock
POST /api/alerts/expiring-soon
```

## Suggested Postman Demo Order

```text
1. GET /api/health
2. POST /api/register or POST /api/login
3. Copy token into Postman variable
4. GET /api/me
5. GET /api/open-food-facts/3017620422003
6. POST /api/usda/lookup
7. POST /api/mealdb/search
8. POST /api/telegram/send-alert
9. POST /api/brevo/send-email
10. POST /api/inventory
11. GET /api/inventory
12. GET /api/inventory/low-stock
13. GET /api/inventory/expiring-soon?days=30
14. GET /api/reports/summary
15. POST /api/alerts/low-stock
16. POST /api/logout
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

### TheMealDB Search

```json
{
  "query": "Arrabiata"
}
```

### Telegram Alert

```json
{
  "chat_id": "YOUR_CHAT_ID",
  "message": "Smart Inventory test alert."
}
```

### Brevo Email

```json
{
  "to_email": "your_test_email@gmail.com",
  "to_name": "Test User",
  "subject": "Smart Inventory Test Email",
  "html_content": "<h2>Smart Inventory Alert</h2><p>This is a test email.</p>"
}
```

### Automatic Low Stock Alert

```json
{
  "channels": ["telegram"],
  "chat_id": "YOUR_CHAT_ID"
}
```

## Common Status Codes

```text
200 OK - successful request
201 Created - record created
400 Bad Request - external API rejected request
401 Unauthenticated - missing or invalid token
403 Forbidden - user does not have permission
404 Not Found - route or record not found
422 Unprocessable Content - validation error
500 Server Error - backend or configuration issue
```

## Verification Commands

```bash
php artisan route:list
php artisan migrate:status
php artisan config:clear
```

## Documentation

Postman documentation is prepared in the `SmartExpiryItem` collection.

A markdown API reference is also available in:

```text
API_DOCUMENTATION.md
```