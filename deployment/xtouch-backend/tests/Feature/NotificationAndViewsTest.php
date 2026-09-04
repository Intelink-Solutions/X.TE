<?php

namespace Tests\Feature;

use App\Models\FeedPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class NotificationAndViewsTest extends TestCase
{
    use RefreshDatabase;

    public function test_approved_feed_post_creates_an_in_app_notification_for_every_user_once(): void
    {
        Queue::fake();
        $first = User::factory()->create();
        $second = User::factory()->create();

        $post = FeedPost::create([
            'author' => "X'Touch Newsroom",
            'handle' => '@xtouchnews',
            'category' => 'News',
            'kind' => 'news',
            'title' => 'A fresh update',
            'text' => 'A new feed post for every registered member.',
            'approval_status' => 'approved',
            'is_active' => true,
        ]);

        $this->assertSame(1, $first->notifications()->count());
        $this->assertSame(1, $second->notifications()->count());
        $this->assertSame('new_feed_post', $first->notifications()->first()->data['type']);

        $post->update(['title' => 'Edited title']);
        $this->assertSame(1, $first->notifications()->count());
    }

    public function test_notification_api_can_read_one_or_all_notifications(): void
    {
        Queue::fake();
        $member = User::factory()->create();
        FeedPost::create([
            'author' => 'Community',
            'handle' => '@community',
            'category' => 'Updates',
            'kind' => 'update',
            'text' => 'Notification API test.',
            'approval_status' => 'approved',
            'is_active' => true,
        ]);
        $token = $member->createToken('notifications')->plainTextToken;

        $notificationId = $this->withToken($token)->getJson('/api/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->json('data.0.id');

        $this->withToken($token)->postJson("/api/notifications/{$notificationId}/read")
            ->assertOk();
        $this->withToken($token)->postJson('/api/notifications/read-all')
            ->assertOk();
        $this->assertSame(0, $member->unreadNotifications()->count());
    }

    public function test_profile_and_post_views_are_deduplicated_per_session(): void
    {
        Queue::fake();
        $profile = User::factory()->create();
        $post = FeedPost::create([
            'author' => 'Creator',
            'handle' => '@creator',
            'category' => 'Updates',
            'kind' => 'update',
            'text' => 'Count genuine interaction.',
            'approval_status' => 'approved',
            'is_active' => true,
        ]);
        $sessionId = (string) Str::uuid();

        $this->postJson("/api/users/{$profile->id}/view", ['session_id' => $sessionId])
            ->assertOk()->assertJson(['views' => 1, 'recorded' => true]);
        $this->postJson("/api/users/{$profile->id}/view", ['session_id' => $sessionId])
            ->assertOk()->assertJson(['views' => 1, 'recorded' => false]);

        $this->postJson("/api/feed-posts/{$post->id}/view", ['session_id' => $sessionId])
            ->assertOk()->assertJson(['views' => '1', 'recorded' => true]);
        $this->postJson("/api/feed-posts/{$post->id}/view", ['session_id' => $sessionId])
            ->assertOk()->assertJson(['views' => '1', 'recorded' => false]);
    }

    public function test_booking_submission_creates_an_admin_in_app_notification(): void
    {
        Role::create(['name' => 'Super Admin']);
        $admin = User::factory()->create();
        $admin->assignRole('Super Admin');

        $this->postJson('/api/bookings', [
            'service_type' => 'Production Booking',
            'client_name' => 'Booking Client',
            'client_email' => 'client@example.com',
            'preferred_date' => now()->addDay()->toDateString(),
            'contact_method' => 'email',
            'project_details' => 'A complete production booking request.',
        ])->assertCreated();

        $this->assertSame('booking', $admin->notifications()->first()->data['type']);
    }
}
