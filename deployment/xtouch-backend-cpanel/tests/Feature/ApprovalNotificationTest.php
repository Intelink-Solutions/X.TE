<?php

namespace Tests\Feature;

use App\Livewire\Admin\FeedPostManager;
use App\Livewire\Admin\UserApprovalManager;
use App\Models\FeedPost;
use App\Models\User;
use App\Models\VerificationRequest;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Queue;
use Tests\TestCase;

class ApprovalNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_post_owner_is_notified_when_a_pending_post_is_approved(): void
    {
        Queue::fake();
        $admin = User::factory()->create();
        $owner = User::factory()->create();
        $post = FeedPost::create([
            'user_id' => $owner->id,
            'author' => $owner->name,
            'handle' => '@member',
            'category' => 'Photos',
            'kind' => 'photo',
            'text' => 'Pending post',
            'approval_status' => 'pending',
            'is_active' => false,
        ]);

        $this->actingAs($admin);
        app(FeedPostManager::class)->review($post->id, 'approved');

        $this->assertTrue($owner->notifications()->get()->contains(
            fn ($notification) => $notification->data['type'] === 'post_approved',
        ));
    }

    public function test_user_is_notified_when_an_account_request_is_approved(): void
    {
        $admin = User::factory()->create();
        $member = User::factory()->create();
        $request = VerificationRequest::create([
            'user_id' => $member->id,
            'type' => 'dancer',
            'status' => 'pending',
        ]);

        $this->actingAs($admin);
        app(UserApprovalManager::class)->review($request->id, 'approved');

        $this->assertSame('account_approved', $member->notifications()->first()->data['type']);
    }
}
