<?php

namespace Tests\Feature;

use App\Models\LiveChatMessage;
use App\Models\TvSchedule;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class LiveChatApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_can_read_active_live_chat_messages(): void
    {
        $user = User::factory()->create();
        $schedule = TvSchedule::create([
            'show_name' => 'Gold Night',
            'time' => '19:00',
            'tag' => 'Live',
            'is_active' => true,
        ]);
        LiveChatMessage::create([
            'tv_schedule_id' => $schedule->id,
            'user_id' => $user->id,
            'body' => 'Sounding great!',
            'is_active' => true,
        ]);

        $this->getJson("/api/live-chat/messages?tv_schedule_id={$schedule->id}")
            ->assertOk()
            ->assertJsonPath('0.body', 'Sounding great!')
            ->assertJsonPath('0.user.name', $user->name);
    }

    public function test_authenticated_users_can_post_validated_live_chat_messages(): void
    {
        $user = User::factory()->create();
        $schedule = TvSchedule::create([
            'show_name' => 'Gold Night',
            'time' => '19:00',
            'tag' => 'Live',
            'is_active' => true,
        ]);
        Sanctum::actingAs($user);

        $this->postJson('/api/live-chat/messages', [
            'tv_schedule_id' => $schedule->id,
            'body' => 'Watching live!',
        ])->assertCreated()
            ->assertJsonPath('body', 'Watching live!')
            ->assertJsonPath('user.name', $user->name);

        $this->assertDatabaseHas('live_chat_messages', [
            'user_id' => $user->id,
            'tv_schedule_id' => $schedule->id,
            'body' => 'Watching live!',
        ]);
    }

    public function test_guests_cannot_post_and_messages_are_limited(): void
    {
        $this->postJson('/api/live-chat/messages', ['body' => 'Hello'])->assertUnauthorized();

        Sanctum::actingAs(User::factory()->create());
        $this->postJson('/api/live-chat/messages', ['body' => str_repeat('a', 501)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('body');
    }
}
