<?php

namespace App\Livewire\Admin;

use Livewire\Component;
use App\Models\Artist;
use App\Models\Booking;
use App\Models\Career;
use App\Models\ContactMessage;
use App\Models\Event;
use App\Models\FeedPost;
use App\Models\Track;
use App\Models\TicketOrder;
use App\Models\BlogPost;
use App\Models\PodcastEpisode;
use App\Models\StoreProduct;
use App\Models\Dancer;
use App\Models\TicketListing;
use App\Models\VerificationRequest;
use App\Models\PostReport;

class Dashboard extends Component
{
    public function render()
    {
        return view('livewire.admin.dashboard', [
            'stats' => [
                ['label' => 'Artists',          'value' => Artist::count(),                           'icon' => 'mic',        'color' => 'gold'],
                ['label' => 'Tracks',           'value' => Track::count(),                            'icon' => 'music',      'color' => 'blue'],
                ['label' => 'Events',           'value' => Event::count(),                            'icon' => 'calendar',   'color' => 'purple'],
                ['label' => 'Bookings',         'value' => Booking::count(),                          'icon' => 'clipboard',  'color' => 'green'],
                ['label' => 'Pending Bookings', 'value' => Booking::where('status','pending')->count(),'icon' => 'clock',      'color' => 'yellow'],
                ['label' => 'Ticket Orders',    'value' => TicketOrder::count(),                      'icon' => 'ticket',     'color' => 'pink'],
                ['label' => 'Feed Posts',       'value' => FeedPost::count(),                         'icon' => 'rss',        'color' => 'teal'],
                ['label' => 'Blog Posts',       'value' => BlogPost::where('is_published',true)->count(),'icon' => 'book',    'color' => 'indigo'],
                ['label' => 'Dancers',          'value' => Dancer::count(),                           'icon' => 'user',       'color' => 'rose'],
                ['label' => 'Podcast Episodes', 'value' => PodcastEpisode::count(),                   'icon' => 'headphones', 'color' => 'orange'],
                ['label' => 'Store Products',   'value' => StoreProduct::count(),                     'icon' => 'shopping',   'color' => 'cyan'],
                ['label' => 'Unread Messages',  'value' => ContactMessage::where('status','unread')->count(),'icon' => 'mail','color' => 'red'],
                ['label' => 'Pending Music',    'value' => Track::where('approval_status','pending')->count(),'icon' => 'music','color' => 'yellow'],
                ['label' => 'User Approvals',   'value' => VerificationRequest::where('status','pending')->count(),'icon' => 'user','color' => 'yellow'],
                ['label' => 'Ticket Listings',  'value' => TicketListing::where('moderation_status','pending')->count(),'icon' => 'ticket','color' => 'yellow'],
                ['label' => 'Open Reports',     'value' => PostReport::where('status','open')->count(),'icon' => 'flag','color' => 'red'],
            ],
            'recentBookings'  => Booking::latest()->take(5)->get(),
            'recentMessages'  => ContactMessage::where('status','unread')->latest()->take(5)->get(),
            'recentOrders'    => TicketOrder::with('event')->latest()->take(5)->get(),
        ])->layout('layouts.app');
    }
}
