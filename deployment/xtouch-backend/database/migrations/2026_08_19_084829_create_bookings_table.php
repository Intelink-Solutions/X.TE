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
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->string('service_type'); // Studio, Production, Artist, Dance, Event, Equipment Rental
            $table->string('client_name');
            $table->string('client_email');
            $table->string('client_phone')->nullable();
            $table->date('preferred_date')->nullable();
            $table->text('project_details');
            $table->string('status')->default('pending'); // pending, confirmed, rejected, completed
            $table->text('admin_notes')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
