<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Jetstream\HasProfilePhoto;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens;

    /** @use HasFactory<UserFactory> */
    use HasFactory;

    use HasProfilePhoto;
    use HasRoles;
    use Notifiable;
    use TwoFactorAuthenticatable;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'handle',
        'location',
        'bio',
        'profile_views',
        'email',
        'password',
        'phone',
        'google_id',
        'blocked_at',
        'blocked_reason',
        'last_login_at',
        'last_login_ip',
    ];

    public function loginHistories()
    {
        return $this->hasMany(LoginHistory::class);
    }

    public function verificationRequests()
    {
        return $this->hasMany(VerificationRequest::class);
    }

    public function followers()
    {
        return $this->hasMany(UserFollow::class, 'followed_user_id');
    }

    public function following()
    {
        return $this->hasMany(UserFollow::class, 'follower_id');
    }

    public function followedArtists()
    {
        return $this->hasMany(ArtistFollow::class);
    }

    public function playlists()
    {
        return $this->hasMany(Playlist::class);
    }

    public function feedPosts()
    {
        return $this->hasMany(FeedPost::class);
    }

    public function feedPostBookmarks()
    {
        return $this->hasMany(FeedPostBookmark::class);
    }

    public function liveChatMessages()
    {
        return $this->hasMany(LiveChatMessage::class);
    }

    public function approvedCreatorRequest(): ?VerificationRequest
    {
        return $this->verificationRequests()->where('status', 'approved')->latest()->first();
    }

    public function isBlocked(): bool
    {
        return $this->blocked_at !== null;
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_recovery_codes',
        'two_factor_secret',
    ];

    /**
     * The accessors to append to the model's array form.
     *
     * @var array<int, string>
     */
    protected $appends = [
        'profile_photo_url',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'blocked_at' => 'datetime',
            'last_login_at' => 'datetime',
            'profile_views' => 'integer',
            'password' => 'hashed',
        ];
    }
}
