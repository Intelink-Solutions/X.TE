<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('podcast_episodes', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            $table->string('slug')->unique();
            $table->unsignedSmallInteger('episode_number')->nullable();
            $table->string('guest')->nullable();
            $table->text('description')->nullable();
            $table->string('audio_url')->nullable();
            $table->string('video_url')->nullable();
            $table->string('duration')->nullable(); // e.g. "58 min"
            $table->string('cover_url')->nullable();
            $table->date('published_at')->nullable();
            $table->boolean('is_featured')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('podcast_episodes');
    }
};
