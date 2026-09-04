<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('track_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('track_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['track_id', 'user_id']);
        });

        Schema::create('feed_post_likes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feed_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['feed_post_id', 'user_id']);
        });

        Schema::create('feed_post_comments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feed_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->text('body');
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('feed_post_comments');
        Schema::dropIfExists('feed_post_likes');
        Schema::dropIfExists('track_likes');
    }
};
