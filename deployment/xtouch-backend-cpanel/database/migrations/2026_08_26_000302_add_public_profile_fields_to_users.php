<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('handle', 30)->nullable()->unique()->after('name');
            $table->string('location', 80)->nullable()->after('handle');
            $table->string('bio', 200)->nullable()->after('location');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropUnique(['handle']);
            $table->dropColumn(['handle', 'location', 'bio']);
        });
    }
};
