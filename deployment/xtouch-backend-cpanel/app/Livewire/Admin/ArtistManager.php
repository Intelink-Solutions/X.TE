<?php

namespace App\Livewire\Admin;

use Livewire\Component;
use Livewire\WithPagination;
use Livewire\WithFileUploads;
use App\Models\Artist;
use Illuminate\Support\Str;

class ArtistManager extends Component
{
    use WithPagination, WithFileUploads;

    public string $search = '';
    public bool   $showForm = false;
    public ?int   $editingId = null;

    public string $name = '', $role = '', $genre = '', $monthly_listeners = '',
                  $bio = '', $image_url = '', $instagram_url = '', $spotify_url = '';
    public bool   $is_featured = false, $is_active = true;
    public $image = null;

    protected $queryString = ['search'];

    protected function rules(): array
    {
        return [
            'name'              => 'required|string|max:255',
            'role'              => 'required|string|max:255',
            'genre'             => 'nullable|string|max:100',
            'monthly_listeners' => 'nullable|string|max:50',
            'bio'               => 'nullable|string',
            'image'             => 'nullable|image|max:5120',
            'instagram_url'     => 'nullable|string|max:500',
            'spotify_url'       => 'nullable|string|max:500',
            'is_featured'       => 'boolean',
            'is_active'         => 'boolean',
        ];
    }

    public function updatingSearch(): void { $this->resetPage(); }

    public function create(): void
    {
        $this->reset(['name','role','genre','monthly_listeners','bio','image_url','instagram_url','spotify_url','is_featured','editingId','image']);
        $this->is_active = true;
        $this->showForm  = true;
    }

    public function edit(int $id): void
    {
        $artist = Artist::findOrFail($id);
        $this->editingId         = $id;
        $this->name              = $artist->name;
        $this->role              = $artist->role;
        $this->genre             = $artist->genre ?? '';
        $this->monthly_listeners = $artist->monthly_listeners ?? '';
        $this->bio               = $artist->bio ?? '';
        $this->image_url         = $artist->image_url ?? '';
        $this->instagram_url     = $artist->instagram_url ?? '';
        $this->spotify_url       = $artist->spotify_url ?? '';
        $this->is_featured       = $artist->is_featured;
        $this->is_active         = $artist->is_active;
        $this->image             = null;
        $this->showForm          = true;
    }

    public function save(): void
    {
        $this->validate();
        
        $data = [
            'name'              => $this->name,
            'role'              => $this->role,
            'genre'             => $this->genre,
            'monthly_listeners' => $this->monthly_listeners,
            'bio'               => $this->bio,
            'instagram_url'     => $this->instagram_url,
            'spotify_url'       => $this->spotify_url,
            'is_featured'       => $this->is_featured,
            'is_active'         => $this->is_active,
            'slug'              => Str::slug($this->name),
        ];

        // Handle file upload
        if ($this->image) {
            $filename = $this->image->store('artists', 'public');
            $data['image_url'] = '/storage/' . $filename;
        } elseif ($this->image_url === '' && $this->editingId) {
            // Allow clearing image
            $data['image_url'] = null;
        } elseif (!$this->editingId) {
            $data['image_url'] = $this->image_url;
        }

        if ($this->editingId) {
            Artist::findOrFail($this->editingId)->update($data);
            session()->flash('message', 'Artist updated.');
        } else {
            Artist::create($data);
            session()->flash('message', 'Artist created.');
        }
        
        $this->showForm = false;
        $this->reset(['name','role','genre','monthly_listeners','bio','image_url','instagram_url','spotify_url','is_featured','editingId','image']);
        $this->is_active = true;
    }

    public function delete(int $id): void
    {
        Artist::findOrFail($id)->delete();
        session()->flash('message', 'Artist deleted.');
    }

    public function render()
    {
        return view('livewire.admin.artist-manager', [
            'artists' => Artist::when($this->search, fn($q) => $q->where('name','like',"%{$this->search}%"))
                ->orderByDesc('is_featured')->orderBy('name')->paginate(15),
        ])->layout('layouts.app');
    }
}
