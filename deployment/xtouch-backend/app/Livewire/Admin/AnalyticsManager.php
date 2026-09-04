<?php

namespace App\Livewire\Admin;

use App\Models\AnalyticsEvent;
use App\Models\FeedPost;
use Livewire\Component;

class AnalyticsManager extends Component
{
    public int $days = 30;

    public function render()
    {
        $from = now()->subDays($this->days);
        $events = AnalyticsEvent::where('created_at', '>=', $from);
        $postStats = AnalyticsEvent::where('created_at', '>=', $from)
            ->where('entity_type', 'feed_post')->whereNotNull('entity_id')
            ->selectRaw("entity_id,
                SUM(CASE WHEN event_type = 'post_view' THEN 1 ELSE 0 END) as views,
                SUM(CASE WHEN event_type = 'post_like' THEN 1 ELSE 0 END) as likes,
                SUM(CASE WHEN event_type = 'post_comment' THEN 1 ELSE 0 END) as comments,
                SUM(CASE WHEN event_type = 'post_share' THEN 1 ELSE 0 END) as shares")
            ->groupBy('entity_id')->orderByDesc('views')->limit(25)->get();
        $posts = FeedPost::whereIn('id', $postStats->pluck('entity_id'))->get()->keyBy('id');

        return view('livewire.admin.analytics-manager', [
            'totalEvents' => (clone $events)->count(),
            'pageViews' => (clone $events)->where('event_type', 'page_view')->count(),
            'uniqueSessions' => (clone $events)->whereNotNull('session_id')->distinct('session_id')->count('session_id'),
            'topPages' => (clone $events)->whereNotNull('path')->selectRaw('path, count(*) as total')->groupBy('path')->orderByDesc('total')->limit(10)->get(),
            'eventTypes' => (clone $events)->selectRaw('event_type, count(*) as total')->groupBy('event_type')->orderByDesc('total')->limit(10)->get(),
            'postStats' => $postStats->map(fn ($stat) => (object) [
                'post' => $posts->get($stat->entity_id),
                'views' => $stat->views,
                'likes' => $stat->likes,
                'comments' => $stat->comments,
                'shares' => $stat->shares,
            ]),
        ])->layout('layouts.app');
    }
}
