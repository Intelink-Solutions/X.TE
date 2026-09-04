<?php

namespace App\Livewire\Admin;

use App\Models\FeedPost;
use App\Notifications\ApprovalNotification;
use App\Services\MediaSyncService;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Livewire\Component;
use Livewire\WithFileUploads;
use Livewire\WithPagination;

class FeedPostManager extends Component
{
    use WithFileUploads, WithPagination;

    public string $search = '';

    public string $filterKind = '';

    public string $filterApproval = '';

    public bool $showForm = false;

    public ?int $editingId = null;

    public string $author = '';

    public string $handle = '';

    public string $text = '';

    public string $kind = 'photo';

    public string $category = 'Updates';

    public bool $is_pinned = false;

    public bool $is_active = true;

    public $image = null;

    protected function rules(): array
    {
        return [
            'author' => 'required|string|max:255',
            'handle' => 'required|string|max:100',
            'text' => 'required|string|max:1000',
            'kind' => 'required|in:update,photo,video,music,event,ticket,news,poll,podcast,announcement',
            'category' => 'required|string|max:100',
            'image' => 'nullable|image|max:5120',
            'is_pinned' => 'boolean',
            'is_active' => 'boolean',
        ];
    }

    public function create(): void
    {
        $this->reset(['author', 'handle', 'text', 'kind', 'category', 'editingId', 'image']);
        $this->kind = 'photo';
        $this->category = 'Updates';
        $this->is_pinned = false;
        $this->is_active = true;
        $this->showForm = true;
    }

    public function edit(int $id): void
    {
        $post = FeedPost::findOrFail($id);
        $this->editingId = $id;
        $this->author = $post->author;
        $this->handle = $post->handle;
        $this->text = $post->text;
        $this->kind = $post->kind;
        $this->category = $post->category;
        $this->is_pinned = $post->is_pinned;
        $this->is_active = $post->is_active;
        $this->image = null;
        $this->showForm = true;
    }

    public function save(): void
    {
        $this->validate();

        $data = [
            'author' => $this->author,
            'handle' => $this->handle,
            'text' => $this->text,
            'kind' => $this->kind,
            'category' => $this->category,
            'is_pinned' => $this->is_pinned,
            'is_active' => $this->is_active,
            'approval_status' => 'approved',
            'slug' => Str::slug($this->handle.'-'.now()->timestamp),
        ];

        if ($this->image) {
            $filename = $this->image->store('posts', 'public');

            if (! is_string($filename) || ! Storage::disk('public')->exists($filename)) {
                $this->addError('image', 'The image could not be saved. Check the backend storage permissions and try again.');

                return;
            }

            $data['image_url'] = '/api/media/'.$filename;
        }

        if ($this->editingId) {
            FeedPost::findOrFail($this->editingId)->update($data);
            session()->flash('message', 'Post updated.');
        } else {
            FeedPost::create($data);
            session()->flash('message', 'Post created.');
        }

        $this->showForm = false;
        $this->reset(['author', 'handle', 'text', 'kind', 'category', 'editingId', 'image']);
    }

    public function delete(int $id): void
    {
        FeedPost::findOrFail($id)->delete();
        session()->flash('message', 'Post deleted.');
    }

    public function togglePin(int $id): void
    {
        $p = FeedPost::findOrFail($id);
        $p->update(['is_pinned' => ! $p->is_pinned]);
    }

    public function toggleActive(int $id): void
    {
        $p = FeedPost::findOrFail($id);
        $p->update(['is_active' => ! $p->is_active]);
    }

    public function review(int $id, string $status): void
    {
        abort_unless(in_array($status, ['approved', 'rejected'], true), 422);
        $post = FeedPost::findOrFail($id);
        $wasApproved = $post->approval_status === 'approved';
        $post->update([
            'approval_status' => $status,
            'is_active' => $status === 'approved',
        ]);
        app(MediaSyncService::class)->feedPost($post->fresh());

        if ($status === 'approved' && ! $wasApproved && $post->user) {
            $contentType = strtolower($post->category ?: $post->kind ?: 'content');
            $post->user->notify(new ApprovalNotification(
                approvalType: 'post',
                title: "Your {$contentType} post was approved",
                message: "Your post is now published on X'Touch Media and viewable by everyone. Continue posting to gain engagement and more views.",
                url: '/news-feed#post-'.$post->id,
                entityId: $post->id,
            ));
        }

        session()->flash('message', "Feed post {$status}.");
    }

    public function render()
    {
        $kinds = ['update', 'photo', 'video', 'music', 'event', 'ticket', 'news', 'poll', 'podcast', 'announcement'];

        return view('livewire.admin.feed-post-manager', [
            'posts' => FeedPost::when($this->search, fn ($q) => $q->where('author', 'like', "%{$this->search}%")->orWhere('text', 'like', "%{$this->search}%"))
                ->when($this->filterKind, fn ($q) => $q->where('kind', $this->filterKind))
                ->when($this->filterApproval, fn ($q) => $q->where('approval_status', $this->filterApproval))
                ->orderByDesc('is_pinned')->latest()->paginate(20),
            'kinds' => $kinds,
        ])->layout('layouts.app');
    }
}
