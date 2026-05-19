# SmartExpiryItem Presentation Demo Checklist

Use this as the final run order for the instructor demo.

## Current Status

- Backend API: complete
- External service gateway calls: complete
- Postman collection/docs: ready
- Laravel UI demo: ready
- API route count: 36 API routes
- Test suite: 11 tests / 43 assertions passing

## Before Demo

Start the Laravel server:

```bash
php artisan serve --host=127.0.0.1 --port=8000
```

Optional verification:

```bash
php artisan test
php artisan route:list --path=api
```

Seed demo data only if needed:

```bash
php artisan db:seed --force
```

Demo accounts:

```text
Admin: admin@example.com / password123
Staff: test@example.com / password123
```

## Postman Demo Order

1. Health check
   - `GET /api/health`
   - Expected: API returns `status: ok`

2. Login
   - `POST /api/login`
   - Use `admin@example.com / password123`
   - Copy returned Bearer token into Authorization.

3. External service from gateway
   - `GET /api/open-food-facts/3017620422003`
   - `POST /api/usda/lookup`
   - `POST /api/mealdb/search`
   - `POST /api/telegram/send-alert`
   - `POST /api/brevo/send-email`

4. Inventory CRUD
   - `POST /api/inventory`
   - `GET /api/inventory`
   - `GET /api/inventory/{id}`
   - `PUT /api/inventory/{id}`
   - `DELETE /api/inventory/{id}`

5. Monitoring and reports
   - `GET /api/inventory/expiring-soon`
   - `GET /api/inventory/expired`
   - `GET /api/inventory/low-stock`
   - `GET /api/reports/summary`
   - `GET /api/reports/stock-status`

6. Admin management
   - `GET /api/admin/users`
   - `PUT /api/admin/users/{id}/role`
   - `DELETE /api/admin/users/{id}`
   - `PUT /api/admin/users/{id}/restore`

## UI Demo Order

Open:

```text
http://127.0.0.1:8000/
```

1. Login as admin.
2. Show Dashboard: API health, user session, role, and inventory counts.
3. Show Inventory: create, edit, filter, and delete item.
4. Show Monitoring: expiring soon, expired, low stock.
5. Show Reports: summary, stock buckets, activity logs, notification logs.
6. Show Food Lookup: Open Food Facts, USDA, and MealDB.
7. Show Alerts: Telegram, Brevo, low-stock alert, expiring-soon alert.
8. Show Admin Users: update role, soft delete, restore.

## What To Say

SmartExpiryItem is a Laravel API-first inventory system. It follows the gateway pattern:

```text
.env -> config/services.php -> service class -> controller -> validation request -> routes
```

The system integrates external services through backend gateway endpoints instead of calling them directly from the client. Postman proves the API layer, and the Laravel UI demonstrates how the system can consume the same backend.

## Fallback Plan

If one external service fails:

- Show `GET /api/open-food-facts/3017620422003` first because it does not need a private API key.
- Check `.env` values for USDA, Brevo, and Telegram.
- Show the UI error response box to prove the backend handles external API failures cleanly.
- Continue with inventory, reports, and admin management.

## What Is Left After Presentation

These are optional future improvements, not required for the current demo:

- Better visual design and mobile polish
- Deployment setup
- More automated browser/UI tests
- Advanced dashboard charts
- More granular staff permissions
- Export reports to CSV/PDF
