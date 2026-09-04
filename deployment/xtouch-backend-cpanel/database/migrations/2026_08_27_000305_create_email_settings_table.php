<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('email_settings', function (Blueprint $table) {
            $table->id();
            $table->string('host')->default('mail.xtouchentertainments.com');
            $table->unsignedSmallInteger('port')->default(587);
            $table->string('encryption', 10)->default('tls');
            $table->string('username')->nullable();
            $table->text('password')->nullable();
            $table->string('from_address')->default('info@xtouchentertainments.com');
            $table->string('from_name')->default("X'Touch Entertainment");
            $table->string('submissions_to')->default('xtouchentertainments@gmail.com');
            $table->boolean('is_enabled')->default(false);
            $table->timestamp('last_tested_at')->nullable();
            $table->string('last_test_status', 20)->nullable();
            $table->text('last_test_error')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('email_settings');
    }
};
