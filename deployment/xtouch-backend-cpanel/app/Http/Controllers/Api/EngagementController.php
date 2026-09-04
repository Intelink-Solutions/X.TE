<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AnalyticsEvent;
use App\Models\ContentView;
use App\Models\FeedPollVote;
use App\Models\FeedPost;
use App\Models\FeedPostBookmark;
use App\Models\FeedPostComment;
use App\Models\FeedPostLike;
use App\Models\FeedPostRepost;
use App\Models\Track;
use App\Models\TrackLike;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EngagementController extends Controller
{
    public function postStatus(Request $request, FeedPost $feedPost): JsonResponse
    {
        $userId = $request->user()->id;

        return response()->json([
            'liked' => $feedPost->userLikes()->where('user_id', $userId)->exists(),
            'saved' => $feedPost->bookmarks()->where('user_id', $userId)->exists(),
            'reposted' => $feedPost->reposts()->where('user_id', $userId)->exists(),
            'likes_count' => (int) $feedPost->likes,
            'comments_count' => (int) $feedPost->comments,
            'shares_count' => (int) $feedPost->shares,
            'reposts_count' => (int) $feedPost->reposts,
            'views' => (string) $feedPost->views,
        ]);
    }

    public function bookmarks(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->feedPostBookmarks()
                ->with(['feedPost.user.roles', 'feedPost.track'])
                ->latest()
                ->paginate(20)
        );
    }

    public function toggleTrackLike(Request $request, Track $track): JsonResponse
    {
        $like = TrackLike::where(['track_id' => $track->id, 'user_id' => $request->user()->id])->first();
        $liked = ! $like;
        $like ? $like->delete() : TrackLike::create(['track_id' => $track->id, 'user_id' => $request->user()->id]);

        return response()->json(['liked' => $liked, 'likes_count' => $track->likes()->count()]);
    }

    public function togglePostLike(Request $request, FeedPost $feedPost): JsonResponse
    {
        $like = FeedPostLike::where(['feed_post_id' => $feedPost->id, 'user_id' => $request->user()->id])->first();
        $liked = ! $like;
        $like ? $like->delete() : FeedPostLike::create(['feed_post_id' => $feedPost->id, 'user_id' => $request->user()->id]);
        $count = $feedPost->userLikes()->count();
        $feedPost->update(['likes' => $count]);

        return response()->json(['liked' => $liked, 'likes_count' => $count]);
    }

    public function togglePostBookmark(Request $request, FeedPost $feedPost): JsonResponse
    {
        $bookmark = FeedPostBookmark::where([
            'feed_post_id' => $feedPost->id,
            'user_id' => $request->user()->id,
        ])->first();
        $saved = ! $bookmark;
        $bookmark
            ? $bookmark->delete()
            : FeedPostBookmark::create(['feed_post_id' => $feedPost->id, 'user_id' => $request->user()->id]);

        return response()->json([
            'saved' => $saved,
            'bookmarks_count' => $feedPost->bookmarks()->count(),
        ]);
    }

    public function togglePostRepost(Request $request, FeedPost $feedPost): JsonResponse
    {
        $repost = FeedPostRepost::where([
            'feed_post_id' => $feedPost->id,
            'user_id' => $request->user()->id,
        ])->first();
        $reposted = ! $repost;
        $repost
            ? $repost->delete()
            : FeedPostRepost::create(['feed_post_id' => $feedPost->id, 'user_id' => $request->user()->id]);
        $count = $feedPost->reposts()->count();
        $feedPost->update(['reposts' => $count]);

        return response()->json(['reposted' => $reposted, 'reposts_count' => $count]);
    }

    public function sharePost(FeedPost $feedPost): JsonResponse
    {
        $feedPost->increment('shares');

        return response()->json(['shares_count' => (int) $feedPost->fresh()->shares]);
    }

    public function viewPost(Request $request, FeedPost $feedPost): JsonResponse
    {
        $data = $request->validate(['session_id' => 'nullable|uuid']);
        $viewer = auth('sanctum')->user();
        $identity = $data['session_id'] ?? ($viewer ? 'user:'.$viewer->id : 'ip:'.$request->ip());
        $view = ContentView::firstOrCreate([
            'viewable_type' => 'feed_post',
            'viewable_id' => $feedPost->id,
            'viewer_key' => hash('sha256', $identity.'|'.config('app.key')),
        ], [
            'user_id' => $viewer?->id,
        ]);

        if (! $view->wasRecentlyCreated) {
            return response()->json(['views' => (string) $feedPost->views, 'recorded' => false]);
        }

        $views = $this->numericViewCount((string) $feedPost->views) + 1;
        $feedPost->update(['views' => (string) $views]);

        AnalyticsEvent::create([
            'user_id' => $viewer?->id,
            'session_id' => $data['session_id'] ?? null,
            'event_type' => 'post_view',
            'path' => '/news-feed',
            'entity_type' => 'feed_post',
            'entity_id' => $feedPost->id,
            'ip_hash' => hash('sha256', (string) $request->ip().'|'.config('app.key')),
        ]);

        return response()->json(['views' => (string) $views, 'recorded' => true]);
    }

    public function comments(FeedPost $feedPost): JsonResponse
    {
        return response()->json($feedPost->userComments()->with('user:id,name')->where('is_active', true)->latest()->get());
    }

    public function comment(Request $request, FeedPost $feedPost): JsonResponse
    {
        $data = $request->validate(['body' => 'required|string|max:1000']);
        $comment = FeedPostComment::create(['feed_post_id' => $feedPost->id, 'user_id' => $request->user()->id, 'body' => $data['body']]);
        $feedPost->update(['comments' => $feedPost->userComments()->where('is_active', true)->count()]);

        return response()->json($comment->load('user:id,name'), 201);
    }

    public function votePoll(Request $request, FeedPost $feedPost): JsonResponse
    {
        $data = $request->validate(['option_index' => 'required|integer|min:0']);
        $options = $feedPost->poll_options ?? [];
        abort_unless($feedPost->kind === 'poll' && array_key_exists($data['option_index'], $options), 422, 'That poll option is not available.');

        FeedPollVote::updateOrCreate(
            ['feed_post_id' => $feedPost->id, 'user_id' => $request->user()->id],
            ['option_index' => $data['option_index']],
        );

        $counts = FeedPollVote::where('feed_post_id', $feedPost->id)
            ->selectRaw('option_index, count(*) as total')
            ->groupBy('option_index')
            ->pluck('total', 'option_index');
        $totalVotes = (int) $counts->sum();
        $results = collect($options)->values()->map(function (array $option, int $index) use ($counts, $totalVotes) {
            $votes = (int) ($counts[$index] ?? 0);

            return [
                'option' => $option['option'],
                'percent' => $totalVotes ? (int) round(($votes / $totalVotes) * 100) : 0,
                'votes' => $votes,
            ];
        })->all();

        $feedPost->update(['poll_options' => $results]);

        return response()->json([
            'poll_options' => $results,
            'selected_option_index' => $data['option_index'],
            'total_votes' => $totalVotes,
        ]);
    }

    private function numericViewCount(string $value): int
    {
        $value = trim(strtoupper($value));
        if (is_numeric($value)) {
            return (int) $value;
        }

        if (preg_match('/^([0-9]+(?:\.[0-9]+)?)([KMB])$/', $value, $matches)) {
            $multipliers = ['K' => 1000, 'M' => 1000000, 'B' => 1000000000];

            return (int) round((float) $matches[1] * $multipliers[$matches[2]]);
        }

        return 0;
    }
}
