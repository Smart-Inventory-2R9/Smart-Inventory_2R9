# SmartExpiryItem UI Screen Mapping

This document maps future frontend screens to the existing Laravel backend API routes.

No UI is implemented here. This is only a planning guide for the next phase.

## Frontend Goal

Build a user interface that consumes the existing API instead of changing backend behavior.

```text
UI -> Laravel API -> Services / Database / External APIs
```

## Authentication Screens

### Login Screen

Purpose: allow existing users to log in and receive a Sanctum Bearer token.

API routes:

```http
POST /api/login
GET /api/me
```

### Register Screen

Purpose: create a new staff user account.

API routes:

```http
POST /api/register
GET /api/me
```

### Logout Action

Purpose: invalidate the current access token.

API route:

```http
POST /api/logout
```

## Dashboard Screen

Purpose: show a quick summary of inventory health.

API routes:

```http
GET /api/reports/summary
GET /api/reports/stock-status
GET /api/inventory/low-stock
GET /api/inventory/expiring-soon?days=30
GET /api/inventory/expired
```

Suggested dashboard data:

```text
Total items
Total quantity
Low-stock count
Out-of-stock count
Expired count
Expiring-soon count
Recent alerts
Recent activity logs
```

## Inventory Screens

### Inventory List Screen

Purpose: display inventory items with search, filters, sorting, and pagination.

API routes:

```http
GET /api/inventory
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

### Create Inventory Screen

Purpose: add a new inventory item.

API route:

```http
POST /api/inventory
```

Main fields:

```text
name
barcode
quantity
unit
minimum_stock
location
expiration_date
food_product_id
```

### Edit Inventory Screen

Purpose: update an existing inventory item.

API routes:

```http
GET /api/inventory/{id}
PUT /api/inventory/{id}
```

### Delete Inventory Action

Purpose: soft delete an inventory item.

API route:

```http
DELETE /api/inventory/{id}
```

## Expiry And Stock Monitoring Screens

### Expiring Soon Screen

Purpose: show items nearing expiration.

API route:

```http
GET /api/inventory/expiring-soon?days=30
```

### Expired Items Screen

Purpose: show already expired items.

API route:

```http
GET /api/inventory/expired
```

### Low Stock Screen

Purpose: show items where quantity is less than or equal to minimum stock.

API route:

```http
GET /api/inventory/low-stock
```

## External Food Lookup Screen

Purpose: search external food sources and use food data to help fill inventory details.

API routes:

```http
GET /api/open-food-facts/{barcode}
POST /api/usda/lookup
POST /api/mealdb/search
POST /api/mealdb/filter-by-ingredient
POST /api/mealdb/lookup
```

Suggested UI behavior:

```text
Scan or enter barcode
Lookup Open Food Facts product
Search USDA by keyword
Search MealDB recipes by name or ingredient
Show returned food metadata
Allow user to copy selected data into inventory form
```

## Alerts And Notifications Screen

Purpose: send manual alerts and trigger inventory-based alerts.

API routes:

```http
POST /api/telegram/send-alert
POST /api/brevo/send-email
POST /api/alerts/low-stock
POST /api/alerts/expiring-soon
```

Suggested UI actions:

```text
Send Telegram test alert
Send Brevo email test
Trigger low-stock alert
Trigger expiring-soon alert
Choose alert channels: email, telegram, or both
```

## Notification History Screen

Purpose: show saved email and Telegram alert attempts.

API routes:

```http
GET /api/notifications?per_page=10
GET /api/notifications/{id}
```

Suggested columns:

```text
Type
Channel
Recipient
Subject
Status
Status code
Sent date
```

## Activity Logs Screen

Purpose: show backend action history.

API routes:

```http
GET /api/activity-logs?per_page=10
GET /api/activity-logs/{id}
```

Suggested columns:

```text
Action
Module
Description
User
Created date
```

## Admin User Management Screens

Admin routes require an authenticated admin Bearer token.

### Users List Screen

Purpose: allow admins to view users.

API routes:

```http
GET /api/admin/users?per_page=10
GET /api/admin/users/{id}
```

### Role Management Action

Purpose: allow admins to assign roles.

API routes:

```http
GET /api/admin/roles
PUT /api/admin/users/{id}/role
```

### Deleted Users Screen

Purpose: view and restore soft-deleted users.

API routes:

```http
GET /api/admin/users/deleted
PUT /api/admin/users/{id}/restore
```

### Delete User Action

Purpose: soft delete a user.

API route:

```http
DELETE /api/admin/users/{id}
```

## Suggested UI Build Order

```text
1. Login and token handling
2. Dashboard shell
3. Inventory list
4. Create/edit inventory forms
5. Expiry and stock monitoring pages
6. Reports widgets
7. External food lookup page
8. Alerts and notification history
9. Activity logs
10. Admin user management
```

## Notes For Future UI Work

- Store the Bearer token after login.
- Send `Authorization: Bearer {token}` on protected API requests.
- Keep admin screens hidden unless the logged-in user has the admin role.
- Keep external API calls behind Laravel routes.
- Do not expose API keys in frontend code.
- Use Postman response examples as the first frontend data reference.