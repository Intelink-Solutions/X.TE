<?php

namespace App\Livewire\Admin;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\ContactMessage;

class ContactMessageManager extends Component
{
    use WithPagination;

    public string $filterStatus = 'unread';
    public ?int   $viewingId = null;
    public string $adminReply = '';

    public function view(int $id): void
    {
        $msg = ContactMessage::findOrFail($id);
        if ($msg->status === 'unread') { $msg->update(['status' => 'read']); }
        $this->viewingId  = $id;
        $this->adminReply = $msg->admin_reply ?? '';
    }

    public function reply(): void
    {
        $this->validate(['adminReply' => 'required|string|min:5|max:2000']);
        ContactMessage::findOrFail($this->viewingId)->update([
            'admin_reply' => $this->adminReply,
            'status'      => 'replied',
        ]);
        session()->flash('message', 'Reply saved.');
        $this->viewingId = null;
    }

    public function delete(int $id): void
    {
        ContactMessage::findOrFail($id)->delete();
        session()->flash('message', 'Message deleted.');
    }

    public function render()
    {
        $messages = ContactMessage::when($this->filterStatus, fn($q) => $q->where('status', $this->filterStatus))
            ->latest()->paginate(20);
        $viewing = $this->viewingId ? ContactMessage::find($this->viewingId) : null;

        return view('livewire.admin.contact-message-manager', compact('messages', 'viewing'))
            ->layout('layouts.app');
    }
}
