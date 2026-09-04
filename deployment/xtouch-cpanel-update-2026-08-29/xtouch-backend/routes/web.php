<?php

use App\Http\Controllers\AdminNotificationController;
use App\Http\Controllers\Auth\SocialAuthController;
use App\Http\Controllers\PublicUploadController;
use App\Livewire\Admin\AnalyticsManager;
use App\Livewire\Admin\ArtistManager;
use App\Livewire\Admin\BlogPostManager;
use App\Livewire\Admin\BookingManager;
use App\Livewire\Admin\CareerManager;
use App\Livewire\Admin\ContactMessageManager;
use App\Livewire\Admin\DancerManager;
use App\Livewire\Admin\Dashboard;
use App\Livewire\Admin\EmailSettingsManager;
use App\Livewire\Admin\EventManager;
use App\Livewire\Admin\FeedPostManager;
use App\Livewire\Admin\GalleryManager;
use App\Livewire\Admin\PodcastManager;
use App\Livewire\Admin\ReportManager;
use App\Livewire\Admin\SiteContentManager;
use App\Livewire\Admin\StoreProductManager;
use App\Livewire\Admin\TicketManager;
use App\Livewire\Admin\TrackManager;
use App\Livewire\Admin\TvScheduleManager;
use App\Livewire\Admin\UserApprovalManager;
use Illuminate\Support\Facades\Route;

Route::get('/', fn () => redirect()->route(auth()->check() ? 'dashboard' : 'login'));

Route::get('/storage/{path}', [PublicUploadController::class, 'show'])
    ->where('path', '.+')
    ->name('storage.public');

Route::prefix('admin')->group(function () {
    Route::get('/auth/google/redirect', [SocialAuthController::class, 'redirect'])->name('auth.google.redirect');
    Route::get('/auth/google/callback', [SocialAuthController::class, 'callback'])->name('auth.google.callback');
});

Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->group(function () {
    Route::get('/admin/dashboard', function () {
        return view('dashboard');
    })->name('dashboard');
});

/*
|--------------------------------------------------------------------------
| Admin Routes (auth required — role check is inside the Livewire components)
|--------------------------------------------------------------------------
*/
Route::middleware([
    'auth:sanctum',
    config('jetstream.auth_session'),
    'verified',
])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', Dashboard::class)->name('dashboard');
    Route::get('/site-content', SiteContentManager::class)->name('site-content');
    Route::get('/artists', ArtistManager::class)->name('artists');
    Route::get('/dancers', DancerManager::class)->name('dancers');
    Route::get('/tracks', TrackManager::class)->name('tracks');
    Route::get('/events', EventManager::class)->name('events');
    Route::get('/email-settings', EmailSettingsManager::class)->name('email-settings');
    Route::get('/bookings', BookingManager::class)->name('bookings');
    Route::get('/feed-posts', FeedPostManager::class)->name('feed-posts');
    Route::get('/tv-schedule', TvScheduleManager::class)->name('tv-schedule');
    Route::get('/blog-posts', BlogPostManager::class)->name('blog-posts');
    Route::get('/gallery', GalleryManager::class)->name('gallery');
    Route::get('/podcast', PodcastManager::class)->name('podcast');
    Route::get('/store-products', StoreProductManager::class)->name('store-products');
    Route::get('/careers', CareerManager::class)->name('careers');
    Route::get('/contact-messages', ContactMessageManager::class)->name('contact-messages');
    Route::get('/tickets', TicketManager::class)->name('tickets');
    Route::get('/user-approvals', UserApprovalManager::class)->name('user-approvals');
    Route::get('/reports', ReportManager::class)->name('reports');
    Route::get('/analytics', AnalyticsManager::class)->name('analytics');
    Route::post('/notifications/read-all', [AdminNotificationController::class, 'readAll'])->name('notifications.read-all');
    Route::post('/notifications/{notification}/read', [AdminNotificationController::class, 'markRead'])->name('notifications.read');
});
