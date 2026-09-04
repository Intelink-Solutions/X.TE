<?php

namespace App\Livewire\Admin;

use App\Models\User;
use App\Models\VerificationRequest;
use App\Notifications\ApprovalNotification;
use App\Services\MediaSyncService;
use Livewire\Component;
use Spatie\Permission\Models\Role;

class UserApprovalManager extends Component
{
    public string $status = 'pending';

    public string $search = '';

    public function review(int $id, string $status): void
    {
        abort_unless(in_array($status, ['approved', 'rejected'], true), 422);
        $request = VerificationRequest::with('user')->findOrFail($id);
        $wasApproved = $request->status === 'approved';
        $request->update([
            'status' => $status,
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        if ($status === 'approved' && $request->user) {
            $role = match ($request->type) {
                'artist' => 'Artist',
                'musician' => 'Musician',
                'dancer' => 'Dancer',
                'presenter' => 'Presenter',
                'podcaster' => 'Podcaster',
                default => 'Subscriber',
            };
            Role::firstOrCreate(['name' => $role, 'guard_name' => 'web']);
            $request->user->assignRole($role);
            if (in_array($request->type, ['artist', 'musician'], true)) {
                app(MediaSyncService::class)->artistFor(
                    $request->user->id,
                    $request->user->name,
                    $request->type === 'musician' ? 'Musician' : 'Artist',
                );
            }

            if (! $wasApproved) {
                [$approvalType, $title, $message] = $this->approvalCopy($request->type);
                $request->user->notify(new ApprovalNotification(
                    approvalType: $approvalType,
                    title: $title,
                    message: $message,
                    url: '/profile',
                    entityId: $request->id,
                ));
            }
        }

        session()->flash('message', "User request {$status}.");
    }

    public function toggleBlock(int $userId): void
    {
        $user = User::findOrFail($userId);
        $user->update([
            'blocked_at' => $user->blocked_at ? null : now(),
            'blocked_reason' => $user->blocked_at ? null : 'Blocked by administrator',
        ]);
    }

    public function setPostingApproval(int $userId, bool $approved): void
    {
        $user = User::findOrFail($userId);
        $request = $user->verificationRequests()
            ->where('type', 'approved_user')
            ->latest()
            ->first();

        if (! $request) {
            $request = $user->verificationRequests()->create([
                'type' => 'approved_user',
                'note' => 'Posting access managed directly by an administrator.',
            ]);
        }

        $wasApproved = $request->status === 'approved';

        $request->update([
            'status' => $approved ? 'approved' : 'rejected',
            'admin_note' => $approved
                ? 'Approved to publish directly to the public feed.'
                : 'Direct feed publishing access revoked.',
            'reviewed_by' => auth()->id(),
            'reviewed_at' => now(),
        ]);

        if ($approved && ! $wasApproved) {
            $user->notify(new ApprovalNotification(
                approvalType: 'account',
                title: 'Your account is approved to post',
                message: "You can now post content on X'Touch Media. Continue posting to gain engagement and more views. If you saved a draft, you can publish it now.",
                url: '/news-feed',
                entityId: $request->id,
            ));
        }

        session()->flash(
            'message',
            $approved ? "{$user->name} can now publish feed posts." : "{$user->name}'s posting access was revoked.",
        );
    }

    private function approvalCopy(string $type): array
    {
        return match ($type) {
            'musician' => [
                'music',
                "You are approved to post music",
                "You have been approved to post music on X'Touch Media. Share your tracks and continue posting to grow your engagement.",
            ],
            'artist' => [
                'artist',
                'Your Artist account is approved',
                "Your Artist account is approved on X'Touch Media. You can now publish content and grow your audience.",
            ],
            'dancer' => [
                'dancer',
                'Your Dancer account is approved',
                "Your Dancer account is approved on X'Touch Media. Share your performances and keep posting to gain more views.",
            ],
            'presenter' => [
                'presenter',
                'Your Presenter account is approved',
                "Your Presenter account is approved on X'Touch Media. You can now share content with the community.",
            ],
            'podcaster' => [
                'podcast',
                'Your Podcaster account is approved',
                "Your Podcaster account is approved on X'Touch Media. Publish your shows and continue growing your engagement.",
            ],
            'approved_user' => [
                'account',
                'Your account is approved to post',
                "You can now post content on X'Touch Media. Continue posting to gain engagement and more views. If you saved a draft, you can publish it now.",
            ],
            default => [
                'account',
                'Your account is approved',
                "Your account approval is complete on X'Touch Media. Your new access is now active.",
            ],
        };
    }

    public function render()
    {
        $requests = VerificationRequest::with(['user.roles', 'reviewer'])
            ->when($this->status !== 'all', fn ($q) => $q->where('status', $this->status))
            ->when($this->search, fn ($q) => $q->whereHas('user', fn ($u) => $u
                ->where('name', 'like', "%{$this->search}%")
                ->orWhere('email', 'like', "%{$this->search}%")))
            ->latest()->get();

        return view('livewire.admin.user-approval-manager', [
            'requests' => $requests,
            'users' => User::with(['roles', 'verificationRequests'])
                ->when($this->search, fn ($q) => $q
                    ->where('name', 'like', "%{$this->search}%")
                    ->orWhere('email', 'like', "%{$this->search}%"))
                ->latest()
                ->limit(100)
                ->get(),
            'pendingCount' => VerificationRequest::where('status', 'pending')->count(),
        ])->layout('layouts.app');
    }
}
