<?php
namespace App\Livewire\Admin;
use Livewire\Component;
use Livewire\WithPagination;
use Livewire\WithFileUploads;
use App\Models\Dancer;
use Illuminate\Support\Str;

class DancerManager extends Component {
    use WithPagination, WithFileUploads;
    
    public string $search = '';
    public bool $showForm = false;
    public ?int $editingId = null;
    
    public string $name = '', $role = '', $speciality = '', $bio = '', $image_url = '';
    public bool $is_featured = false, $is_active = true;
    public $image = null;
    
    protected function rules(): array {
        return [
            'name' => 'required|string|max:255',
            'role' => 'nullable|string|max:255',
            'speciality' => 'nullable|string|max:255',
            'bio' => 'nullable|string',
            'image' => 'nullable|image|max:5120',
            'is_featured' => 'boolean',
            'is_active' => 'boolean',
        ];
    }
    
    public function updatingSearch(): void { $this->resetPage(); }
    
    public function create(): void {
        $this->reset(['name', 'role', 'speciality', 'bio', 'image_url', 'is_featured', 'editingId', 'image']);
        $this->is_active = true;
        $this->showForm = true;
    }
    
    public function edit(int $id): void {
        $d = Dancer::findOrFail($id);
        $this->editingId = $id;
        $this->name = $d->name;
        $this->role = $d->role ?? '';
        $this->speciality = $d->speciality ?? '';
        $this->bio = $d->bio ?? '';
        $this->image_url = $d->image_url ?? '';
        $this->is_featured = $d->is_featured;
        $this->is_active = $d->is_active;
        $this->image = null;
        $this->showForm = true;
    }
    
    public function save(): void {
        $this->validate();
        
        $data = [
            'name' => $this->name,
            'role' => $this->role,
            'speciality' => $this->speciality,
            'bio' => $this->bio,
            'is_featured' => $this->is_featured,
            'is_active' => $this->is_active,
            'slug' => Str::slug($this->name),
        ];
        
        if ($this->image) {
            $filename = $this->image->store('dancers', 'public');
            $data['image_url'] = '/storage/' . $filename;
        } elseif (!$this->editingId) {
            $data['image_url'] = $this->image_url;
        }
        
        if ($this->editingId) {
            Dancer::findOrFail($this->editingId)->update($data);
            session()->flash('message', 'Dancer updated.');
        } else {
            Dancer::create($data);
            session()->flash('message', 'Dancer created.');
        }
        
        $this->showForm = false;
        $this->reset(['name', 'role', 'speciality', 'bio', 'image_url', 'is_featured', 'editingId', 'image']);
        $this->is_active = true;
    }
    
    public function delete(int $id): void {
        Dancer::findOrFail($id)->delete();
        session()->flash('message', 'Dancer deleted.');
    }
    
    public function render() {
        return view('livewire.admin.dancer-manager', [
            'dancers' => Dancer::when($this->search, fn($q) => $q->where('name', 'like', "%{$this->search}%"))
                ->orderByDesc('is_featured')->orderBy('name')->paginate(15)
        ])->layout('layouts.app');
    }
}
