<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('feed_poll_votes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('feed_post_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('option_index');
            $table->timestamps();
            $table->unique(['feed_post_id', 'user_id']);
        });

        Schema::create('user_follows', function (Blueprint $table) {
            $table->id();
            $table->foreignId('follower_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('followed_user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();
            $table->unique(['follower_id', 'followed_user_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_follows');
        Schema::dropIfExists('feed_poll_votes');
    }
};
