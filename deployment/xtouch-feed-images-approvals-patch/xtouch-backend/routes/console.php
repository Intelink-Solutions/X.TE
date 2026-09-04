<?php

use App\Models\User;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\File;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;
use Symfony\Component\Console\Command\Command;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('xtouch:grant-admin {email}', function () {
    $email = mb_strtolower(trim((string) $this->argument('email')));

    if (! filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $this->error('Enter the valid email address used to sign in to the control panel.');

        return Command::FAILURE;
    }

    $user = User::whereRaw('LOWER(email) = ?', [$email])->first();

    if (! $user) {
        $this->error("No registered account was found for {$email}.");

        return Command::FAILURE;
    }

    app(PermissionRegistrar::class)->forgetCachedPermissions();
    Role::firstOrCreate(['name' => 'Super Admin', 'guard_name' => 'web']);
    $user->assignRole('Super Admin');

    $this->info("{$user->email} can now access Email setup and the control panel.");

    return Command::SUCCESS;
})->purpose('Grant an existing account secure control-panel administrator access');

Artisan::command('xtouch:publish-media', function () {
    $target = (string) config('filesystems.disks.public.root');

    if ($target === '') {
        $this->error('PUBLIC_STORAGE_PATH is not configured.');

        return Command::FAILURE;
    }

    File::ensureDirectoryExists($target, 0755, true);
    $realTarget = realpath($target);
    $sources = array_unique([
        storage_path('app/public'),
        base_path('public/storage'),
        dirname(base_path()).DIRECTORY_SEPARATOR.'public_html'.DIRECTORY_SEPARATOR.'storage',
    ]);
    $found = 0;
    $copied = 0;

    foreach ($sources as $source) {
        $realSource = realpath($source);

        if ($realSource === false || ! is_dir($realSource) || $realSource === $realTarget) {
            continue;
        }

        foreach (File::allFiles($realSource) as $file) {
            if ($file->getFilename() === '.gitignore') {
                continue;
            }

            $found++;
            $relativePath = str_replace('\\', '/', $file->getRelativePathname());
            $destination = rtrim($target, '/\\').DIRECTORY_SEPARATOR.str_replace('/', DIRECTORY_SEPARATOR, $relativePath);
            File::ensureDirectoryExists(dirname($destination), 0755, true);

            if (File::copy($file->getPathname(), $destination)) {
                @chmod($destination, 0644);
                $copied++;
            }
        }
    }

    if ($found === 0) {
        $this->warn('No existing media files were found in either backend upload directory. Old post images must be uploaded again.');
    } else {
        $this->info("Published {$copied} media file(s) to {$target}.");
    }

    return Command::SUCCESS;
})->purpose('Copy existing backend uploads into the configured public storage directory');
