# Smart Inventory API Documentation

## Base URL

Local development:

```text
http://127.0.0.1:8000/api
```

## Required Headers

For public routes:

```text
Accept: application/json
Content-Type: application/json
```

For protected routes:

```text
Authorization: Bearer YOUR_ACCESS_TOKEN
Accept: application/json
Content-Type: application/json
```

## Authentication Flow

1. Register or login.
2. Copy the `token` from the response.
3. Use the token as Bearer Token for protected API requests.

---

# 1. Health Check

## GET /health

Checks if the API is running.

```http
GET {{base_url}}/health
```

Expected response:

```json
{
  "status": "ok",
  "app": "Laravel"
}
```

---

# 2. Authentication

## POST /register

Creates a new user account.

```http
POST {{base_url}}/register
```

Body:

```json
{
  "name": "Test User",
  "email": "test@example.com",
  "password": "password123",
  "password_confirmation": "password123"
}
```

Expected response: `201 Created`

```json
{
  "message": "Registered successfully",
  "user": {},
  "token": "1|token_here"
}
```

## POST /login

Logs in an existing user.

```http
POST {{base_url}}/login
```

Body:

```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

Expected response: `200 OK`

```json
{
  "message": "Logged in successfully",
  "user": {},
  "token": "1|token_here"
}
```

## GET /me

Returns the currently authenticated user.

```http
GET {{base_url}}/me
```

Requires Bearer token.

Expected response:

```json
{
  "user": {
    "id": 1,
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

## POST /logout

Deletes the current access token.

```http
POST {{base_url}}/logout
```

Requires Bearer token.

Expected response:

```json
{
  "message": "Logged out successfully"
}
```

---

# 3. Inventory CRUD

All inventory routes require Bearer token.

## GET /inventory

Returns all inventory items owned by the authenticated user.

```http
GET {{base_url}}/inventory
```

## POST /inventory

Creates an inventory item.

```http
POST {{base_url}}/inventory
```

Body:

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

Expected response: `201 Created`

```json
{
  "message": "Inventory item created",
  "data": {}
}
```

## GET /inventory/{id}

Returns one inventory item.

```http
GET {{base_url}}/inventory/1
```

## PUT /inventory/{id}

Updates an inventory item.

```http
PUT {{base_url}}/inventory/1
```

Body:

```json
{
  "quantity": 3,
  "minimum_stock": 5,
 "location": "Shelf B"
}
```

## DELETE /inventory/{id}

Deletes an inventory item.

```http
DELETE {{base_url}}/inventory/1
```

Expected response:

```json
{
  "message": "Inventory item deleted"
}
```

---

# 4. Expiry And Stock Monitoring

## GET /inventory/expiring-soon

Returns items expiring within a selected number of days.

```http
GET {{base_url}}/inventory/expiring-soon?days=30
```

Expected response:

```json
{
  "days": 30,
  "data": []
}
```

## GET /inventory/expired

Returns expired inventory items.

```http
GET {{base_url}}/inventory/expired
```

## GET /inventory/low-stock

Returns items where `quantity <= minimum_stock`.

```http
GET {{base_url}}/inventory/low-stock
```

---

# 5. Reports

## GET /reports/summary

Returns inventory summary counts.

```http
GET {{base_url}}/reports/summary
```

Expected response:

```json
{
  "data": {
    "total_items": 10,
    "total_quantity": 50,
    "out_of_stock_count": 1,
    "low_stock_count": 2,
    "expired_count": 1,
    "expiring_soon_count": 3
  }
}
```

## GET /reports/stock-status

Returns grouped stock status lists.

```http
GET {{base_url}}/reports/stock-status
```

Expected response:

```json
{
  "data": {
    "out_of_stock": [],
    "low_stock": [],
    "in_stock": []
  }
}
```

---

# 6. External API Gateway Integrations

These routes prove the Laravel backend is calling external services from the gateway.

## Open Food Facts

### GET /open-food-facts/{barcode}

Looks up product details by barcode and saves/updates the product in `food_products`.

```http
GET {{base_url}}/open-food-facts/3017620422003
```

Expected response:

```json
{
  "message": "Product found",
  "food_product": {
    "barcode": "3017620422003",
    "product_name": "Nutella"
  }
}
```

## USDA FoodData Central

### POST /usda/lookup

Searches food/nutrition data from USDA FoodData Central.

```http
POST {{base_url}}/usda/lookup
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

Expected response includes:

```json
{
  "foods": []
}
```

## TheMealDB

### POST /mealdb/search

Searches recipes by meal name.

```http
POST {{base_url}}/mealdb/search
```

Body:

```json
{
  "query": "Arrabiata"
}
```

### POST /mealdb/filter-by-ingredient

Finds recipes by ingredient.

```http
POST {{base_url}}/mealdb/filter-by-ingredient
```

Body:

```json
{
  "ingredient": "chicken_breast"
}
```

### POST /mealdb/lookup

Looks up a recipe by meal ID.

```http
POST {{base_url}}/mealdb/lookup
```

Body:

```json
{
  "meal_id": "52772"
}
```

## Brevo Email API

### POST /brevo/send-email

Sends an email through Brevo.

```http
POST {{base_url}}/brevo/send-email
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

Expected response:

```json
{
  "messageId": "message_id_here"
}
```

## Telegram Bot API

### POST /telegram/send-alert

Sends a Telegram message through the configured bot.

```http
POST {{base_url}}/telegram/send-alert
```

Body:

```json
{
  "chat_id": "YOUR_CHAT_ID",
  "message": "Smart Inventory test alert."
}
```

Expected response:

```json
{
  "ok": true,
  "result": {}
}
```

---

# 7. Automatic Alerts

Automatic alert routes use existing inventory data and send through Brevo and/or Telegram.

## POST /alerts/low-stock

Sends alert for low-stock inventory items.

```http
POST {{base_url}}/alerts/low-stock
```

Telegram only body:

```json
{
  "channels": ["telegram"],
  "chat_id": "YOUR_CHAT_ID"
}
```

Email + Telegram body:

```json
{
  "channels": ["email", "telegram"],
  "to_email": "your@email.com",
  "to_name": "Test User",
  "chat_id": "YOUR_CHAT_ID"
}
```

## POST /alerts/expiring-soon

Sends alert for items expiring soon.

```http
POST {{base_url}}/alerts/expiring-soon
```

Body:

```json
{
  "channels": ["telegram"],
  "chat_id": "YOUR_CHAT_ID",
  "days": 30
}
```

---

# 8. Admin Test

## GET /admin/test

Checks admin-only access.

```http
GET {{base_url}}/admin/test
```

Expected staff response:

```json
{
  "message": "Forbidden"
}
```

Expected admin response:

```json
{
  "message": "Admin access granted"
}
```

---

# 9. Environment Keys

Add these to `.env`:

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

After changing `.env`, run:

```bash
php artisan config:clear
```

---

# 10. Common Status Codes

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

# 11. Suggested Postman Demo Order

```text
1. GET /health
2. POST /register
3. POST /login
4. GET /me
5. GET /open-food-facts/3017620422003
6. POST /usda/lookup
7. POST /mealdb/search
8. POST /telegram/send-alert
9. POST /brevo/send-email
10. POST /inventory
11. GET /inventory
12. GET /inventory/low-stock
13. GET /inventory/expiring-soon?days=30
14. GET /reports/summary
15. POST /alerts/low-stock
16. POST /logout
```