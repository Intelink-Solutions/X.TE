<?php

namespace App\Livewire\Admin;

use Livewire\Component;
use Livewire\WithPagination;
use App\Models\Booking;

class BookingManager extends Component
{
    use WithPagination;

    public string $search = '';
    public string $filterStatus = '';
    public ?int   $viewingId = null;
    public string $adminNotes = '';
    public string $newStatus  = '';

    protected $queryString = ['search', 'filterStatus'];

    public function mount(): void
    {
        abort_unless(auth()->user()?->hasAnyRole(['Super Admin', 'Administrator', 'Admin']), 403);
    }

    public function updatingSearch(): void    { $this->resetPage(); }
    public function updatingFilterStatus(): void { $this->resetPage(); }

    public function view(int $id): void
    {
        $booking = Booking::findOrFail($id);
        $this->viewingId  = $id;
        $this->adminNotes = $booking->admin_notes ?? '';
        $this->newStatus  = $booking->status;
    }

    public function updateBooking(): void
    {
        abort_unless($this->viewingId, 422);
        $this->validate([
            'newStatus'  => 'required|in:pending,confirmed,rejected,completed',
            'adminNotes' => 'nullable|string|max:2000',
        ]);
        Booking::findOrFail($this->viewingId)->update([
            'status'      => $this->newStatus,
            'admin_notes' => $this->adminNotes,
        ]);
        session()->flash('message', 'Booking updated.');
        $this->viewingId = null;
    }

    public function delete(int $id): void
    {
        Booking::findOrFail($id)->delete();
        session()->flash('message', 'Booking deleted.');
    }

    public function render()
    {
        $bookings = Booking::when($this->search, fn($q) =>
                $q->where(fn ($searchQuery) => $searchQuery
                    ->where('client_name', 'like', "%{$this->search}%")
                    ->orWhere('client_email', 'like', "%{$this->search}%")
                    ->orWhere('client_phone', 'like', "%{$this->search}%")
                    ->orWhere('service_type', 'like', "%{$this->search}%")))
            ->when($this->filterStatus, fn($q) => $q->where('status', $this->filterStatus))
            ->latest()->paginate(20);

        return view('livewire.admin.booking-manager', compact('bookings'))
            ->layout('layouts.app');
    }
}
