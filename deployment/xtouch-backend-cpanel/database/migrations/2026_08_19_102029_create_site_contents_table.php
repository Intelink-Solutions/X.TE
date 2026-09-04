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
        Schema::create('site_contents', function (Blueprint $table) {
            $table->id();
            $table->string('page')->index(); // 'home', 'about', 'production'
            $table->string('section')->index(); // e.g., 'hero', 'about-intro', 'production-desc'
            $table->string('key')->unique(); // unique identifier: 'home.hero.title', 'about.intro.text', etc.
            $table->text('value')->nullable();
            $table->string('image_url')->nullable();
            $table->string('type')->default('text'); // 'text', 'textarea', 'image', 'json'
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('site_contents');
    }
};
