<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('feed_posts', function (Blueprint $table) {
            $table->json('tags')->nullable()->after('hashtags');
            $table->unsignedInteger('reposts')->default(0)->after('shares');
        });

        Schema::create('feed_post_bookmarks', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feed_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['feed_post_id', 'user_id']);
        });

        Schema::create('feed_post_reposts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feed_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['feed_post_id', 'user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feed_post_reposts');
        Schema::dropIfExists('feed_post_bookmarks');

        Schema::table('feed_posts', function (Blueprint $table) {
            $table->dropColumn(['tags', 'reposts']);
        });
    }
};
