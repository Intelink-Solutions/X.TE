<?php
namespace App\Livewire\Admin;
use Livewire\Component; use Livewire\WithPagination; use App\Models\StoreProduct; use Illuminate\Support\Str;
class StoreProductManager extends Component {
    use WithPagination;
    public string $search=''; public bool $showForm=false; public ?int $editingId=null;
    public string $name='', $category='', $description='', $currency='ZMW', $image_url='';
    public float $price=0; public int $stock=0; public bool $is_featured=false, $is_active=true;
    public function create(): void { $this->reset(['name','category','description','image_url','is_featured','editingId']); $this->price=0; $this->stock=0; $this->currency='ZMW'; $this->is_active=true; $this->showForm=true; }
    public function edit(int $id): void {
        $p=StoreProduct::findOrFail($id); $this->fill($p->only(['name','category','description','price','currency','image_url','stock','is_featured','is_active']));
        $this->price=(float)$p->price; $this->editingId=$id; $this->showForm=true;
    }
    public function save(): void {
        $data=$this->validate(['name'=>'required|string|max:255','category'=>'nullable|string|max:100','description'=>'nullable|string','price'=>'required|numeric|min:0','currency'=>'nullable|string|max:10','image_url'=>'nullable|string|max:500','stock'=>'integer|min:0','is_featured'=>'boolean','is_active'=>'boolean']);
        $data['slug']=Str::slug($this->name);
        if($this->editingId) { StoreProduct::findOrFail($this->editingId)->update($data); session()->flash('message','Product updated.'); }
        else { StoreProduct::create($data); session()->flash('message','Product created.'); }
        $this->showForm=false;
    }
    public function delete(int $id): void { StoreProduct::findOrFail($id)->delete(); session()->flash('message','Deleted.'); }
    public function render() {
        return view('livewire.admin.store-product-manager', ['products'=>StoreProduct::when($this->search,fn($q)=>$q->where('name','like',"%{$this->search}%"))->orderByDesc('is_featured')->paginate(20)])->layout('layouts.app');
    }
}
