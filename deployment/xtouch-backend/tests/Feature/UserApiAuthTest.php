<?php

namespace Tests\Feature;

use App\Livewire\Admin\UserApprovalManager;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Livewire\Livewire;
use Tests\TestCase;

class UserApiAuthTest extends TestCase
{
    use RefreshDatabase;

    public function test_user_can_register_and_access_authenticated_profile(): void
    {
        $response = $this->postJson('/api/auth/register', [
            'name' => 'Music Fan',
            'email' => 'fan@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated()->assertJsonPath('user.email', 'fan@example.com');

        $this->withToken($response->json('token'))
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('name', 'Music Fan');
    }

    public function test_guests_cannot_upload_like_or_comment(): void
    {
        $this->postJson('/api/track-submissions')->assertUnauthorized();
        $this->postJson('/api/tracks/999/like')->assertUnauthorized();
        $this->postJson('/api/feed-posts/999/comments', ['body' => 'Hello'])->assertUnauthorized();
    }

    public function test_registered_user_can_submit_a_real_audio_file_for_approval(): void
    {
        Storage::fake('public');
        $registration = $this->postJson('/api/auth/register', [
            'name' => 'New Artist',
            'email' => 'artist@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $this->withToken($registration->json('token'))->post('/api/track-submissions', [
            'artist' => 'New Artist',
            'title' => 'First Single',
            'genre' => 'Afrobeats',
            'audio' => UploadedFile::fake()->create('first-single.mp3', 250, 'audio/mpeg'),
        ])->assertStatus(202)->assertJsonPath('approval_status', 'pending');

        $this->assertDatabaseHas('tracks', [
            'title' => 'First Single',
            'approval_status' => 'pending',
            'is_active' => false,
        ]);
    }

    public function test_registered_user_can_submit_an_embedded_audio_url_for_approval(): void
    {
        $registration = $this->postJson('/api/auth/register', [
            'name' => 'Embedded Artist',
            'email' => 'embedded@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ]);

        $this->withToken($registration->json('token'))->postJson('/api/track-submissions', [
            'artist' => 'Embedded Artist',
            'title' => 'Remote Single',
            'genre' => 'Afrobeats',
            'audio_url' => 'https://cdn.example.com/remote-single.mp3',
        ])->assertStatus(202)
            ->assertJsonPath('audio_url', 'https://cdn.example.com/remote-single.mp3')
            ->assertJsonPath('approval_status', 'pending');
    }

    public function test_track_submission_rejects_upload_and_embedded_url_together(): void
    {
        Storage::fake('public');
        $member = User::factory()->create();

        $this->withToken($member->createToken('exclusive-audio-test')->plainTextToken)
            ->post('/api/track-submissions', [
                'artist' => 'Exclusive Artist',
                'title' => 'Only One Source',
                'genre' => 'Afrobeats',
                'audio' => UploadedFile::fake()->create('only-one.mp3', 250, 'audio/mpeg'),
                'audio_url' => 'https://cdn.example.com/only-one.mp3',
            ], ['Accept' => 'application/json'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['audio', 'audio_url']);
    }

    public function test_admin_can_approve_a_user_to_publish_a_real_feed_image(): void
    {
        Storage::fake('public');
        $admin = User::factory()->create();
        $member = User::factory()->create();

        Livewire::actingAs($admin)
            ->test(UserApprovalManager::class)
            ->call('setPostingApproval', $member->id, true)
            ->assertHasNoErrors();

        $this->assertDatabaseHas('verification_requests', [
            'user_id' => $member->id,
            'type' => 'approved_user',
            'status' => 'approved',
            'reviewed_by' => $admin->id,
        ]);

        $image = UploadedFile::fake()->image('community-photo.jpg', 1200, 800);
        auth()->guard('web')->logout();
        $response = $this->withToken($member->createToken('feed-test')->plainTextToken)
            ->post('/api/feed-posts', [
                'category' => 'Photos',
                'kind' => 'photo',
                'text' => 'A real community upload',
                'image' => $image,
            ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('approval_status', 'approved')
            ->assertJsonPath('is_active', true);

        $storedPath = str($response->json('image_url'))->after('/storage/')->toString();
        Storage::disk('public')->assertExists($storedPath);
        $this->getJson('/api/gallery')
            ->assertOk()
            ->assertJsonFragment([
                'id' => 'feed-'.$response->json('id'),
                'image_url' => $response->json('image_url'),
                'source' => 'feed',
            ]);
    }

    public function test_approved_user_can_upload_music_directly_to_the_feed(): void
    {
        Storage::fake('public');
        $member = User::factory()->create();
        $member->verificationRequests()->create([
            'type' => 'artist',
            'status' => 'approved',
        ]);

        $response = $this->withToken($member->createToken('music-feed-test')->plainTextToken)
            ->post('/api/feed-posts', [
                'category' => 'Music',
                'kind' => 'music',
                'title' => 'New Feed Single',
                'text' => 'Listen to the new release.',
                'audio' => UploadedFile::fake()->create('new-feed-single.mp3', 3072, 'audio/mpeg'),
            ], ['Accept' => 'application/json'])
            ->assertCreated()
            ->assertJsonPath('kind', 'music')
            ->assertJsonPath('is_active', true);

        $storedPath = str($response->json('media_url'))->after('/storage/')->toString();
        Storage::disk('public')->assertExists($storedPath);
        $this->assertDatabaseHas('tracks', [
            'feed_post_id' => $response->json('id'),
            'title' => 'New Feed Single',
            'approval_status' => 'approved',
            'is_active' => true,
        ]);
        $this->withHeader('Origin', 'http://localhost:8081')
            ->get("/api/tracks/{$response->json('track_id')}/stream")
            ->assertOk()
            ->assertHeader('Access-Control-Allow-Origin', 'http://localhost:8081')
            ->assertHeader('Accept-Ranges', 'bytes');
        $this->get("/api/tracks/{$response->json('track_id')}/download")->assertOk();
        $this->assertDatabaseHas('tracks', [
            'id' => $response->json('track_id'),
            'downloads' => 1,
        ]);

        $playlist = $this->withToken($member->createToken('playlist-test')->plainTextToken)
            ->postJson('/api/playlists', ['name' => 'Road Trip'])
            ->assertCreated();
        $this->withToken($member->createToken('playlist-track-test')->plainTextToken)
            ->postJson("/api/playlists/{$playlist->json('id')}/tracks/{$response->json('track_id')}")
            ->assertOk()
            ->assertJsonPath('saved', true);
        $this->assertDatabaseHas('playlist_tracks', [
            'playlist_id' => $playlist->json('id'),
            'track_id' => $response->json('track_id'),
        ]);
    }

    public function test_user_can_submit_a_direct_podcast_recording_for_approval(): void
    {
        Storage::fake('public');
        $member = User::factory()->create();

        $this->withToken($member->createToken('podcast-test')->plainTextToken)
            ->post('/api/podcast-submissions', [
                'title' => 'Recorded in Browser',
                'recorded_audio' => UploadedFile::fake()->create('recording.webm', 512, 'audio/webm'),
            ], ['Accept' => 'application/json'])
            ->assertStatus(202)
            ->assertJsonPath('approval_status', 'pending')
            ->assertJsonPath('is_active', false);

        $this->assertDatabaseHas('podcast_episodes', [
            'title' => 'Recorded in Browser',
            'submitted_by' => $member->id,
            'approval_status' => 'pending',
        ]);
    }
}
