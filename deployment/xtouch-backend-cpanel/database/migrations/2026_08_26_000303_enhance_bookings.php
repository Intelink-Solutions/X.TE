<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->time('preferred_time')->nullable()->after('preferred_date');
            $table->string('location', 255)->nullable()->after('preferred_time');
            $table->string('duration', 80)->nullable()->after('location');
            $table->string('budget', 100)->nullable()->after('duration');
            $table->unsignedInteger('attendees')->nullable()->after('budget');
            $table->string('contact_method', 20)->default('email')->after('attendees');
            $table->index(['status', 'preferred_date']);
            $table->index('service_type');
        });
    }

    public function down(): void
    {
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex(['status', 'preferred_date']);
            $table->dropIndex(['service_type']);
            $table->dropColumn([
                'preferred_time',
                'location',
                'duration',
                'budget',
                'attendees',
                'contact_method',
            ]);
        });
    }
};
