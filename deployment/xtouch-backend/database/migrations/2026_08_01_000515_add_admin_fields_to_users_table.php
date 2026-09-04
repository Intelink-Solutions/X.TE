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
        Schema::table('users', function (Blueprint $table) {
            $table->string('phone')->nullable()->after('email');
            $table->string('google_id')->nullable()->after('phone');
            $table->timestamp('blocked_at')->nullable()->after('google_id');
            $table->string('blocked_reason')->nullable()->after('blocked_at');
            $table->timestamp('last_login_at')->nullable()->after('blocked_reason');
            $table->string('last_login_ip')->nullable()->after('last_login_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'phone',
                'google_id',
                'blocked_at',
                'blocked_reason',
                'last_login_at',
                'last_login_ip',
            ]);
        });
    }
};
