<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tracks', function (Blueprint $table) {
            $table->foreignId('submitted_by')->nullable()->after('artist_id')->constrained('users')->nullOnDelete();
            $table->string('approval_status', 20)->default('approved')->after('is_active')->index();
            $table->foreignId('approved_by')->nullable()->after('approval_status')->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable()->after('approved_by');
            $table->text('rejection_reason')->nullable()->after('approved_at');
        });

        Schema::table('feed_posts', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            $table->string('title')->nullable()->after('kind');
            $table->string('media_url', 500)->nullable()->after('image_url');
            $table->dateTime('event_date')->nullable()->after('media_url');
            $table->string('venue')->nullable()->after('event_date');
            $table->string('ticket_price', 40)->nullable()->after('venue');
            $table->string('ticket_url', 500)->nullable()->after('ticket_price');
            $table->string('approval_status', 20)->default('approved')->after('is_active')->index();
        });

        Schema::table('ticket_listings', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->after('id')->constrained('users')->nullOnDelete();
            $table->string('moderation_status', 20)->default('approved')->after('status')->index();
            $table->foreignId('reviewed_by')->nullable()->after('moderation_status')->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            $table->text('rejection_reason')->nullable()->after('reviewed_at');
        });

        Schema::create('post_reports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feed_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('reporter_email')->nullable();
            $table->string('reason', 100);
            $table->text('details')->nullable();
            $table->string('status', 20)->default('open')->index();
            $table->foreignId('resolved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('resolved_at')->nullable();
            $table->timestamps();
        });

        Schema::create('analytics_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->uuid('session_id')->nullable()->index();
            $table->string('event_type', 80)->index();
            $table->string('path')->nullable()->index();
            $table->string('entity_type')->nullable();
            $table->unsignedBigInteger('entity_id')->nullable();
            $table->json('metadata')->nullable();
            $table->string('ip_hash', 64)->nullable();
            $table->timestamps();
            $table->index(['entity_type', 'entity_id']);
            $table->index(['created_at', 'event_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('analytics_events');
        Schema::dropIfExists('post_reports');
        Schema::table('ticket_listings', fn (Blueprint $table) => $table->dropConstrainedForeignId('user_id'));
        Schema::table('ticket_listings', fn (Blueprint $table) => $table->dropConstrainedForeignId('reviewed_by'));
        Schema::table('ticket_listings', fn (Blueprint $table) => $table->dropColumn(['moderation_status', 'reviewed_at', 'rejection_reason']));
        Schema::table('feed_posts', fn (Blueprint $table) => $table->dropConstrainedForeignId('user_id'));
        Schema::table('feed_posts', fn (Blueprint $table) => $table->dropColumn(['title', 'media_url', 'event_date', 'venue', 'ticket_price', 'ticket_url', 'approval_status']));
        Schema::table('tracks', fn (Blueprint $table) => $table->dropConstrainedForeignId('submitted_by'));
        Schema::table('tracks', fn (Blueprint $table) => $table->dropConstrainedForeignId('approved_by'));
        Schema::table('tracks', fn (Blueprint $table) => $table->dropColumn(['approval_status', 'approved_at', 'rejection_reason']));
    }
};
