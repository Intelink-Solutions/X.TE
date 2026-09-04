<?php

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// cPanel layout: /home/CPANEL_USER/public_html and /home/CPANEL_USER/xtouch-backend.
$backendPath = dirname(__DIR__).'/xtouch-backend';

if (! is_dir($backendPath) || ! is_file($backendPath.'/vendor/autoload.php')) {
    http_response_code(503);
    header('Content-Type: text/plain; charset=UTF-8');
    exit("X'Touch backend is not installed. Extract it beside public_html and run Composer.\n");
}

if (file_exists($maintenance = $backendPath.'/storage/framework/maintenance.php')) {
    require $maintenance;
}

require $backendPath.'/vendor/autoload.php';

/** @var Application $app */
$app = require_once $backendPath.'/bootstrap/app.php';

$app->handleRequest(Request::capture());
