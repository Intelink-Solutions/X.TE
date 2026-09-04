<?php

namespace App\Livewire\Admin;

use App\Notifications\ApprovalNotification;
use Livewire\Component;
use Livewire\WithPagination;
use Livewire\WithFileUploads;
use App\Models\Track;
use App\Models\Artist;

class TrackManager extends Component
{
    use WithPagination, WithFileUploads;

    public string $search = '';
    public string $filterApproval = '';
    public bool   $showForm = false;
    public ?int   $editingId = null;

    public ?int  $artist_id = null;
    public string $title = '', $album = '', $duration = '', $plays = '', $audio_url = '', $cover_url = '', $genre = '', $released_at = '';
    public bool   $is_featured = false, $is_active = true;
    public $cover = null;

    protected function rules(): array {
        return [
            'artist_id'   => 'required|exists:artists,id',
            'title'       => 'required|string|max:255',
            'album'       => 'nullable|string|max:255',
            'duration'    => 'nullable|string|max:20',
            'plays'       => 'nullable|string|max:20',
            'audio_url'   => 'nullable|string|max:500',
            'cover'       => 'nullable|image|max:5120',
            'genre'       => 'nullable|string|max:100',
            'released_at' => 'nullable|date',
            'is_featured' => 'boolean',
            'is_active'   => 'boolean',
        ];
    }

    public function updatingSearch(): void { $this->resetPage(); }

    public function create(): void
    {
        $this->reset(['artist_id','title','album','duration','plays','audio_url','cover_url','genre','released_at','is_featured','editingId','cover']);
        $this->is_active = true;
        $this->showForm = true;
    }

    public function edit(int $id): void
    {
        $t = Track::findOrFail($id);
        $this->editingId   = $id;
        $this->artist_id   = $t->artist_id;
        $this->title       = $t->title;
        $this->album       = $t->album ?? '';
        $this->duration    = $t->duration ?? '';
        $this->plays       = $t->plays ?? '';
        $this->audio_url   = $t->audio_url ?? '';
        $this->cover_url   = $t->cover_url ?? '';
        $this->genre       = $t->genre ?? '';
        $this->released_at = $t->released_at ? $t->released_at->format('Y-m-d') : '';
        $this->is_featured = $t->is_featured;
        $this->is_active   = $t->is_active;
        $this->cover       = null;
        $this->showForm    = true;
    }

    public function save(): void
    {
        $this->validate();

        $data = [
            'artist_id'   => $this->artist_id,
            'title'       => $this->title,
            'album'       => $this->album,
            'duration'    => $this->duration,
            'plays'       => $this->plays,
            'audio_url'   => $this->audio_url,
            'genre'       => $this->genre,
            'released_at' => $this->released_at,
            'is_featured' => $this->is_featured,
            'is_active'   => $this->is_active,
        ];

        if ($this->cover) {
            $filename = $this->cover->store('tracks', 'public');
            $data['cover_url'] = '/storage/' . $filename;
        } elseif (!$this->editingId) {
            $data['cover_url'] = $this->cover_url;
        }

        if ($this->editingId) {
            Track::findOrFail($this->editingId)->update($data);
            session()->flash('message', 'Track updated.');
        } else {
            Track::create($data);
            session()->flash('message', 'Track created.');
        }

        $this->showForm = false;
        $this->reset(['artist_id','title','album','duration','plays','audio_url','cover_url','genre','released_at','is_featured','editingId','cover']);
        $this->is_active = true;
    }

    public function delete(int $id): void {
        Track::findOrFail($id)->delete();
        session()->flash('message', 'Track deleted.');
    }

    public function review(int $id, string $status): void
    {
        abort_unless(in_array($status, ['approved', 'rejected'], true), 422);
        $track = Track::with(['artist', 'submitter', 'feedPost.user'])->findOrFail($id);
        $wasApproved = $track->approval_status === 'approved';
        $track->update([
            'approval_status' => $status,
            'approved_by' => auth()->id(),
            'approved_at' => now(),
            'is_active' => $status === 'approved',
        ]);

        if ($track->feedPost) {
            $track->feedPost->update([
                'approval_status' => $status,
                'is_active' => $status === 'approved',
            ]);
        }

        $owner = $track->submitter ?? $track->feedPost?->user;
        if ($status === 'approved' && ! $wasApproved && $owner) {
            $owner->notify(new ApprovalNotification(
                approvalType: 'music',
                title: 'Your music was approved',
                message: "Your music is now live on X'Touch Media and can be played from the feed and Music page. Keep sharing it to gain more listeners.",
                url: $track->feed_post_id ? '/news-feed#post-'.$track->feed_post_id : '/music',
                entityId: $track->id,
            ));
        }

        session()->flash('message', "Track {$status}.");
    }

    public function render()
    {
        return view('livewire.admin.track-manager', [
            'tracks'  => Track::with('artist')->when($this->search, fn($q)=>$q->where('title','like',"%{$this->search}%"))
                ->when($this->filterApproval, fn($q) => $q->where('approval_status', $this->filterApproval))
                ->orderByDesc('is_featured')->latest()->paginate(15),
            'artists' => Artist::orderBy('name')->pluck('name','id'),
        ])->layout('layouts.app');
    }
}
