<?php

namespace Database\Seeders;

use App\Models\SiteContent;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class SiteContentSeeder extends Seeder
{
    public function run(): void
    {
        $contents = [
            // Home Page
            ['page' => 'home', 'section' => 'hero', 'key' => 'home.hero.title', 'value' => 'The future of African entertainment', 'type' => 'text'],
            ['page' => 'home', 'section' => 'hero', 'key' => 'home.hero.subtitle', 'value' => 'Television, music, film production, dancers, live streaming and a social newsroom — the official digital headquarters of X\'Touch Entertainment.', 'type' => 'textarea'],
            ['page' => 'home', 'section' => 'stats', 'key' => 'home.stats.streams', 'value' => '48M+', 'type' => 'text'],
            ['page' => 'home', 'section' => 'stats', 'key' => 'home.stats.productions', 'value' => '320+', 'type' => 'text'],
            ['page' => 'home', 'section' => 'stats', 'key' => 'home.stats.followers', 'value' => '1.4M', 'type' => 'text'],
            
            // About Page
            ['page' => 'about', 'section' => 'intro', 'key' => 'about.intro.title', 'value' => 'About X\'Touch Entertainment', 'type' => 'text'],
            ['page' => 'about', 'section' => 'intro', 'key' => 'about.intro.text', 'value' => 'X\'Touch Entertainment is the premier platform for African entertainment, featuring live television, music streaming, film production, and a vibrant community of dancers and artists.', 'type' => 'textarea'],
            ['page' => 'about', 'section' => 'mission', 'key' => 'about.mission.title', 'value' => 'Our Mission', 'type' => 'text'],
            ['page' => 'about', 'section' => 'mission', 'key' => 'about.mission.text', 'value' => 'To amplify African voices, celebrate local talent, and create a global platform for entertainment that inspires and connects people worldwide.', 'type' => 'textarea'],
            
            // Production Page
            ['page' => 'production', 'section' => 'intro', 'key' => 'production.intro.title', 'value' => 'Our Productions', 'type' => 'text'],
            ['page' => 'production', 'section' => 'intro', 'key' => 'production.intro.text', 'value' => 'From blockbuster films to intimate documentaries, X\'Touch Productions creates world-class content that tells African stories.', 'type' => 'textarea'],
            ['page' => 'production', 'section' => 'services', 'key' => 'production.services.title', 'value' => 'Production Services', 'type' => 'text'],
            ['page' => 'production', 'section' => 'services', 'key' => 'production.services.text', 'value' => 'Full-service production including pre-production, filming, post-production, and distribution across all media platforms.', 'type' => 'textarea'],
        ];
        
        foreach ($contents as $content) {
            SiteContent::firstOrCreate(['key' => $content['key']], $content);
        }
    }
}
