<?php

namespace App\Livewire\Admin;

use App\Models\TvSchedule;
use App\Services\MediaSyncService;
use Livewire\Component;

class TvScheduleManager extends Component
{
    public bool $showForm = false;

    public ?int $editingId = null;

    public string $show_name = '';

    public string $time = '';

    public string $tag = '';

    public string $channel = 'Channel 1';

    public string $day_of_week = '';

    public string $stream_url = '';

    public string $stream_provider = 'youtube';

    public string $description = '';

    public string $starts_at = '';

    public string $ends_at = '';

    public bool $is_live = false;

    public bool $is_active = true;

    public int $sort_order = 0;

    public function create(): void
    {
        $this->reset(['show_name', 'time', 'tag', 'day_of_week', 'stream_url', 'description', 'starts_at', 'ends_at', 'is_live', 'editingId']);
        $this->channel = 'Channel 1';
        $this->stream_provider = 'youtube';
        $this->is_active = true;
        $this->showForm = true;
    }

    public function edit(int $id): void
    {
        $s = TvSchedule::findOrFail($id);
        $this->fill($s->only(['show_name', 'time', 'tag', 'channel', 'day_of_week', 'stream_url', 'stream_provider', 'description', 'is_live', 'is_active', 'sort_order']));
        $this->starts_at = $s->starts_at?->format('Y-m-d\TH:i') ?? '';
        $this->ends_at = $s->ends_at?->format('Y-m-d\TH:i') ?? '';
        $this->editingId = $id;
        $this->showForm = true;
    }

    public function save(): void
    {
        $data = $this->validate(['show_name' => 'required|string|max:255', 'time' => 'required|string|max:10', 'tag' => 'required|string|max:50', 'channel' => 'nullable|string|max:100', 'day_of_week' => 'nullable|string|max:50', 'stream_url' => 'nullable|url|max:1000', 'stream_provider' => 'required|in:youtube,facebook,tiktok,instagram,direct', 'description' => 'nullable|string|max:2000', 'starts_at' => 'nullable|date', 'ends_at' => 'nullable|date|after:starts_at', 'is_live' => 'boolean', 'is_active' => 'boolean', 'sort_order' => 'integer']);
        if ($this->is_live && ! $this->stream_url) {
            $this->addError('stream_url', 'A stream link is required when the programme is live.');

            return;
        }
        if ($this->editingId) {
            $schedule = TvSchedule::findOrFail($this->editingId);
            $schedule->update($data);
            session()->flash('message', 'Schedule updated.');
        } else {
            $schedule = TvSchedule::create($data);
            session()->flash('message', 'Schedule created.');
        }
        app(MediaSyncService::class)->tv($schedule->fresh());
        $this->showForm = false;
    }

    public function delete(int $id): void
    {
        TvSchedule::findOrFail($id)->delete();
        session()->flash('message', 'Deleted.');
    }

    public function render()
    {
        return view('livewire.admin.tv-live-manager', ['schedules' => TvSchedule::orderBy('sort_order')->orderBy('time')->get()])->layout('layouts.app');
    }
}
