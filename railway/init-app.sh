#!/usr/bin/env sh
set -eu

php artisan migrate --force

if [ "${RAILWAY_SEED_DATABASE:-true}" = "true" ]; then
    php artisan db:seed --force
fi
