# Railway Deployment Guide

This project is ready to deploy as a Laravel app on Railway.

## What Was Added

- `railway.json`
  - Uses Railway Railpack builder.
  - Runs the Laravel pre-deploy script.
  - Uses `/api/health` as the health check.

- `railway/init-app.sh`
  - Runs `php artisan migrate --force`.
  - Runs `php artisan db:seed --force` by default for demo data.

- Route-cache-safe routes
  - `/api/health` now uses `HealthController`.
  - `/api/admin/test` now uses `AdminTestController`.
  - `/` now uses `Route::view`.

## Railway Project Setup

1. Push this project to GitHub.
2. In Railway, create a project.
3. Add a **MySQL** database service.
4. Add a new app service from your GitHub repo.
5. In the app service, open **Variables** and paste the variables below.
6. Deploy.
7. In the app service **Networking** tab, click **Generate Domain**.
8. Update `APP_URL` to the generated Railway URL and redeploy.

## Required App Variables

Use Railway's Raw Editor.

```text
APP_NAME="SmartExpiryItem"
APP_ENV=production
APP_KEY=REPLACE_WITH_php_artisan_key_generate_show
APP_DEBUG=false
APP_URL=https://your-generated-domain.up.railway.app

LOG_CHANNEL=stderr
LOG_STDERR_FORMATTER=Monolog\Formatter\JsonFormatter
LOG_LEVEL=info

DB_CONNECTION=mysql
DB_URL=${{MySQL.MYSQL_URL}}

SESSION_DRIVER=database
CACHE_STORE=database
QUEUE_CONNECTION=database

RAILPACK_PHP_EXTENSIONS=pdo_mysql,curl
RAILWAY_SEED_DATABASE=true
```

If your MySQL service is not named `MySQL`, replace `MySQL` in `${{MySQL.MYSQL_URL}}` with the exact Railway service name.

Generate `APP_KEY` locally:

```bash
php artisan key:generate --show
```

## External Integration Variables

Paste your real keys from local `.env`.

```text
OPENFOODFACTS_BASE_URI=https://world.openfoodfacts.org
OPENFOODFACTS_USER_AGENT=SmartInventoryAPI/1.0

USDA_BASE_URI=https://api.nal.usda.gov/fdc/v1
USDA_API_KEY=your_usda_key

BREVO_BASE_URI=https://api.brevo.com/v3
BREVO_API_KEY=your_brevo_key
BREVO_SENDER_NAME="Smart Inventory"
BREVO_SENDER_EMAIL=your_verified_brevo_sender_email

TELEGRAM_BASE_URI=https://api.telegram.org
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_DEFAULT_CHAT_ID=your_telegram_chat_id

THEMEALDB_BASE_URI=https://www.themealdb.com/api/json/v1
THEMEALDB_API_KEY=1
```

## After First Successful Deploy

Open these URLs:

```text
https://your-generated-domain.up.railway.app/
https://your-generated-domain.up.railway.app/api/health
```

Demo login:

```text
admin@example.com / password123
test@example.com / password123
```

After the demo, you may set this to avoid reseeding demo accounts on every deploy:

```text
RAILWAY_SEED_DATABASE=false
```

## Troubleshooting

If deploy fails during migration:

- Confirm MySQL service exists.
- Confirm `DB_CONNECTION=mysql`.
- Confirm `DB_URL=${{MySQL.MYSQL_URL}}`.
- Confirm the app service and MySQL service are in the same Railway project/environment.

If the app opens but external APIs fail:

- Check USDA, Brevo, and Telegram keys in Railway Variables.
- Open `/api/health` first to confirm Laravel is running.
- Open the UI Food Lookup or Alerts page to see the backend error response.

If the UI does not update:

- Redeploy the app service.
- Confirm `public/ui.js` and `public/ui.css` are committed.
