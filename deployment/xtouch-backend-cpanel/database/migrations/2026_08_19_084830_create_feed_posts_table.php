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
        Schema::create('feed_posts', function (Blueprint $table) {
            $table->id();
            $table->string('author');
            $table->string('handle');
            $table->boolean('verified')->default(false);
            $table->string('category');
            $table->string('kind'); // photo, video, music, event, poll, podcast, announcement
            $table->text('text');
            $table->json('hashtags')->nullable();
            $table->string('location')->nullable();
            $table->string('image_key')->nullable(); // tv, studio, dancers, hero, etc.
            $table->string('image_url')->nullable();
            $table->json('poll_options')->nullable(); // [{"option":"X","percent":46}]
            $table->unsignedInteger('likes')->default(0);
            $table->unsignedInteger('comments')->default(0);
            $table->unsignedInteger('shares')->default(0);
            $table->string('views')->default('0');
            $table->boolean('is_pinned')->default(false);
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('feed_posts');
    }
};
