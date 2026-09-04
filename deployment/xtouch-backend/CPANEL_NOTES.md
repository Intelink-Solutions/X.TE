# X'Touch backend cPanel notes

This archive is the Laravel source for `/api` and `/admin`. Extract it outside `public_html`, copy
the required files from `public` into `public_html`, and use the combined frontend `.htaccess`.

The archive intentionally excludes `.env`, `vendor`, runtime logs/caches, local uploads, and local
database data. Start from `.env.production.example`, then run:

```sh
composer install --no-dev --prefer-dist --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

See the project-level `CPANEL_DEPLOYMENT.md` for the public `index.php` path changes, storage link,
Apache routing, cron, queue, mail, and launch checklist.
