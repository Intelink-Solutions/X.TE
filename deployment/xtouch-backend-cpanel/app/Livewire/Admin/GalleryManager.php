<?php
namespace App\Livewire\Admin;
use Livewire\Component; use Livewire\WithPagination; use App\Models\GalleryItem;
class GalleryManager extends Component {
    use WithPagination;
    public string $search=''; public bool $showForm=false; public ?int $editingId=null;
    public string $title='', $category='', $image_url='', $video_url='', $kind='photo', $caption='';
    public bool $is_featured=false, $is_active=true; public int $sort_order=0;
    public function create(): void { $this->reset(['title','category','image_url','video_url','caption','is_featured','editingId']); $this->kind='photo'; $this->is_active=true; $this->showForm=true; }
    public function edit(int $id): void {
        $g=GalleryItem::findOrFail($id); $this->fill($g->only(['title','category','image_url','video_url','kind','caption','is_featured','is_active','sort_order']));
        $this->editingId=$id; $this->showForm=true;
    }
    public function save(): void {
        $data=$this->validate(['title'=>'nullable|string|max:255','category'=>'nullable|string|max:100','image_url'=>'required|string|max:500','video_url'=>'nullable|string|max:500','kind'=>'in:photo,video','caption'=>'nullable|string|max:500','is_featured'=>'boolean','is_active'=>'boolean','sort_order'=>'integer']);
        if($this->editingId) { GalleryItem::findOrFail($this->editingId)->update($data); session()->flash('message','Updated.'); }
        else { GalleryItem::create($data); session()->flash('message','Created.'); }
        $this->showForm=false;
    }
    public function delete(int $id): void { GalleryItem::findOrFail($id)->delete(); session()->flash('message','Deleted.'); }
    public function render() {
        return view('livewire.admin.gallery-manager', ['items'=>GalleryItem::when($this->search,fn($q)=>$q->where('title','like',"%{$this->search}%"))->orderBy('sort_order')->paginate(20)])->layout('layouts.app');
    }
}
