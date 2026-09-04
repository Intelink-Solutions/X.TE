<?php

namespace App\Livewire\Admin;

use App\Models\PodcastEpisode;
use App\Services\MediaSyncService;
use Illuminate\Support\Str;
use Livewire\Component;
use Livewire\WithFileUploads;
use Livewire\WithPagination;

class PodcastManager extends Component
{
    use WithFileUploads, WithPagination;

    public bool $showForm = false;

    public ?int $editingId = null;

    public string $title = '';

    public string $guest = '';

    public string $description = '';

    public string $audio_url = '';

    public string $video_url = '';

    public string $duration = '';

    public string $cover_url = '';

    public string $published_at = '';

    public ?int $episode_number = null;

    public bool $is_featured = false;

    public bool $is_active = true;

    public $audio = null;

    public $cover = null;

    public function create(): void
    {
        $this->reset(['title', 'guest', 'description', 'audio_url', 'video_url', 'duration', 'cover_url', 'published_at', 'episode_number', 'is_featured', 'editingId', 'audio', 'cover']);
        $this->is_active = true;
        $this->showForm = true;
    }

    public function edit(int $id): void
    {
        $p = PodcastEpisode::findOrFail($id);
        $this->fill($p->only(['title', 'guest', 'description', 'audio_url', 'video_url', 'duration', 'cover_url', 'episode_number', 'is_featured', 'is_active']));
        $this->published_at = $p->published_at ? $p->published_at->format('Y-m-d') : '';
        $this->editingId = $id;
        $this->audio = null;
        $this->cover = null;
        $this->showForm = true;
    }

    public function save(): void
    {
        $data = $this->validate(['title' => 'required|string|max:255', 'episode_number' => 'nullable|integer', 'guest' => 'nullable|string|max:255', 'description' => 'nullable|string|max:5000', 'audio_url' => 'nullable|string|max:500', 'video_url' => 'nullable|url|max:500', 'duration' => 'nullable|string|max:20', 'cover_url' => 'nullable|string|max:500', 'published_at' => 'nullable|date', 'is_featured' => 'boolean', 'is_active' => 'boolean', 'audio' => 'nullable|file|mimes:mp3,m4a,mp4,wav,ogg,webm|max:30720', 'cover' => 'nullable|image|max:5120']);
        if ($this->audio) {
            $data['audio_url'] = '/storage/'.$this->audio->store('podcasts', 'public');
        }
        if ($this->cover) {
            $data['cover_url'] = '/storage/'.$this->cover->store('podcast-covers', 'public');
        }
        unset($data['audio'],$data['cover']);
        $data['slug'] = Str::slug($this->title);
        $data['approval_status'] = 'approved';
        $data['approved_by'] = auth()->id();
        $data['approved_at'] = now();
        if ($this->editingId) {
            $episode = PodcastEpisode::findOrFail($this->editingId);
            $episode->update($data);
            session()->flash('message', 'Episode updated.');
        } else {
            $episode = PodcastEpisode::create($data);
            session()->flash('message', 'Episode created.');
        }
        app(MediaSyncService::class)->podcast($episode->fresh());
        $this->showForm = false;
    }

    public function review(int $id, string $status): void
    {
        abort_unless(in_array($status, ['approved', 'rejected'], true), 422);
        $episode = PodcastEpisode::findOrFail($id);
        $episode->update(['approval_status' => $status, 'approved_by' => auth()->id(), 'approved_at' => now(), 'is_active' => $status === 'approved']);
        app(MediaSyncService::class)->podcast($episode->fresh());
        session()->flash('message', "Episode {$status}.");
    }

    public function delete(int $id): void
    {
        PodcastEpisode::findOrFail($id)->delete();
        session()->flash('message', 'Deleted.');
    }

    public function render()
    {
        return view('livewire.admin.podcast-media-manager', ['episodes' => PodcastEpisode::orderByDesc('episode_number')->paginate(20)])->layout('layouts.app');
    }
}
