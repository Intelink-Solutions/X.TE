<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('artists', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->unique('user_id');
        });

        Schema::table('tracks', function (Blueprint $table) {
            $table->foreignId('feed_post_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->unique('feed_post_id');
            $table->unsignedBigInteger('downloads')->default(0)->after('plays');
        });

        Schema::table('events', function (Blueprint $table) {
            $table->foreignId('feed_post_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->unique('feed_post_id');
            $table->string('ticket_url', 500)->nullable()->after('price');
        });

        Schema::table('tv_schedules', function (Blueprint $table) {
            $table->foreignId('feed_post_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->string('stream_url', 1000)->nullable()->after('channel');
            $table->string('stream_provider', 30)->nullable()->after('stream_url');
            $table->text('description')->nullable()->after('stream_provider');
            $table->dateTime('starts_at')->nullable()->after('day_of_week');
            $table->dateTime('ends_at')->nullable()->after('starts_at');
        });

        Schema::table('podcast_episodes', function (Blueprint $table) {
            $table->foreignId('submitted_by')->nullable()->after('id')->constrained('users')->nullOnDelete();
            $table->foreignId('feed_post_id')->nullable()->after('submitted_by')->constrained()->nullOnDelete();
            $table->unique('feed_post_id');
            $table->string('approval_status', 20)->default('approved')->after('is_active')->index();
            $table->foreignId('approved_by')->nullable()->after('approval_status')->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->text('rejection_reason')->nullable()->after('approved_at');
        });

        Schema::table('blog_posts', function (Blueprint $table) {
            $table->json('tags')->nullable()->after('category');
        });

        Schema::create('playlists', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('name', 120);
            $table->timestamps();
            $table->unique(['user_id', 'name']);
        });

        Schema::create('playlist_tracks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('playlist_id')->constrained()->cascadeOnDelete();
            $table->foreignId('track_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['playlist_id', 'track_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('playlist_tracks');
        Schema::dropIfExists('playlists');
        Schema::table('blog_posts', fn (Blueprint $table) => $table->dropColumn('tags'));
        Schema::table('podcast_episodes', function (Blueprint $table) {
            $table->dropConstrainedForeignId('submitted_by');
            $table->dropConstrainedForeignId('feed_post_id');
            $table->dropConstrainedForeignId('approved_by');
            $table->dropColumn(['approval_status', 'approved_at', 'rejection_reason']);
        });
        Schema::table('tv_schedules', function (Blueprint $table) {
            $table->dropConstrainedForeignId('feed_post_id');
            $table->dropColumn(['stream_url', 'stream_provider', 'description', 'starts_at', 'ends_at']);
        });
        Schema::table('events', function (Blueprint $table) {
            $table->dropConstrainedForeignId('feed_post_id');
            $table->dropColumn('ticket_url');
        });
        Schema::table('tracks', function (Blueprint $table) {
            $table->dropConstrainedForeignId('feed_post_id');
            $table->dropColumn('downloads');
        });
        Schema::table('artists', fn (Blueprint $table) => $table->dropConstrainedForeignId('user_id'));
    }
};
