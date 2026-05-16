<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'openfoodfacts' => [
        'base_uri' => env('OPENFOODFACTS_BASE_URI', 'https://world.openfoodfacts.org'),
        'user_agent' => env('OPENFOODFACTS_USER_AGENT', 'SmartInventoryAPI/1.0'),
    ],

    'usda' => [
        'base_uri' => env('USDA_BASE_URI', 'https://api.nal.usda.gov/fdc/v1'),
        'api_key' => env('USDA_API_KEY'),
    ],

    'brevo' => [
        'base_uri' => env('BREVO_BASE_URI', 'https://api.brevo.com/v3'),
        'api_key' => env('BREVO_API_KEY'),
        'sender_name' => env('BREVO_SENDER_NAME', 'Smart Inventory'),
        'sender_email' => env('BREVO_SENDER_EMAIL', 'no-reply@example.com'),
    ],

    'telegram' => [
        'base_uri' => env('TELEGRAM_BASE_URI', 'https://api.telegram.org'),
        'bot_token' => env('TELEGRAM_BOT_TOKEN'),
        'default_chat_id' => env('TELEGRAM_DEFAULT_CHAT_ID'),
    ],

];