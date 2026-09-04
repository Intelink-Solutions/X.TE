<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FeedPost;
use App\Services\MediaSyncService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;
use Illuminate\Validation\Rule;

class FeedPostController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = FeedPost::where('is_active', true)->where('approval_status', 'approved');

        if ($request->has('kind')) {
            $query->where('kind', $request->kind);
        }
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $posts = $query->with(['user.roles', 'track'])->orderByDesc('is_pinned')->latest()->paginate(20);
        $posts->getCollection()->transform(function (FeedPost $post) {
            $post->setAttribute('track_id', $post->track?->id);
            $post->setAttribute('author_type', $post->user?->getRoleNames()->first());
            $post->setAttribute('image_url', $this->mediaDeliveryUrl($post->image_url));
            $post->unsetRelation('user');

            return $post;
        });

        return response()->json($posts);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'author' => 'nullable|string|max:255',
            'handle' => 'nullable|string|max:100',
            'verified' => 'boolean',
            'category' => 'required|string|max:100',
            'kind' => 'required|in:update,photo,video,music,event,ticket,news,poll,podcast,announcement,tv,production',
            'title' => 'nullable|string|max:255',
            'text' => 'nullable|required_without_all:image,audio|string|max:2000',
            'hashtags' => 'nullable|array',
            'hashtags.*' => 'string|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
            'location' => 'nullable|string|max:255',
            'image_key' => 'nullable|string|max:50',
            'image_url' => 'nullable|string|max:500',
            'image' => 'nullable|image|mimes:jpg,jpeg,png,webp|max:10240',
            'audio' => [
                'nullable',
                Rule::prohibitedIf(fn () => filled($request->input('media_url'))),
                'file',
                'mimetypes:audio/mpeg,audio/mp4,video/mp4,application/mp4,audio/x-m4a,audio/wav,audio/x-wav,audio/ogg,application/ogg,audio/aac,audio/x-aac',
                'max:25600',
            ],
            'media_url' => [
                'nullable',
                Rule::prohibitedIf(fn () => $request->hasFile('audio')),
                'url:http,https',
                'max:500',
            ],
            'event_date' => 'nullable|date',
            'venue' => 'nullable|string|max:255',
            'ticket_price' => 'nullable|string|max:40',
            'ticket_url' => 'nullable|url|max:500',
            'poll_options' => 'required_if:kind,poll|nullable|array|min:2|max:6',
            'poll_options.*.option' => 'required|string|max:180',
            'poll_options.*.percent' => 'nullable|integer|min:0|max:100',
            'likes' => 'integer|min:0',
            'comments' => 'integer|min:0',
            'shares' => 'integer|min:0',
            'reposts' => 'integer|min:0',
            'views' => 'nullable|string|max:20',
            'is_pinned' => 'boolean',
        ]);

        if ($request->input('kind') === 'music' && ! $request->hasFile('audio') && blank($data['media_url'] ?? null)) {
            return response()->json([
                'message' => 'Choose either an audio file or an embedded audio URL.',
                'errors' => ['audio' => ['An audio file or embedded audio URL is required.']],
            ], 422);
        }
        $user = $request->user();
        $data['user_id'] = $user?->id;
        $data['author'] = $data['author'] ?? $user?->name ?? 'Community Creator';
        $data['handle'] = $data['handle'] ?? ('@'.str($data['author'])->slug(''));
        $data['verified'] = (bool) ($user?->approvedCreatorRequest() || $user?->hasAnyRole(['Artist', 'Musician', 'Super Admin', 'Administrator']));
        $data['text'] = $data['text'] ?? '';

        if ($request->hasFile('image')) {
            $imagePath = $request->file('image')->store('feed-posts', 'public');

            if (! is_string($imagePath) || ! Storage::disk('public')->exists($imagePath)) {
                throw ValidationException::withMessages([
                    'image' => ['The image could not be saved. Check the backend storage permissions and try again.'],
                ]);
            }

            $data['image_url'] = '/api/media/'.$imagePath;
            $data['image_key'] = null;
            if ($data['kind'] === 'update') {
                $data['kind'] = 'photo';
                $data['category'] = 'Photos';
            }
        }

        if ($request->hasFile('audio')) {
            $audio = $request->file('audio');
            $audioPath = $audio->store('feed-music', 'public');
            if (! is_string($audioPath) || ! Storage::disk('public')->exists($audioPath)) {
                throw ValidationException::withMessages([
                    'audio' => ['The audio file could not be saved. Check the backend storage permissions and try again.'],
                ]);
            }
            $data['media_url'] = '/api/media/'.$audioPath;
            $data['kind'] = 'music';
            $data['category'] = 'Music';
            $data['title'] = $data['title'] ?? pathinfo($audio->getClientOriginalName(), PATHINFO_FILENAME);
        }

        // Music always enters moderation, even for an approved creator. Other
        // creator content keeps the account's direct-publishing permission.
        $requiresReview = $data['kind'] === 'music';
        $data['approval_status'] = ! $requiresReview && $data['verified'] ? 'approved' : 'pending';
        $data['is_active'] = $data['approval_status'] === 'approved';

        unset($data['image'], $data['audio']);

        $post = FeedPost::create($data);
        app(MediaSyncService::class)->feedPost($post);
        $post->setAttribute('track_id', $post->track()->value('id'));

        return response()->json($post, $data['approval_status'] === 'approved' ? 201 : 202);
    }

    public function show(FeedPost $feedPost): JsonResponse
    {
        $feedPost->setAttribute('image_url', $this->mediaDeliveryUrl($feedPost->image_url));

        return response()->json($feedPost);
    }

    public function update(Request $request, FeedPost $feedPost): JsonResponse
    {
        $data = $request->validate([
            'author' => 'sometimes|string|max:255',
            'handle' => 'sometimes|string|max:100',
            'verified' => 'boolean',
            'category' => 'sometimes|string|max:100',
            'kind' => 'in:update,photo,video,music,event,ticket,news,poll,podcast,announcement,tv,production',
            'title' => 'nullable|string|max:255',
            'text' => 'sometimes|string|max:2000',
            'hashtags' => 'nullable|array',
            'hashtags.*' => 'string|max:100',
            'tags' => 'nullable|array',
            'tags.*' => 'string|max:100',
            'location' => 'nullable|string|max:255',
            'image_key' => 'nullable|string|max:50',
            'image_url' => 'nullable|string|max:500',
            'media_url' => 'nullable|url|max:500',
            'event_date' => 'nullable|date',
            'venue' => 'nullable|string|max:255',
            'ticket_price' => 'nullable|string|max:40',
            'ticket_url' => 'nullable|url|max:500',
            'poll_options' => 'nullable|array',
            'likes' => 'integer|min:0',
            'comments' => 'integer|min:0',
            'shares' => 'integer|min:0',
            'reposts' => 'integer|min:0',
            'views' => 'nullable|string|max:20',
            'is_pinned' => 'boolean',
            'is_active' => 'boolean',
            'approval_status' => 'in:pending,approved,rejected',
        ]);
        $feedPost->update($data);
        app(MediaSyncService::class)->feedPost($feedPost->fresh());

        return response()->json($feedPost);
    }

    public function destroy(FeedPost $feedPost): JsonResponse
    {
        $feedPost->delete();

        return response()->json(null, 204);
    }

    private function mediaDeliveryUrl(?string $url): ?string
    {
        if (blank($url)) {
            return $url;
        }

        $path = parse_url($url, PHP_URL_PATH);

        if (is_string($path) && str_starts_with($path, '/storage/')) {
            return '/api/media/'.ltrim(substr($path, strlen('/storage/')), '/');
        }

        return $url;
    }
}
