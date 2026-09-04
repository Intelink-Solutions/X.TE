<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type');
            $table->morphs('notifiable');
            $table->text('data');
            $table->timestamp('read_at')->nullable();
            $table->timestamps();
        });

        Schema::create('content_views', function (Blueprint $table) {
            $table->id();
            $table->string('viewable_type', 40);
            $table->unsignedBigInteger('viewable_id');
            $table->string('viewer_key', 64);
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
            $table->unique(['viewable_type', 'viewable_id', 'viewer_key'], 'content_views_unique_viewer');
            $table->index(['viewable_type', 'viewable_id']);
        });

        Schema::table('feed_posts', function (Blueprint $table) {
            $table->timestamp('notified_at')->nullable()->after('approval_status')->index();
        });

        Schema::table('users', function (Blueprint $table) {
            $table->unsignedBigInteger('profile_views')->default(0)->after('bio');
        });
    }

    public function down(): void
    {
        Schema::table('users', fn (Blueprint $table) => $table->dropColumn('profile_views'));
        Schema::table('feed_posts', fn (Blueprint $table) => $table->dropColumn('notified_at'));
        Schema::dropIfExists('content_views');
        Schema::dropIfExists('notifications');
    }
};
