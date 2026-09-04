<?php

namespace App\Livewire\Admin;

use App\Models\PostReport;
use Livewire\Component;

class ReportManager extends Component
{
    public string $status = 'open';

    public function resolve(int $id, string $status): void
    {
        abort_unless(in_array($status, ['resolved', 'dismissed'], true), 422);
        PostReport::findOrFail($id)->update([
            'status' => $status,
            'resolved_by' => auth()->id(),
            'resolved_at' => now(),
        ]);
        session()->flash('message', "Report {$status}.");
    }

    public function removePost(int $id): void
    {
        $report = PostReport::with('post')->findOrFail($id);
        $report->post?->update(['is_active' => false, 'approval_status' => 'rejected']);
        $this->resolve($id, 'resolved');
    }

    public function render()
    {
        return view('livewire.admin.report-manager', [
            'reports' => PostReport::with(['post', 'reporter'])
                ->when($this->status !== 'all', fn ($q) => $q->where('status', $this->status))
                ->latest()->get(),
            'openCount' => PostReport::where('status', 'open')->count(),
        ])->layout('layouts.app');
    }
}
