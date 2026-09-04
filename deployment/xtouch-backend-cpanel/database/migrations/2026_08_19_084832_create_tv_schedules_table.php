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
        Schema::create('tv_schedules', function (Blueprint $table) {
            $table->id();
            $table->string('show_name');
            $table->string('time'); // e.g. "06:00"
            $table->string('tag');  // Live, Music, News, Culture, Replay
            $table->string('channel')->default('Channel 1');
            $table->string('day_of_week')->nullable(); // Mon,Tue,... or "daily"
            $table->boolean('is_live')->default(false);
            $table->boolean('is_active')->default(true);
            $table->integer('sort_order')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('tv_schedules');
    }
};
