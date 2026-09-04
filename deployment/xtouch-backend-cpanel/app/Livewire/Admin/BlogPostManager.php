<?php

namespace App\Livewire\Admin;

use App\Models\BlogPost;
use Illuminate\Support\Str;
use Livewire\Component;
use Livewire\WithFileUploads;
use Livewire\WithPagination;

class BlogPostManager extends Component
{
    use WithFileUploads, WithPagination;

    public string $search = '';

    public bool $showForm = false;

    public ?int $editingId = null;

    public string $title = '';

    public string $category = '';

    public string $excerpt = '';

    public string $body = '';

    public string $author = '';

    public string $read_time = '';

    public string $image_url = '';

    public string $published_at = '';

    public string $tags = '';

    public $image = null;

    public bool $is_featured = false;

    public bool $is_published = false;

    public function create(): void
    {
        $this->reset(['title', 'category', 'excerpt', 'body', 'author', 'read_time', 'image_url', 'published_at', 'tags', 'image', 'is_featured', 'editingId']);
        $this->is_published = false;
        $this->showForm = true;
    }

    public function edit(int $id): void
    {
        $p = BlogPost::findOrFail($id);
        $this->editingId = $id;
        $this->title = $p->title;
        $this->category = $p->category;
        $this->excerpt = $p->excerpt;
        $this->body = $p->body ?? '';
        $this->author = $p->author ?? '';
        $this->read_time = $p->read_time ?? '';
        $this->image_url = $p->image_url ?? '';
        $this->tags = implode(', ', $p->tags ?? []);
        $this->image = null;
        $this->published_at = $p->published_at ? $p->published_at->format('Y-m-d') : '';
        $this->is_featured = $p->is_featured;
        $this->is_published = $p->is_published;
        $this->showForm = true;
    }

    public function save(): void
    {
        $data = $this->validate([
            'title' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'tags' => 'nullable|string|max:500',
            'excerpt' => 'required|string|max:500',
            'body' => 'nullable|string',
            'author' => 'nullable|string|max:255',
            'read_time' => 'nullable|string|max:20',
            'image_url' => 'nullable|string|max:500',
            'image' => 'nullable|image|max:10240',
            'published_at' => 'nullable|date',
            'is_featured' => 'boolean',
            'is_published' => 'boolean',
        ]);
        $data['tags'] = collect(explode(',', $this->tags))->map(fn ($tag) => trim($tag))->filter()->unique()->take(12)->values()->all();
        if ($this->image) {
            $data['image_url'] = '/storage/'.$this->image->store('blog-images', 'public');
        }
        unset($data['image']);
        $data['slug'] = Str::slug($this->title);
        if ($this->editingId) {
            BlogPost::findOrFail($this->editingId)->update($data);
            session()->flash('message', 'Post updated.');
        } else {
            BlogPost::create($data);
            session()->flash('message', 'Post created.');
        }
        $this->showForm = false;
    }

    public function delete(int $id): void
    {
        BlogPost::findOrFail($id)->delete();
        session()->flash('message', 'Post deleted.');
    }

    public function render()
    {
        return view('livewire.admin.blog-post-manager', [
            'posts' => BlogPost::when($this->search, fn ($q) => $q->where('title', 'like', "%{$this->search}%"))
                ->orderByDesc('published_at')->paginate(15),
        ])->layout('layouts.app');
    }
}
