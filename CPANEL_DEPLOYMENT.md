# X'Touch cPanel deployment

Production URLs:

- Frontend: `https://xtouchentertainments.com/`
- Control panel: `https://xtouchentertainments.com/admin`
- API: `https://xtouchentertainments.com/api`

The frontend is built as static files so Apache can serve it from `public_html`. Laravel owns
`/api`, `/admin`, and `/sanctum`. This avoids requiring cPanel's optional Node.js
Application Manager in production.

## 1. Frontend build and upload

The ready-to-upload archive is `deployment/xtouch-frontend-cpanel.zip`. To rebuild it locally:

```sh
npm ci
npm run lint
npm run build
```

The deployable files are generated in `.output/public`. Copy
`deployment/cpanel/public_html.htaccess` to `.output/public/.htaccess`, then zip the contents of
`.output/public` (not the folder itself).

In cPanel File Manager, open `public_html`, upload the archive, and extract it there. Enable **Show
Hidden Files** before checking the result. Confirm that `.htaccess`, `.user.ini`, `index.html`,
`index.php`, `assets`, and `build` sit directly inside `public_html`. The packaged `index.php`
expects the backend at `/home/CPANEL_USER/xtouch-backend` (beside `public_html`).

## 2. Laravel backend upload and layout

The ready backend source archive is `deployment/xtouch-backend-cpanel.zip`. It intentionally omits
`.env`, `vendor`, local uploads, logs, caches, and test data. Extract it outside the web root, for
example:

```text
/home/CPANEL_USER/xtouch-backend
/home/CPANEL_USER/public_html
```

The frontend ZIP already includes the Laravel bridge `index.php`, compiled control-panel `build`
assets, and the combined `.htaccess`. Do **not** replace that `.htaccess` with Laravel's own
`.htaccess`. If you use a backend folder name other than `xtouch-backend`, update this line in
`public_html/index.php`:

```php
$backendPath = dirname(__DIR__).'/xtouch-backend';
```

Do not expose the backend `.env`, `vendor`, `storage`, or application source beneath
`public_html`.

Recommended cPanel requirements:

- PHP 8.2 or newer, selected for the domain
- MySQL/MariaDB database and database user with all privileges on that database
- Composer 2
- PHP extensions: BCMath, Ctype, cURL, DOM/XML, Fileinfo, GD or Imagick, Intl, JSON, Mbstring,
  OpenSSL, PDO MySQL, Tokenizer, and ZIP

From cPanel Terminal, run inside the backend directory:

```sh
composer install --no-dev --prefer-dist --optimize-autoloader
php artisan migrate --force
php artisan optimize:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

To create the first control-panel account, temporarily set
`INITIAL_CONTROL_PANEL_EMAIL` and a unique `INITIAL_CONTROL_PANEL_PASSWORD` of at least 12
characters in `.env`, then run:

```sh
php artisan db:seed --class=AdminUserSeeder --force
```

Remove `INITIAL_CONTROL_PANEL_PASSWORD` from `.env` afterward and run `php artisan config:cache`
again. The package contains no default login credentials.

Uploads are always stored in the backend's `storage/app/public` directory. Because Laravel's source
is outside `public_html`, create the public upload link explicitly for the fastest delivery (replace
`CPANEL_USER` if needed):

```sh
ln -s /home/asapwg/xtouch-backend/storage/app/public /home/asapwg/public_html/storage
```

If `public_html/storage` already exists, inspect it first and keep any real uploads; do not blindly
delete it. The packaged Apache and Laravel routes also provide a fallback for `/storage/*` requests,
so images remain available when the cPanel account cannot create symbolic links. Files previously
written to the old backend `public/storage` location remain readable after this upgrade.

Run `php artisan key:generate` only during the first deployment when `APP_KEY` is empty. Set
`storage` and `bootstrap/cache` writable by the cPanel account (normally directories `775`, files
`664`; never use `777`).

## 3. Backend production environment

Use values like these in the backend `.env`, replacing credentials and mail settings with the real
cPanel values:

```dotenv
APP_NAME="X'Touch Entertainment"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://xtouchentertainments.com
FRONTEND_URL=https://xtouchentertainments.com

LOG_CHANNEL=stack
LOG_LEVEL=warning

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=CPANEL_DATABASE
DB_USERNAME=CPANEL_DATABASE_USER
DB_PASSWORD=CHANGE_ME

SESSION_DRIVER=database
SESSION_DOMAIN=.xtouchentertainments.com
SESSION_SECURE_COOKIE=true
SANCTUM_STATEFUL_DOMAINS=xtouchentertainments.com,www.xtouchentertainments.com

FILESYSTEM_DISK=public
QUEUE_CONNECTION=database

MAIL_MAILER=smtp
MAIL_HOST=YOUR_CPANEL_MAIL_HOST
MAIL_PORT=587
MAIL_USERNAME=YOUR_MAILBOX
MAIL_PASSWORD=CHANGE_ME
MAIL_SCHEME=tls
MAIL_FROM_ADDRESS=no-reply@xtouchentertainments.com
MAIL_FROM_NAME="X'Touch Entertainment"
```

Because the frontend and API share one origin, CORS should allow
`https://xtouchentertainments.com` and `https://www.xtouchentertainments.com` with credentials.
Never use `*` together with credentialed requests.

## 4. Apache routing

Use `deployment/cpanel/public_html.htaccess` as `public_html/.htaccess`. It sends `/api`, `/admin`,
and `/sanctum` to Laravel while serving frontend assets and routes from the static
build. If the backend uses additional prefixes, add them to the first rewrite condition.

## 5. Scheduler, queue and uploads

Add this cPanel cron job (replace the account path):

```cron
* * * * * /usr/local/bin/php /home/asapwg/xtouch-backend/artisan schedule:run >/dev/null 2>&1
```

For queued mail/notifications, use cPanel's process manager when available. Otherwise add a cron
that runs `php artisan queue:work --stop-when-empty --tries=3` every minute. Set PHP upload and POST
limits above the application's 30 MB music limit, for example `upload_max_filesize=40M` and
`post_max_size=45M`.

## 6. Email copy and security checks

The packaged customer email templates use X'Touch Entertainment wording and do not expose control
panel terminology. Internal role names, route names, database fields, and authorization policies
remain unchanged because they are functional identifiers.

Before going live, verify:

1. `/`, a nested frontend route, `/admin`, `/admin/login`, and `/api` reach the correct application.
2. Registration/login cookies work over HTTPS.
3. Audio upload and embedded-audio submissions both work, but cannot be combined.
4. Storage URLs, mail delivery, queue processing, and scheduled tasks work.
5. `APP_DEBUG=false`, HTTPS redirect, backups, and database credentials are in place.
