<?php

use App\Http\Controllers\Api\AnalyticsEventController;
use App\Http\Controllers\Api\ArtistController;
use App\Http\Controllers\Api\ArtistFollowController;
use App\Http\Controllers\Api\BlogPostController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\CareerController;
use App\Http\Controllers\Api\ContactMessageController;
use App\Http\Controllers\Api\DancerController;
use App\Http\Controllers\Api\EngagementController;
use App\Http\Controllers\Api\EventController;
use App\Http\Controllers\Api\FeedPostController;
use App\Http\Controllers\Api\GalleryItemController;
use App\Http\Controllers\Api\HealthController;
use App\Http\Controllers\Api\LiveChatMessageController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\PlaylistController;
use App\Http\Controllers\Api\PodcastEpisodeController;
use App\Http\Controllers\Api\PostReportController;
use App\Http\Controllers\Api\SiteContentController;
use App\Http\Controllers\Api\StoreProductController;
use App\Http\Controllers\Api\TicketListingController;
use App\Http\Controllers\Api\TicketOrderController;
use App\Http\Controllers\Api\TrackController;
use App\Http\Controllers\Api\TvScheduleController;
use App\Http\Controllers\Api\UserAuthController;
use App\Http\Controllers\Api\UserFollowController;
use App\Http\Controllers\Api\UserProfileController;
use App\Http\Controllers\PublicUploadController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Public read-only routes (no auth required)
|--------------------------------------------------------------------------
*/
Route::get('/health', HealthController::class)->middleware('throttle:60,1');
Route::get('/media/{path}', [PublicUploadController::class, 'show'])->where('path', '.+');

Route::get('/artists', [ArtistController::class, 'index']);
Route::get('/artists/{artist}', [ArtistController::class, 'show']);

Route::get('/dancers', [DancerController::class, 'index']);
Route::get('/dancers/{dancer}', [DancerController::class, 'show']);

Route::get('/tracks', [TrackController::class, 'index']);
Route::get('/tracks/{track}/stream', [TrackController::class, 'stream']);
Route::get('/tracks/{track}/download', [TrackController::class, 'download']);
Route::get('/tracks/{track}', [TrackController::class, 'show']);

Route::get('/events', [EventController::class, 'index']);
Route::get('/events/{event}', [EventController::class, 'show']);

Route::get('/feed-posts', [FeedPostController::class, 'index']);
Route::get('/feed-posts/{feedPost}', [FeedPostController::class, 'show']);
Route::get('/users/{user}', [UserProfileController::class, 'show']);
Route::post('/users/{user}/view', [UserProfileController::class, 'recordView'])->middleware('throttle:120,1');
Route::get('/feed-posts/{feedPost}/comments', [EngagementController::class, 'comments']);
Route::post('/feed-posts/{feedPost}/view', [EngagementController::class, 'viewPost'])->middleware('throttle:120,1');
Route::post('/analytics-events', [AnalyticsEventController::class, 'store'])->middleware('throttle:120,1');

Route::get('/tv-schedules', [TvScheduleController::class, 'index']);
Route::get('/live-chat/messages', [LiveChatMessageController::class, 'index']);

Route::get('/blog-posts', [BlogPostController::class, 'index']);
Route::get('/blog-posts/{blogPost}', [BlogPostController::class, 'show']);

Route::get('/gallery', [GalleryItemController::class, 'index']);
Route::get('/gallery/{galleryItem}', [GalleryItemController::class, 'show']);

Route::get('/podcast-episodes', [PodcastEpisodeController::class, 'index']);
Route::get('/podcast-episodes/{podcastEpisode}/stream', [PodcastEpisodeController::class, 'stream']);
Route::get('/podcast-episodes/{podcastEpisode}/download', [PodcastEpisodeController::class, 'download']);
Route::get('/podcast-episodes/{podcastEpisode}', [PodcastEpisodeController::class, 'show']);

Route::get('/store-products', [StoreProductController::class, 'index']);
Route::get('/store-products/{storeProduct}', [StoreProductController::class, 'show']);

Route::get('/careers', [CareerController::class, 'index']);
Route::get('/careers/{career}', [CareerController::class, 'show']);

// Site content (CMS for home, about, production pages)
Route::get('/site-content', [SiteContentController::class, 'index']);
Route::get('/site-content/{page}', [SiteContentController::class, 'show']);

// Public submission routes (no auth required)
Route::post('/bookings', [BookingController::class, 'store'])->middleware('throttle:10,1');
Route::post('/contact-messages', [ContactMessageController::class, 'store'])->middleware('throttle:10,1');
Route::post('/ticket-orders', [TicketOrderController::class, 'store'])->middleware('throttle:10,1');
Route::post('/ticket-listings', [TicketListingController::class, 'store'])->middleware('throttle:10,1');
Route::get('/ticket-listings', [TicketListingController::class, 'index']);

/*
|--------------------------------------------------------------------------
| Authenticated user route
|--------------------------------------------------------------------------
*/
Route::post('/auth/register', [UserAuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/auth/login', [UserAuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [UserAuthController::class, 'user']);
    Route::patch('/user/profile', [UserProfileController::class, 'update']);
    Route::post('/auth/logout', [UserAuthController::class, 'logout']);
    Route::post('/live-chat/messages', [LiveChatMessageController::class, 'store'])->middleware('throttle:20,1');
    Route::get('/notifications', [NotificationController::class, 'index']);
    Route::post('/notifications/read-all', [NotificationController::class, 'readAll']);
    Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead']);
    Route::post('/track-submissions', [TrackController::class, 'submitPublic'])->middleware('throttle:5,1');
    Route::post('/podcast-submissions', [PodcastEpisodeController::class, 'submit'])->middleware('throttle:5,1');
    Route::post('/tracks/submit', [TrackController::class, 'submit']);
    Route::post('/tracks/{track}/like', [EngagementController::class, 'toggleTrackLike']);
    Route::post('/feed-posts', [FeedPostController::class, 'store'])->middleware('throttle:20,1');
    Route::post('/feed-posts/{feedPost}/like', [EngagementController::class, 'togglePostLike']);
    Route::get('/feed-posts/{feedPost}/engagement', [EngagementController::class, 'postStatus']);
    Route::post('/feed-posts/{feedPost}/bookmark', [EngagementController::class, 'togglePostBookmark']);
    Route::post('/feed-posts/{feedPost}/repost', [EngagementController::class, 'togglePostRepost']);
    Route::post('/feed-posts/{feedPost}/share', [EngagementController::class, 'sharePost'])->middleware('throttle:30,1');
    Route::post('/feed-posts/{feedPost}/comments', [EngagementController::class, 'comment'])->middleware('throttle:30,1');
    Route::post('/feed-posts/{feedPost}/poll-vote', [EngagementController::class, 'votePoll'])->middleware('throttle:30,1');
    Route::post('/feed-posts/{feedPost}/reports', [PostReportController::class, 'store'])->middleware('throttle:10,1');
    Route::get('/users/{user}/follow', [UserFollowController::class, 'status']);
    Route::post('/users/{user}/follow', [UserFollowController::class, 'toggle'])->middleware('throttle:30,1');
    Route::get('/artists/{artist}/follow', [ArtistFollowController::class, 'status']);
    Route::post('/artists/{artist}/follow', [ArtistFollowController::class, 'toggle'])->middleware('throttle:30,1');
    Route::get('/bookmarks', [EngagementController::class, 'bookmarks']);
    Route::get('/playlists', [PlaylistController::class, 'index']);
    Route::post('/playlists', [PlaylistController::class, 'store']);
    Route::post('/playlists/{playlist}/tracks/{track}', [PlaylistController::class, 'toggleTrack']);
    Route::post('/verification-requests', function (Request $request) {
        $data = $request->validate([
            'type' => 'required|in:approved_user,artist,podcaster,event_organizer,musician,dancer,presenter',
            'note' => 'nullable|string|max:2000',
        ]);
        $data['status'] = 'pending';

        return response()->json($request->user()->verificationRequests()->create($data), 201);
    });
});

/*
|--------------------------------------------------------------------------
| Admin-only routes (sanctum + admin role)
|--------------------------------------------------------------------------
*/
Route::middleware(['auth:sanctum', 'role:admin'])->prefix('admin')->group(function () {

    // Artists
    Route::post('/artists', [ArtistController::class, 'store']);
    Route::put('/artists/{artist}', [ArtistController::class, 'update']);
    Route::patch('/artists/{artist}', [ArtistController::class, 'update']);
    Route::delete('/artists/{artist}', [ArtistController::class, 'destroy']);

    // Dancers
    Route::post('/dancers', [DancerController::class, 'store']);
    Route::put('/dancers/{dancer}', [DancerController::class, 'update']);
    Route::patch('/dancers/{dancer}', [DancerController::class, 'update']);
    Route::delete('/dancers/{dancer}', [DancerController::class, 'destroy']);

    // Tracks
    Route::post('/tracks', [TrackController::class, 'store']);
    Route::put('/tracks/{track}', [TrackController::class, 'update']);
    Route::patch('/tracks/{track}', [TrackController::class, 'update']);
    Route::delete('/tracks/{track}', [TrackController::class, 'destroy']);

    // Events
    Route::post('/events', [EventController::class, 'store']);
    Route::put('/events/{event}', [EventController::class, 'update']);
    Route::patch('/events/{event}', [EventController::class, 'update']);
    Route::delete('/events/{event}', [EventController::class, 'destroy']);

    // Ticket orders (admin read/manage)
    Route::get('/ticket-orders', [TicketOrderController::class, 'index']);
    Route::get('/ticket-orders/{ticketOrder}', [TicketOrderController::class, 'show']);
    Route::patch('/ticket-orders/{ticketOrder}', [TicketOrderController::class, 'update']);
    Route::delete('/ticket-orders/{ticketOrder}', [TicketOrderController::class, 'destroy']);

    // Ticket listings (admin manage)
    Route::patch('/ticket-listings/{ticketListing}', [TicketListingController::class, 'update']);
    Route::delete('/ticket-listings/{ticketListing}', [TicketListingController::class, 'destroy']);

    // Bookings
    Route::get('/bookings', [BookingController::class, 'index']);
    Route::get('/bookings/{booking}', [BookingController::class, 'show']);
    Route::patch('/bookings/{booking}', [BookingController::class, 'update']);
    Route::delete('/bookings/{booking}', [BookingController::class, 'destroy']);

    // Feed posts
    Route::post('/feed-posts', [FeedPostController::class, 'store']);
    Route::put('/feed-posts/{feedPost}', [FeedPostController::class, 'update']);
    Route::patch('/feed-posts/{feedPost}', [FeedPostController::class, 'update']);
    Route::delete('/feed-posts/{feedPost}', [FeedPostController::class, 'destroy']);

    // TV schedules
    Route::post('/tv-schedules', [TvScheduleController::class, 'store']);
    Route::put('/tv-schedules/{tvSchedule}', [TvScheduleController::class, 'update']);
    Route::patch('/tv-schedules/{tvSchedule}', [TvScheduleController::class, 'update']);
    Route::delete('/tv-schedules/{tvSchedule}', [TvScheduleController::class, 'destroy']);

    // Blog posts
    Route::post('/blog-posts', [BlogPostController::class, 'store']);
    Route::put('/blog-posts/{blogPost}', [BlogPostController::class, 'update']);
    Route::patch('/blog-posts/{blogPost}', [BlogPostController::class, 'update']);
    Route::delete('/blog-posts/{blogPost}', [BlogPostController::class, 'destroy']);

    // Gallery
    Route::post('/gallery', [GalleryItemController::class, 'store']);
    Route::put('/gallery/{galleryItem}', [GalleryItemController::class, 'update']);
    Route::patch('/gallery/{galleryItem}', [GalleryItemController::class, 'update']);
    Route::delete('/gallery/{galleryItem}', [GalleryItemController::class, 'destroy']);

    // Podcast episodes
    Route::post('/podcast-episodes', [PodcastEpisodeController::class, 'store']);
    Route::put('/podcast-episodes/{podcastEpisode}', [PodcastEpisodeController::class, 'update']);
    Route::patch('/podcast-episodes/{podcastEpisode}', [PodcastEpisodeController::class, 'update']);
    Route::delete('/podcast-episodes/{podcastEpisode}', [PodcastEpisodeController::class, 'destroy']);

    // Store products
    Route::post('/store-products', [StoreProductController::class, 'store']);
    Route::put('/store-products/{storeProduct}', [StoreProductController::class, 'update']);
    Route::patch('/store-products/{storeProduct}', [StoreProductController::class, 'update']);
    Route::delete('/store-products/{storeProduct}', [StoreProductController::class, 'destroy']);

    // Careers
    Route::post('/careers', [CareerController::class, 'store']);
    Route::put('/careers/{career}', [CareerController::class, 'update']);
    Route::patch('/careers/{career}', [CareerController::class, 'update']);
    Route::delete('/careers/{career}', [CareerController::class, 'destroy']);

    // Contact messages
    Route::get('/contact-messages', [ContactMessageController::class, 'index']);
    Route::get('/contact-messages/{contactMessage}', [ContactMessageController::class, 'show']);
    Route::patch('/contact-messages/{contactMessage}', [ContactMessageController::class, 'update']);
    Route::delete('/contact-messages/{contactMessage}', [ContactMessageController::class, 'destroy']);
});
