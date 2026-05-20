<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'SmartExpiryItem') }}</title>
    <link rel="preconnect" href="https://fonts.bunny.net">
    <link href="https://fonts.bunny.net/css?family=instrument-sans:400,500,600,700" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('ui.css') }}?v={{ filemtime(public_path('ui.css')) }}">
</head>
<body>
    <div id="app" data-api-base="{{ url('/api') }}">
        <main class="boot-screen">
            <div class="loading-state">Loading SmartExpiryItem</div>
        </main>
    </div>
    <script src="{{ asset('ui.js') }}?v={{ filemtime(public_path('ui.js')) }}" defer></script>
    <script>
        window.setTimeout(function () {
            var app = document.getElementById('app');
            if (!window.__SmartExpiryBooted && app) {
                app.innerHTML = '<main class="auth-layout"><section class="auth-panel"><div class="brand-row"><div class="brand-mark">SI</div><div><h1 class="brand-title">SmartExpiryItem</h1><p class="brand-subtitle">UI script did not start</p></div></div><div class="empty-state">Refresh the page. If this message stays, open /ui.js to confirm the deployed UI asset exists.</div></section></main>';
            }
        }, 2500);
    </script>
</body>
</html>
