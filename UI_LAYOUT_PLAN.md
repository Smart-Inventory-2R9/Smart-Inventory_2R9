# SmartExpiryItem UI Layout Plan

This is a no-code planning document for the future UI phase.

The backend is already API-ready. The UI should consume the existing Laravel API routes without changing backend behavior.

## Recommended Frontend Approach

Use Laravel Blade with Vite and Tailwind first.

Reasons:

```text
Laravel already includes Blade
Vite is already configured
Tailwind dependencies already exist
No separate frontend project needed yet
Good fit for school demo and fast iteration
```

## Layout Structure

Recommended app layout:

```text
Top bar
Sidebar navigation
Main content area
Optional page header
Reusable table/form sections
```

## Public Pages

These pages do not require login.

```text
Login
Register
```

### Login Page

Main actions:

```text
Enter email
Enter password
Submit login
Save Bearer token after successful login
Redirect to dashboard
```

Uses:

```http
POST /api/login
GET /api/me
```

### Register Page

Main actions:

```text
Enter name
Enter email
Enter password
Confirm password
Submit registration
Save Bearer token after successful registration
Redirect to dashboard
```

Uses:

```http
POST /api/register
GET /api/me
```

## Authenticated Pages

These pages require a valid Bearer token.

```text
Dashboard
Inventory
Expiring Soon
Expired Items
Low Stock
External Food Lookup
Reports
Alerts
Notification History
Activity Logs
Profile / Logout
```

## Admin-Only Pages

These pages require an authenticated user with the admin role.

```text
Admin Users
Deleted Users
Role Management
```

## Sidebar Navigation

Recommended sidebar items:

```text
Dashboard
Inventory
Expiring Soon
Expired Items
Low Stock
Food Lookup
Reports
Alerts
Notifications
Activity Logs
Admin Users
Logout
```

Hide `Admin Users` unless the authenticated user has the admin role.

## Dashboard Layout

Purpose: give a quick inventory health overview.

Suggested sections:

```text
Summary counters
Low-stock preview
Expiring-soon preview
Recent notifications
Recent activity logs
```

API routes:

```http
GET /api/reports/summary
GET /api/reports/stock-status
GET /api/inventory/low-stock
GET /api/inventory/expiring-soon?days=30
GET /api/notifications?per_page=5
GET /api/activity-logs?per_page=5
```

## Inventory Page Layout

Purpose: main inventory management page.

Suggested sections:

```text
Search input
Status filter
Location filter
Sort controls
Inventory table
Create item button
Edit/delete row actions
Pagination controls
```

API routes:

```http
GET /api/inventory
POST /api/inventory
GET /api/inventory/{id}
PUT /api/inventory/{id}
DELETE /api/inventory/{id}
```

## Inventory Form Fields

Use the same fields for create and edit forms.

```text
Name
Barcode
Quantity
Unit
Minimum stock
Location
Expiration date
Food product ID
```

## Food Lookup Page Layout

Purpose: search external services and help fill product information.

Suggested sections:

```text
Barcode lookup panel
USDA search panel
MealDB search panel
Result preview
Copy-to-inventory action
```

API routes:

```http
GET /api/open-food-facts/{barcode}
POST /api/usda/lookup
POST /api/mealdb/search
POST /api/mealdb/filter-by-ingredient
POST /api/mealdb/lookup
```

## Alerts Page Layout

Purpose: manually send alerts and trigger inventory-based alerts.

Suggested sections:

```text
Telegram test alert form
Brevo email test form
Low-stock alert trigger
Expiring-soon alert trigger
Channel selector
```

API routes:

```http
POST /api/telegram/send-alert
POST /api/brevo/send-email
POST /api/alerts/low-stock
POST /api/alerts/expiring-soon
```

## Notification History Layout

Purpose: view sent/failed notification attempts.

Suggested table columns:

```text
Type
Channel
Recipient
Subject
Status
Status code
Sent date
View details
```

API routes:

```http
GET /api/notifications?per_page=10
GET /api/notifications/{id}
```

## Activity Logs Layout

Purpose: view important backend actions.

Suggested table columns:

```text
Action
Module
Description
User
Created date
View details
```

API routes:

```http
GET /api/activity-logs?per_page=10
GET /api/activity-logs/{id}
```

## Admin Users Layout

Purpose: manage users and roles.

Suggested sections:

```text
Users table
Role selector
Deleted users table
Restore user action
Soft delete action
```

API routes:

```http
GET /api/admin/roles
GET /api/admin/users?per_page=10
GET /api/admin/users/deleted
GET /api/admin/users/{id}
PUT /api/admin/users/{id}/role
DELETE /api/admin/users/{id}
PUT /api/admin/users/{id}/restore
```

## UI State Rules

```text
If no token, show login/register only
If token exists, call GET /api/me
If GET /api/me fails, clear token and return to login
If user role is admin, show admin navigation
If user role is staff, hide admin navigation
```

## Recommended Build Order

```text
1. Base Blade layout
2. Login page
3. Register page
4. Token storage helper
5. Authenticated dashboard page
6. Inventory list page
7. Inventory create/edit modal or page
8. Monitoring pages
9. External lookup page
10. Alerts and notification history pages
11. Activity logs page
12. Admin user management pages
```

## Notes

- Do not expose external API keys in frontend code.
- Keep all external API calls behind Laravel API routes.
- Keep UI simple first; Postman remains the source of truth for backend testing.
- Build UI after backend routes are stable.