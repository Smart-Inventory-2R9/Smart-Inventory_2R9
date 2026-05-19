# Smart Inventory API Documentation

## Base URL

```text
http://127.0.0.1:8000/api
```

## Required Headers

Public routes:

```text
Accept: application/json
Content-Type: application/json
```

Protected routes:

```text
Authorization: Bearer YOUR_ACCESS_TOKEN
Accept: application/json
Content-Type: application/json
```

## Pagination

These list endpoints support pagination:

```text
GET /inventory?per_page=15
GET /notifications?per_page=15
GET /activity-logs?per_page=15
GET /admin/users?per_page=15
```

`per_page` accepts values from `1` to `100`.

Paginated responses include:

```text
current_page
data
first_page_url
last_page
next_page_url
per_page
total
```

---

# 1. Authentication

## GET /health

Checks if the API is running.

```http
GET {{base_url}}/health
```

## POST /register

Creates a user account and returns a Sanctum token.

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

## POST /login

Logs in and returns a Sanctum token.

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

## GET /me

Returns the authenticated user.

## POST /logout

Deletes the current token.

---

# 2. Inventory CRUD

All routes require Bearer token.

```http
GET    /inventory
POST   /inventory
GET    /inventory/{id}
PUT    /inventory/{id}
DELETE /inventory/{id}
```

## POST /inventory Body

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

---

# 3. Inventory Query Filters

`GET /inventory` supports query parameters for searching, filtering, sorting, and pagination.

```http
GET /inventory?search=rice
GET /inventory?status=low_stock
GET /inventory?status=out_of_stock
GET /inventory?status=in_stock
GET /inventory?status=expired
GET /inventory?status=expiring_soon&expires_within_days=30
GET /inventory?location=Shelf A
GET /inventory?barcode=3017620422003
GET /inventory?sort_by=expiration_date&sort_direction=asc
GET /inventory?status=low_stock&per_page=5
```

Available parameters:

```text
search
status
expires_within_days
location
barcode
sort_by
sort_direction
per_page
```

---

# 4. Expiry And Stock Monitoring

```http
GET /inventory/expiring-soon?days=30
GET /inventory/expired
GET /inventory/low-stock
```

`/inventory/low-stock` returns items where:

```text
quantity <= minimum_stock
```

---

# 5. Reports

```http
GET /reports/summary
GET /reports/stock-status
```

`/reports/summary` returns counts for total items, total quantity, low stock, out of stock, expired, and expiring soon.

`/reports/stock-status` groups items into:

```text
out_of_stock
low_stock
in_stock
```

---

# 6. External API Gateway Integrations

These routes call external services through the Laravel backend.

## Open Food Facts

```http
GET /open-food-facts/3017620422003
```

Looks up product data by barcode and saves/updates it locally.

## USDA FoodData Central

```http
POST /usda/lookup
```

Body:

```json
{
  "query": "banana",
  "page_size": 3,
  "page_number": 1,
  "data_type": ["Foundation"]
}
```

## TheMealDB

```http
POST /mealdb/search
POST /mealdb/filter-by-ingredient
POST /mealdb/lookup
```

Search body:

```json
{
  "query": "Arrabiata"
}
```

Ingredient body:

```json
{
  "ingredient": "chicken_breast"
}
```

Lookup body:

```json
{
  "meal_id": "52772"
}
```

## Brevo Email API

```http
POST /brevo/send-email
```

Body:

```json
{
  "to_email": "your_test_email@gmail.com",
  "to_name": "Test User",
  "subject": "Smart Inventory Test Email",
  "html_content": "<h2>Smart Inventory Alert</h2><p>This is a test email.</p>"
}
```

## Telegram Bot API

```http
POST /telegram/send-alert
```

Body:

```json
{
  "chat_id": "YOUR_CHAT_ID",
  "message": "Smart Inventory test alert."
}
```

---

# 7. Automatic Alerts

Automatic alerts use inventory data and send through Brevo and/or Telegram.

```http
POST /alerts/low-stock
POST /alerts/expiring-soon
```

Telegram only:

```json
{
  "channels": ["telegram"],
  "chat_id": "YOUR_CHAT_ID"
}
```

Email and Telegram:

```json
{
  "channels": ["email", "telegram"],
  "to_email": "your@email.com",
  "to_name": "Test User",
  "chat_id": "YOUR_CHAT_ID"
}
```

Expiring soon with custom days:

```json
{
  "channels": ["telegram"],
  "chat_id": "YOUR_CHAT_ID",
  "days": 30
}
```

---

# 8. Notification History

Notification logs are created when automatic alerts send through Brevo or Telegram.

```http
GET /notifications?per_page=10
GET /notifications/{id}
```

Stored fields include:

```text
type
channel
recipient
subject
message
status_code
status
response
sent_at
```

---

# 9. Activity Logs

Activity logs track important user actions.

```http
GET /activity-logs?per_page=10
GET /activity-logs/{id}
```

Logged actions include:

```text
inventory created
inventory updated
inventory deleted
low stock alert triggered
expiring soon alert triggered
admin user role updated
admin user deleted
admin user restored
```

---

# 10. Admin Management

Admin routes require an admin Bearer token.

```http
GET    /admin/test
GET    /admin/roles
GET    /admin/users?per_page=10
GET    /admin/users/deleted
GET    /admin/users/{id}
PUT    /admin/users/{id}/role
DELETE /admin/users/{id}
PUT    /admin/users/{id}/restore
```

## PUT /admin/users/{id}/role

By role name:

```json
{
  "role": "admin"
}
```

By role ID:

```json
{
  "role_id": 1
}
```

If the selected user already has the role, API returns `422`.

---

# 11. Environment Keys

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

After changing `.env`:

```bash
php artisan config:clear
```

---

# 12. Common Status Codes

```text
200 OK - request successful
201 Created - resource created
400 Bad Request - external API rejected request
401 Unauthenticated - missing or invalid Bearer token
403 Forbidden - authenticated but not allowed
404 Not Found - record or route not found
422 Unprocessable Content - validation error
500 Server Error - backend or configuration issue
```

---

# 13. Suggested Postman Demo Order

```text
1. GET /health
2. POST /login
3. GET /me
4. GET /open-food-facts/3017620422003
5. POST /usda/lookup
6. POST /mealdb/search
7. POST /telegram/send-alert
8. POST /inventory
9. GET /inventory?status=low_stock&per_page=5
10. GET /reports/summary
11. POST /alerts/low-stock
12. GET /notifications?per_page=10
13. GET /activity-logs?per_page=10
14. GET /admin/users?per_page=10
15. POST /logout
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
