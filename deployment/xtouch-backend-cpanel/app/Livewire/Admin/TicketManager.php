<?php

namespace App\Livewire\Admin;

use App\Models\TicketListing;
use App\Models\TicketOrder;
use Livewire\Component;

class TicketManager extends Component
{
    public string $tab = 'orders';

    public function updateOrder(int $id, string $status): void
    {
        abort_unless(in_array($status, ['pending', 'confirmed', 'cancelled'], true), 422);
        TicketOrder::findOrFail($id)->update(['status' => $status]);
        session()->flash('message', 'Ticket order updated.');
    }

    public function reviewListing(int $id, string $status): void
    {
        abort_unless(in_array($status, ['approved', 'rejected'], true), 422);
        TicketListing::findOrFail($id)->update([
            'moderation_status' => $status,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);
        session()->flash('message', "Ticket listing {$status}.");
    }

    public function updateListingStatus(int $id, string $status): void
    {
        abort_unless(in_array($status, ['available', 'sold', 'removed'], true), 422);
        TicketListing::findOrFail($id)->update(['status' => $status]);
    }

    public function render()
    {
        return view('livewire.admin.ticket-manager', [
            'orders' => TicketOrder::with('event')->latest()->limit(100)->get(),
            'listings' => TicketListing::with('event')->latest()->limit(100)->get(),
            'pendingOrders' => TicketOrder::where('status', 'pending')->count(),
            'pendingListings' => TicketListing::where('moderation_status', 'pending')->count(),
        ])->layout('layouts.app');
    }
}
