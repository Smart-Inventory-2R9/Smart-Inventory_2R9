# SmartExpiryItem Backend API

SmartExpiryItem is a Laravel backend API for smart inventory management. The project focuses on API-first development and Postman testing before UI work.

## Current Phase

Phase 4: Testing, documentation, and backend cleanup.

The main backend features are already implemented. Current work focuses on making the project clean for demo, handoff, and future frontend development.

## Backend Scope

The API supports:

- Laravel Sanctum authentication
- Role-based access control
- Admin-only user management
- Inventory CRUD
- Inventory search, filtering, sorting, and pagination
- Expiry and low-stock monitoring
- Report endpoints
- External food API integrations
- Brevo email alerts
- Telegram bot alerts
- Notification history
- Activity logs
- Soft delete and restore workflows
- Automated feature tests

## Gateway Pattern

This project follows the API gateway style:

```text
.env
-> config/services.php
-> app/Services
-> app/Http/Controllers
-> app/Http/Requests
-> routes/api.php
-> Postman testing/documentation
```

External API credentials stay in `.env`, are loaded through `config/services.php`, then used by service classes. Controllers stay thin and delegate work to services. Request validation runs before service calls.

## External Integrations

Configured integrations:

- Open Food Facts
- USDA FoodData Central
- TheMealDB
- Brevo Email API
- Telegram Bot API

Postman calls the Laravel backend first. Laravel then calls the external APIs through service classes.

```text
Postman -> Laravel API -> Service Class -> External API
```

## Main API Areas

```text
01 Authentication
02 Inventory CRUD
03 Expiry & Stock Monitoring
04 Reports
05 External Integrations
06 Alerts & Notifications
07 Notification History
08 Activity Logs
09 Admin User Management
10 Inventory Query String Filters
```

## Setup

Install dependencies:

```bash
composer install
npm install
```

Create environment file and key if needed:

```bash
copy .env.example .env
php artisan key:generate
```

Run migrations and seed demo data:

```bash
php artisan migrate
php artisan db:seed --force
```

Start the API server:

```bash
php artisan serve
```

Local base URL:

```text
http://127.0.0.1:8000
```

## Demo Users

Seeded accounts:

```text
admin@example.com / password123
test@example.com / password123
```

Use `admin@example.com` for admin-only routes.
Use `test@example.com` for normal inventory testing.

## Important Commands

List API routes:

```bash
php artisan route:list --path=api
```

Run tests:

```bash
php artisan test
```

Current verified test result:

```text
11 tests passed
43 assertions
```

Run seeder:

```bash
php artisan db:seed --force
```

## Documentation Files

Detailed backend documents:

```text
API_DOCUMENTATION.md
BACKEND_README.md
POSTMAN_DEMO_GUIDE.md
postman/README.md
```

## Postman Notes

Use Bearer token authentication for protected routes.

Recommended collection variables:

```text
laravel_local = http://127.0.0.1:8000
authToken = token from login response
inventoryId = existing inventory item ID
barcode = 3017620422003
```

## Current Status

Verified working:

```text
php artisan route:list --path=api
php artisan db:seed --force
php artisan test
```

The backend is ready for Postman demo and continued cleanup before UI development.