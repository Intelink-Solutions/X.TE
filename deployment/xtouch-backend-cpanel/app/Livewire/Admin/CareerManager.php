<?php
namespace App\Livewire\Admin;
use Livewire\Component; use Livewire\WithPagination; use App\Models\Career;
class CareerManager extends Component {
    use WithPagination;
    public string $search=''; public bool $showForm=false; public ?int $editingId=null;
    public string $title='', $department='', $location='Accra, Ghana', $type='Full-time', $description='', $requirements='', $salary_range='', $closes_at='';
    public bool $is_active=true;
    public function create(): void { $this->reset(['title','department','description','requirements','salary_range','closes_at','is_featured','editingId']); $this->location='Accra, Ghana'; $this->type='Full-time'; $this->is_active=true; $this->showForm=true; }
    public function edit(int $id): void {
        $c=Career::findOrFail($id);
        $this->fill($c->only(['title','department','location','type','description','requirements','salary_range','is_active']));
        $this->closes_at=$c->closes_at?$c->closes_at->format('Y-m-d'):'';
        $this->editingId=$id; $this->showForm=true;
    }
    public function save(): void {
        $data=$this->validate(['title'=>'required|string|max:255','department'=>'required|string|max:100','location'=>'nullable|string|max:255','type'=>'in:Full-time,Part-time,Contract,Internship','description'=>'required|string','requirements'=>'nullable|string','salary_range'=>'nullable|string|max:100','closes_at'=>'nullable|date','is_active'=>'boolean']);
        if($this->editingId) { Career::findOrFail($this->editingId)->update($data); session()->flash('message','Career updated.'); }
        else { Career::create($data); session()->flash('message','Career created.'); }
        $this->showForm=false;
    }
    public function delete(int $id): void { Career::findOrFail($id)->delete(); session()->flash('message','Deleted.'); }
    public function render() {
        return view('livewire.admin.career-manager', ['careers'=>Career::when($this->search,fn($q)=>$q->where('title','like',"%{$this->search}%"))->orderBy('department')->paginate(15)])->layout('layouts.app');
    }
}
