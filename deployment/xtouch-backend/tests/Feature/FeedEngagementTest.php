<?php

namespace Tests\Feature;

use App\Models\Artist;
use App\Models\FeedPost;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class FeedEngagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_registered_user_can_use_all_feed_engagement_actions(): void
    {
        $registration = $this->postJson('/api/auth/register', [
            'name' => 'Feed Member',
            'email' => 'feed@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
        ])->assertCreated();

        $post = FeedPost::create([
            'author' => "X'Touch Newsroom",
            'handle' => '@xtouchnews',
            'verified' => true,
            'category' => 'News',
            'kind' => 'news',
            'text' => 'A test post for complete engagement.',
            'hashtags' => ['#XTouch'],
            'tags' => ['newsroom'],
            'approval_status' => 'approved',
            'is_active' => true,
        ]);

        $member = $this->withToken($registration->json('token'));

        $member->postJson("/api/feed-posts/{$post->id}/like")
            ->assertOk()->assertJson(['liked' => true, 'likes_count' => 1]);
        $member->postJson("/api/feed-posts/{$post->id}/bookmark")
            ->assertOk()->assertJson(['saved' => true, 'bookmarks_count' => 1]);
        $member->postJson("/api/feed-posts/{$post->id}/repost")
            ->assertOk()->assertJson(['reposted' => true, 'reposts_count' => 1]);
        $member->postJson("/api/feed-posts/{$post->id}/share")
            ->assertOk()->assertJson(['shares_count' => 1]);
        $member->postJson("/api/feed-posts/{$post->id}/comments", ['body' => 'This works.'])
            ->assertCreated()->assertJsonPath('body', 'This works.');
        $member->postJson("/api/feed-posts/{$post->id}/reports", ['reason' => 'spam'])
            ->assertCreated()->assertJsonPath('reason', 'spam');

        $this->postJson("/api/feed-posts/{$post->id}/view")
            ->assertOk()->assertJson(['views' => '1']);

        $member->getJson("/api/feed-posts/{$post->id}/engagement")
            ->assertOk()
            ->assertJson([
                'liked' => true,
                'saved' => true,
                'reposted' => true,
                'likes_count' => 1,
                'comments_count' => 1,
                'shares_count' => 1,
                'reposts_count' => 1,
                'views' => '1',
            ]);
        $member->getJson('/api/bookmarks')
            ->assertOk()
            ->assertJsonPath('data.0.feed_post.id', $post->id);

        $this->assertDatabaseHas('feed_post_bookmarks', ['feed_post_id' => $post->id]);
        $this->assertDatabaseHas('feed_post_reposts', ['feed_post_id' => $post->id]);
        $this->assertDatabaseHas('post_reports', ['feed_post_id' => $post->id, 'reason' => 'spam']);
    }

    public function test_guest_engagement_is_read_only_except_for_views(): void
    {
        $post = FeedPost::create([
            'author' => 'Community',
            'handle' => '@community',
            'category' => 'Updates',
            'kind' => 'update',
            'text' => 'Guest permissions.',
            'approval_status' => 'approved',
            'is_active' => true,
        ]);

        foreach (['like', 'bookmark', 'repost', 'share'] as $action) {
            $this->postJson("/api/feed-posts/{$post->id}/{$action}")->assertUnauthorized();
        }
        $this->postJson("/api/feed-posts/{$post->id}/reports", ['reason' => 'spam'])->assertUnauthorized();
        $this->postJson("/api/feed-posts/{$post->id}/view")->assertOk();
    }

    public function test_user_can_vote_in_a_poll_and_change_their_vote(): void
    {
        $member = User::factory()->create();
        $post = FeedPost::create([
            'author' => 'XTouch Artist',
            'handle' => '@xtouchartist',
            'category' => 'Polls',
            'kind' => 'poll',
            'text' => 'Which song should release next?',
            'poll_options' => [
                ['option' => 'Sunrise', 'percent' => 0],
                ['option' => 'Midnight', 'percent' => 0],
            ],
            'approval_status' => 'approved',
            'is_active' => true,
        ]);
        $client = $this->withToken($member->createToken('poll-test')->plainTextToken);

        $client->postJson("/api/feed-posts/{$post->id}/poll-vote", ['option_index' => 0])
            ->assertOk()
            ->assertJsonPath('selected_option_index', 0)
            ->assertJsonPath('poll_options.0.percent', 100);

        $client->postJson("/api/feed-posts/{$post->id}/poll-vote", ['option_index' => 1])
            ->assertOk()
            ->assertJsonPath('selected_option_index', 1)
            ->assertJsonPath('poll_options.1.percent', 100);

        $this->assertDatabaseCount('feed_poll_votes', 1);
        $this->assertDatabaseHas('feed_poll_votes', [
            'feed_post_id' => $post->id,
            'user_id' => $member->id,
            'option_index' => 1,
        ]);
    }

    public function test_user_can_follow_and_unfollow_an_artist(): void
    {
        $fan = User::factory()->create();
        $artist = User::factory()->create();
        $artist->verificationRequests()->create([
            'type' => 'artist',
            'status' => 'approved',
        ]);
        $client = $this->withToken($fan->createToken('follow-test')->plainTextToken);

        $client->postJson("/api/users/{$artist->id}/follow")
            ->assertOk()
            ->assertJson(['following' => true, 'followers_count' => 1]);
        $client->getJson("/api/users/{$artist->id}/follow")
            ->assertOk()
            ->assertJson(['following' => true, 'followers_count' => 1]);
        $client->postJson("/api/users/{$artist->id}/follow")
            ->assertOk()
            ->assertJson(['following' => false, 'followers_count' => 0]);

        $this->assertDatabaseCount('user_follows', 0);
    }

    public function test_user_can_follow_an_artist_profile(): void
    {
        $fan = User::factory()->create();
        $artist = Artist::create([
            'name' => 'Profile Artist',
            'slug' => 'profile-artist',
            'role' => 'Singer',
            'is_active' => true,
        ]);
        $client = $this->withToken($fan->createToken('artist-follow-test')->plainTextToken);

        $client->postJson("/api/artists/{$artist->id}/follow")
            ->assertOk()
            ->assertJson(['following' => true, 'followers_count' => 1]);
        $client->getJson("/api/artists/{$artist->id}/follow")
            ->assertOk()
            ->assertJson(['following' => true, 'followers_count' => 1]);

        $this->assertDatabaseHas('artist_follows', [
            'user_id' => $fan->id,
            'artist_id' => $artist->id,
        ]);
    }

    public function test_public_creator_profile_contains_posts_and_playlists_without_private_email(): void
    {
        $creator = User::factory()->create([
            'name' => 'Podcast Creator',
            'handle' => '@podcastcreator',
            'bio' => 'Stories from the XTouch community.',
            'location' => 'Lagos',
        ]);
        $creator->verificationRequests()->create([
            'type' => 'podcaster',
            'status' => 'approved',
        ]);
        $creator->playlists()->create(['name' => 'My favourites']);
        FeedPost::create([
            'user_id' => $creator->id,
            'author' => $creator->name,
            'handle' => $creator->handle,
            'category' => 'Updates',
            'kind' => 'update',
            'text' => 'A public creator post.',
            'approval_status' => 'approved',
            'is_active' => true,
        ]);

        $response = $this->getJson("/api/users/{$creator->id}")
            ->assertOk()
            ->assertJsonPath('role', 'Podcaster')
            ->assertJsonPath('is_followable', true)
            ->assertJsonPath('posts.0.text', 'A public creator post.')
            ->assertJsonPath('playlists.0.name', 'My favourites');

        $this->assertArrayNotHasKey('email', $response->json());

        $member = User::factory()->create();
        $fan = User::factory()->create();
        $this->withToken($fan->createToken('profile-follow-test')->plainTextToken)
            ->postJson("/api/users/{$member->id}/follow")
            ->assertUnprocessable();
    }

    public function test_approved_user_event_and_ticket_posts_are_listed_in_the_public_feed(): void
    {
        $member = User::factory()->create();
        $member->verificationRequests()->create([
            'type' => 'event_organizer',
            'status' => 'approved',
        ]);
        $client = $this->withToken($member->createToken('listing-test')->plainTextToken);

        $client->postJson('/api/feed-posts', [
            'category' => 'Events',
            'kind' => 'event',
            'title' => 'XTouch Live Night',
            'text' => 'Join us for a live show.',
            'event_date' => now()->addWeek()->toIso8601String(),
            'venue' => 'Main Arena',
        ])->assertCreated()->assertJsonPath('is_active', true);

        $client->postJson('/api/feed-posts', [
            'category' => 'Tickets',
            'kind' => 'ticket',
            'title' => 'VIP Ticket',
            'text' => 'One VIP ticket available.',
            'event_date' => now()->addWeek()->toIso8601String(),
            'venue' => 'Main Arena',
            'ticket_price' => 'K350',
            'ticket_url' => 'https://example.com/tickets/1',
        ])->assertCreated()->assertJsonPath('is_active', true);

        $this->getJson('/api/feed-posts')
            ->assertOk()
            ->assertJsonFragment(['title' => 'XTouch Live Night', 'kind' => 'event'])
            ->assertJsonFragment(['title' => 'VIP Ticket', 'kind' => 'ticket'])
            ->assertJsonMissingPath('data.0.user');

        $this->assertDatabaseHas('events', ['name' => 'XTouch Live Night', 'is_active' => true]);
        $this->assertDatabaseHas('events', [
            'name' => 'VIP Ticket',
            'price' => 'K350',
            'ticket_url' => 'https://example.com/tickets/1',
        ]);
    }
}
