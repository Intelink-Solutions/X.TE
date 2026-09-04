<?php

namespace App\Services;

use App\Models\EmailSetting;
use Illuminate\Support\Facades\Schema;

class MailSettingsService
{
    public function apply(?EmailSetting $settings = null): ?EmailSetting
    {
        if (! Schema::hasTable('email_settings')) {
            return null;
        }

        $settings ??= EmailSetting::query()->first();
        if (! $settings) {
            return null;
        }

        config([
            'mail.from.address' => $settings->from_address,
            'mail.from.name' => $settings->from_name,
            'mail.submissions_to' => $settings->submissions_to,
        ]);

        if ($settings->is_enabled) {
            config([
                'mail.default' => 'smtp',
                'mail.mailers.smtp.scheme' => $settings->encryption === 'ssl' ? 'smtps' : null,
                'mail.mailers.smtp.url' => null,
                'mail.mailers.smtp.host' => $settings->host,
                'mail.mailers.smtp.port' => $settings->port,
                'mail.mailers.smtp.username' => $settings->username,
                'mail.mailers.smtp.password' => $settings->password,
                'mail.mailers.smtp.auto_tls' => $settings->encryption !== 'none',
            ]);
        }

        if (app()->bound('mail.manager')) {
            app('mail.manager')->purge('smtp');
        }

        return $settings;
    }
}
