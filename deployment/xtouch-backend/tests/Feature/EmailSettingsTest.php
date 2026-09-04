<?php

namespace Tests\Feature;

use App\Models\EmailSetting;
use App\Models\User;
use App\Services\MailSettingsService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Tests\TestCase;

class EmailSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_save_encrypted_smtp_settings(): void
    {
        Role::create(['name' => 'Super Admin']);
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');

        $this->actingAs($admin);
        $settings = EmailSetting::create([
            'host' => 'mail.xtouchentertainments.com',
            'port' => 587,
            'encryption' => 'tls',
            'username' => 'info@xtouchentertainments.com',
            'password' => 'private-smtp-password',
            'from_address' => 'info@xtouchentertainments.com',
            'from_name' => "X'Touch Entertainment",
            'submissions_to' => 'xtouchentertainments@gmail.com',
            'is_enabled' => true,
        ]);
        app(MailSettingsService::class)->apply($settings);

        $settings->refresh();
        $this->assertSame('private-smtp-password', $settings->password);
        $this->assertStringNotContainsString('private-smtp-password', $settings->getRawOriginal('password'));
        $this->assertSame('smtp', config('mail.default'));
    }

    public function test_non_admin_cannot_open_email_settings(): void
    {
        $member = User::factory()->create();

        $this->actingAs($member);
        try {
            app(\App\Livewire\Admin\EmailSettingsManager::class)->mount();
            $this->fail('A non-admin opened the email settings component.');
        } catch (HttpException $exception) {
            $this->assertSame(403, $exception->getStatusCode());
        }
    }
}
