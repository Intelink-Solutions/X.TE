<?php

namespace App\Livewire\Admin;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\Event;
use Illuminate\Support\Str;

class EventManager extends Component
{
    use WithPagination;

    public string $search = '';
    public bool   $showForm = false;
    public ?int   $editingId = null;

    public string $name='', $description='', $venue='', $location='',
                  $starts_at='', $ends_at='', $price='', $status='on_sale', $image_url='';
    public ?int   $capacity = null;
    public bool   $is_featured=false, $is_active=true;

    protected $queryString = ['search'];
    public function updatingSearch(): void { $this->resetPage(); }

    public function create(): void
    {
        $this->reset(['name','description','venue','location','starts_at','ends_at','price','image_url','capacity','is_featured','editingId']);
        $this->status = 'on_sale'; $this->is_active = true; $this->showForm = true;
    }

    public function edit(int $id): void
    {
        $e = Event::findOrFail($id);
        $this->editingId   = $id;
        $this->name        = $e->name;
        $this->description = $e->description ?? '';
        $this->venue       = $e->venue;
        $this->location    = $e->location ?? '';
        $this->starts_at   = $e->starts_at ? $e->starts_at->format('Y-m-d\TH:i') : '';
        $this->ends_at     = $e->ends_at   ? $e->ends_at->format('Y-m-d\TH:i')   : '';
        $this->price       = $e->price ?? '';
        $this->status      = $e->status;
        $this->capacity    = $e->capacity;
        $this->image_url   = $e->image_url ?? '';
        $this->is_featured = $e->is_featured;
        $this->is_active   = $e->is_active;
        $this->showForm    = true;
    }

    public function save(): void
    {
        $data = $this->validate([
            'name'        => 'required|string|max:255',
            'description' => 'nullable|string',
            'venue'       => 'required|string|max:255',
            'location'    => 'nullable|string|max:255',
            'starts_at'   => 'required|date',
            'ends_at'     => 'nullable|date',
            'price'       => 'nullable|string|max:50',
            'status'      => 'in:on_sale,selling_fast,few_left,sold_out',
            'capacity'    => 'nullable|integer|min:1',
            'image_url'   => 'nullable|string|max:500',
            'is_featured' => 'boolean',
            'is_active'   => 'boolean',
        ]);
        $data['slug'] = Str::slug($this->name.'-'.now()->format('Y'));
        if ($this->editingId) { Event::findOrFail($this->editingId)->update($data); session()->flash('message','Event updated.'); }
        else                  { Event::create($data); session()->flash('message','Event created.'); }
        $this->showForm = false;
    }

    public function delete(int $id): void
    {
        Event::findOrFail($id)->delete();
        session()->flash('message', 'Event deleted.');
    }

    public function render()
    {
        return view('livewire.admin.event-manager', [
            'events' => Event::when($this->search, fn($q)=>$q->where('name','like',"%{$this->search}%"))
                ->orderBy('starts_at')->paginate(15),
        ])->layout('layouts.app');
    }
}
