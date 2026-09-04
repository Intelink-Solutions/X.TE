<?php

namespace App\Livewire\Admin;

use App\Models\EmailSetting;
use App\Services\MailSettingsService;
use Illuminate\Support\Facades\Mail;
use Livewire\Component;
use Throwable;

class EmailSettingsManager extends Component
{
    public string $host = 'mail.xtouchentertainments.com';

    public int $port = 587;

    public string $encryption = 'tls';

    public string $username = 'info@xtouchentertainments.com';

    public string $password = '';

    public string $from_address = 'info@xtouchentertainments.com';

    public string $from_name = "X'Touch Entertainment";

    public string $submissions_to = 'xtouchentertainments@gmail.com';

    public string $test_recipient = 'xtouchentertainments@gmail.com';

    public bool $is_enabled = false;

    public bool $password_saved = false;

    public function mount(): void
    {
        abort_unless(auth()->user()?->hasAnyRole(['Super Admin', 'Administrator', 'Admin']), 403);

        $settings = EmailSetting::query()->first();
        if (! $settings) {
            return;
        }

        $this->fill($settings->only([
            'host', 'port', 'encryption', 'username', 'from_address', 'from_name',
            'submissions_to', 'is_enabled',
        ]));
        $this->test_recipient = $settings->submissions_to;
        $this->password_saved = filled($settings->password);
    }

    protected function rules(): array
    {
        return [
            'host' => 'required|string|max:255',
            'port' => 'required|integer|min:1|max:65535',
            'encryption' => 'required|in:tls,ssl,none',
            'username' => 'required|email|max:255',
            'password' => 'nullable|string|max:500',
            'from_address' => 'required|email|max:255',
            'from_name' => 'required|string|max:100',
            'submissions_to' => 'required|email|max:255',
            'is_enabled' => 'boolean',
        ];
    }

    public function save(): void
    {
        $settings = $this->persist();
        app(MailSettingsService::class)->apply($settings);
        session()->flash('message', 'Email settings saved securely.');
    }

    public function sendTest(): void
    {
        $this->validateOnly('test_recipient', ['test_recipient' => 'required|email|max:255']);
        $settings = $this->persist();

        if (! $settings->is_enabled) {
            $this->addError('is_enabled', 'Enable SMTP and save before sending a test email.');

            return;
        }

        app(MailSettingsService::class)->apply($settings);

        try {
            Mail::raw(
                "Your X'Touch SMTP settings are working. Booking, contact and feed notifications can now be delivered.",
                fn ($message) => $message
                    ->to($this->test_recipient)
                    ->subject("X'Touch email setup test"),
            );
            $settings->update([
                'last_tested_at' => now(),
                'last_test_status' => 'success',
                'last_test_error' => null,
            ]);
            session()->flash('message', "Test email sent to {$this->test_recipient}.");
        } catch (Throwable $exception) {
            report($exception);
            $settings->update([
                'last_tested_at' => now(),
                'last_test_status' => 'failed',
                'last_test_error' => str($exception->getMessage())->limit(1000),
            ]);
            $this->addError('test_recipient', 'SMTP connection failed: '.$exception->getMessage());
        }
    }

    private function persist(): EmailSetting
    {
        $data = $this->validate();
        $settings = EmailSetting::query()->firstOrNew();

        if ($this->is_enabled && blank($this->password) && blank($settings->password)) {
            $this->addError('password', 'An SMTP password is required when enabling email delivery.');
            $this->validate(['password' => 'required|string|max:500']);
        }

        if (blank($data['password'])) {
            unset($data['password']);
        }

        $settings->fill($data)->save();
        $this->password = '';
        $this->password_saved = filled($settings->password);

        return $settings;
    }

    public function render()
    {
        return view('livewire.admin.email-settings-manager', [
            'settings' => EmailSetting::query()->first(),
        ])->layout('layouts.app');
    }
}
