<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class PublicStorageTest extends TestCase
{
    public function test_public_uploads_can_be_served_without_a_symbolic_link(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('feed-posts/example.jpg', 'image-contents');

        $this->get('/storage/feed-posts/example.jpg')
            ->assertOk()
            ->assertHeader('content-disposition', 'inline; filename=example.jpg')
            ->assertSeeText('image-contents');
    }

    public function test_public_uploads_can_be_served_through_the_api_prefix(): void
    {
        Storage::fake('public');
        Storage::disk('public')->put('feed-posts/api-example.jpg', 'api-image');

        $this->get('/api/media/feed-posts/api-example.jpg')
            ->assertOk()
            ->assertSeeText('api-image');
    }

    public function test_missing_public_upload_returns_not_found(): void
    {
        Storage::fake('public');
        Storage::fake('legacy-public');

        $this->get('/storage/feed-posts/missing.jpg')->assertNotFound();
    }

    public function test_uploads_from_the_previous_public_directory_are_still_available(): void
    {
        Storage::fake('public');
        Storage::fake('legacy-public');
        Storage::disk('legacy-public')->put('posts/previous.jpg', 'previous-image');

        $this->get('/storage/posts/previous.jpg')
            ->assertOk()
            ->assertSeeText('previous-image');
    }
}
