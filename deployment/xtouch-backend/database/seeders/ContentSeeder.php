<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Str;
use App\Models\Artist;
use App\Models\Dancer;
use App\Models\Track;
use App\Models\Event;
use App\Models\FeedPost;
use App\Models\TvSchedule;
use App\Models\BlogPost;
use App\Models\PodcastEpisode;
use App\Models\Career;

class ContentSeeder extends Seeder
{
    public function run(): void
    {
        // ── Artists ────────────────────────────────────────────────────
        $artistData = [
            ['name' => "Nyla K",               'role' => 'Afro-soul vocalist',     'monthly_listeners' => '1.9M'],
            ['name' => "Sam Dee",               'role' => 'Producer / DJ',          'monthly_listeners' => '1.1M'],
            ['name' => "The Copper Collective", 'role' => 'Live band',              'monthly_listeners' => '870K'],
            ['name' => "Zola B",                'role' => 'Kalindula revivalist',   'monthly_listeners' => '640K'],
            ['name' => "Mwila",                 'role' => 'Singer-songwriter',      'monthly_listeners' => '430K'],
        ];

        foreach ($artistData as $a) {
            Artist::firstOrCreate(
                ['slug' => Str::slug($a['name'])],
                array_merge($a, ['is_featured' => true, 'is_active' => true])
            );
        }

        // ── Tracks ─────────────────────────────────────────────────────
        $nylaK   = Artist::where('slug', 'nyla-k')->first();
        $samDee  = Artist::where('slug', 'sam-dee')->first();
        $copper  = Artist::where('slug', 'the-copper-collective')->first();
        $zolaB   = Artist::where('slug', 'zola-b')->first();
        $mwila   = Artist::where('slug', 'mwila')->first();

        $tracks = [
            ['artist' => $nylaK,  'title' => 'Golden Hour',         'album' => 'Gold Standard', 'duration' => '3:42', 'plays' => '1.2M'],
            ['artist' => $samDee, 'title' => 'Copper Skyline',      'album' => 'Nightdrive',    'duration' => '4:05', 'plays' => '884K'],
            ['artist' => $copper, 'title' => 'Kalahari',            'album' => 'Dust & Gold',   'duration' => '3:18', 'plays' => '742K'],
            ['artist' => $zolaB,  'title' => 'Midnight Kalindula',  'album' => 'Heritage',      'duration' => '5:01', 'plays' => '610K'],
            ['artist' => $nylaK,  'title' => 'Lights On Me',        'album' => 'Gold Standard', 'duration' => '3:29', 'plays' => '588K'],
            ['artist' => $mwila,  'title' => 'Rooftop Sermon',      'album' => 'Single',        'duration' => '4:20', 'plays' => '431K'],
        ];

        foreach ($tracks as $t) {
            if ($t['artist']) {
                Track::firstOrCreate(
                    ['artist_id' => $t['artist']->id, 'title' => $t['title']],
                    ['album' => $t['album'], 'duration' => $t['duration'], 'plays' => $t['plays'],
                     'is_featured' => true, 'is_active' => true]
                );
            }
        }

        // ── Dancers ────────────────────────────────────────────────────
        $dancers = [
            ['name' => 'Amara Phiri',    'role' => 'Lead Dancer',     'speciality' => 'Contemporary & Afrobeat'],
            ['name' => 'Kunda Mwale',    'role' => 'Choreographer',   'speciality' => 'Hip-hop & Street'],
            ['name' => 'Tisa Banda',     'role' => 'Ballet Soloist',  'speciality' => 'Classical & Modern'],
            ['name' => 'Chanda Mutale',  'role' => 'Featured Dancer', 'speciality' => 'Traditional Zambian'],
        ];

        foreach ($dancers as $d) {
            Dancer::firstOrCreate(
                ['slug' => Str::slug($d['name'])],
                array_merge($d, ['is_featured' => true, 'is_active' => true])
            );
        }

        // ── Events ─────────────────────────────────────────────────────
        $events = [
            ['name' => "X'Touch Gold Night",        'venue' => 'Heroes Arena',        'price' => 'K350', 'starts_at' => '2026-09-12 19:00:00', 'status' => 'selling_fast'],
            ['name' => "Studio Sessions Live",       'venue' => "X'Touch Studio A",    'price' => 'K180', 'starts_at' => '2026-09-27 18:00:00', 'status' => 'on_sale'],
            ['name' => "Dance Academy Showcase",     'venue' => 'National Theatre',    'price' => 'K120', 'starts_at' => '2026-10-09 17:00:00', 'status' => 'on_sale'],
            ['name' => "Gold Night Afterparty",      'venue' => 'Skyline Rooftop',     'price' => 'K250', 'starts_at' => '2026-09-12 23:00:00', 'status' => 'few_left'],
        ];

        foreach ($events as $e) {
            \App\Models\Event::firstOrCreate(
                ['slug' => Str::slug($e['name'] . '-2026')],
                array_merge($e, ['is_featured' => true, 'is_active' => true,
                    'slug' => Str::slug($e['name'] . '-2026')])
            );
        }

        // ── TV Schedule ────────────────────────────────────────────────
        $schedule = [
            ['show_name' => 'Morning Touch',        'time' => '06:00', 'tag' => 'Live',    'sort_order' => 1],
            ['show_name' => 'Studio Sessions',       'time' => '10:00', 'tag' => 'Music',   'sort_order' => 2],
            ['show_name' => 'The Newsroom',          'time' => '13:00', 'tag' => 'News',    'sort_order' => 3],
            ['show_name' => 'Dance Floor',           'time' => '16:00', 'tag' => 'Culture', 'sort_order' => 4],
            ['show_name' => 'Gold Night Countdown',  'time' => '19:00', 'tag' => 'Live',    'sort_order' => 5, 'is_live' => true],
            ['show_name' => 'Late Replay',           'time' => '22:00', 'tag' => 'Replay',  'sort_order' => 6],
        ];

        foreach ($schedule as $s) {
            TvSchedule::firstOrCreate(
                ['show_name' => $s['show_name'], 'time' => $s['time']],
                array_merge($s, ['is_active' => true])
            );
        }

        // ── Blog Posts ─────────────────────────────────────────────────
        $posts = [
            [
                'title'        => "Building an African studio system that exports",
                'category'     => 'Industry',
                'excerpt'      => "Why owning the pipeline — from writers' room to distribution — is the only way the continent keeps the value of its own stories.",
                'read_time'    => '8 min',
                'published_at' => '2026-07-28',
            ],
            [
                'title'        => "Shooting in gold: our house look, explained",
                'category'     => 'Craft',
                'excerpt'      => "The lighting recipe behind every X'Touch music video, broken down shot by shot.",
                'read_time'    => '6 min',
                'published_at' => '2026-07-21',
            ],
            [
                'title'        => "Inside our live streaming stack: OBS, RTMP and HLS",
                'category'     => 'Technology',
                'excerpt'      => "How we push multi-camera broadcasts to 40,000 concurrent viewers without a dropped frame.",
                'read_time'    => '11 min',
                'published_at' => '2026-07-14',
            ],
            [
                'title'        => "The Dance Academy is changing who gets on stage",
                'category'     => 'Culture',
                'excerpt'      => "Three seasons in, our training programme has moved 60 dancers from auditions to paid contracts.",
                'read_time'    => '5 min',
                'published_at' => '2026-07-02',
            ],
        ];

        foreach ($posts as $p) {
            BlogPost::firstOrCreate(
                ['slug' => Str::slug($p['title'])],
                array_merge($p, ['is_published' => true, 'is_featured' => true,
                    'slug' => Str::slug($p['title'])])
            );
        }

        // ── Podcast Episodes ───────────────────────────────────────────
        PodcastEpisode::firstOrCreate(
            ['slug' => 'ep42-building-an-african-studio-system'],
            [
                'title'          => "Episode 42 — Building an African studio system",
                'episode_number' => 42,
                'guest'          => 'Mwansa Bwalya',
                'description'    => "Producer Mwansa Bwalya joins us to discuss building an end-to-end studio system on the African continent. 58 min · Video & audio.",
                'duration'       => '58 min',
                'published_at'   => '2026-07-28',
                'is_featured'    => true,
                'is_active'      => true,
            ]
        );

        // ── Feed Posts ─────────────────────────────────────────────────
        $feedPosts = [
            [
                'author' => "X'Touch Entertainment", 'handle' => '@xtouch', 'verified' => true,
                'category' => 'Announcements', 'kind' => 'announcement', 'is_pinned' => true,
                'text' => "The new X'Touch TV studio opens this month — three stages, 4K multi-cam and a live audience floor. Bookings for commercials and shows are officially open.",
                'hashtags' => ['#XTouchTV', '#StudioLaunch'], 'location' => 'Lusaka, Zambia',
                'likes' => 2841, 'comments' => 214, 'shares' => 96, 'views' => '48.2K', 'image_key' => 'tv',
            ],
            [
                'author' => "X'Touch Music", 'handle' => '@xtouchmusic', 'verified' => true,
                'category' => 'Music', 'kind' => 'music',
                'text' => "OUT NOW — 'Golden Hour' by Nyla K. Recorded, mixed and mastered in Studio A. Stream it on the X'Touch player.",
                'hashtags' => ['#GoldenHour', '#NewMusic', '#Afrobeats'],
                'likes' => 5120, 'comments' => 486, 'shares' => 302, 'views' => '112K', 'image_key' => 'studio',
            ],
            [
                'author' => "X'Touch Dancers", 'handle' => '@xtouchdancers', 'verified' => true,
                'category' => 'Videos', 'kind' => 'video',
                'text' => "Behind the scenes from last night's arena set. Eight dancers, one take, zero cuts.",
                'hashtags' => ['#XTouchDancers', '#BTS'], 'location' => 'Heroes Arena',
                'likes' => 3390, 'comments' => 188, 'shares' => 141, 'views' => '76.4K', 'image_key' => 'dancers',
            ],
            [
                'author' => "X'Touch Newsroom", 'handle' => '@xtouchnews', 'verified' => true,
                'category' => 'Events', 'kind' => 'poll',
                'text' => "Which headline act should close the X'Touch Gold Night finale?",
                'hashtags' => ['#GoldNight', '#YouDecide'],
                'likes' => 921, 'comments' => 730, 'shares' => 44, 'views' => '29.8K',
                'poll_options' => [
                    ['option' => 'Nyla K', 'percent' => 46],
                    ['option' => 'Sam Dee', 'percent' => 31],
                    ['option' => 'The Copper Collective', 'percent' => 23],
                ],
            ],
        ];

        foreach ($feedPosts as $fp) {
            FeedPost::firstOrCreate(
                ['handle' => $fp['handle'], 'text' => substr($fp['text'], 0, 50)],
                array_merge($fp, ['is_active' => true])
            );
        }

        // ── Careers ────────────────────────────────────────────────────
        $careers = [
            ['title' => 'Video Editor',        'department' => 'Production',  'type' => 'Full-time',  'description' => 'Edit and colour-grade broadcast-quality video for XTouch TV and social channels.'],
            ['title' => 'Sound Engineer',       'department' => 'Studio',      'type' => 'Full-time',  'description' => 'Operate and maintain our Studio A, B and C recording suites for sessions and live broadcasts.'],
            ['title' => 'Dance Instructor',     'department' => 'Academy',     'type' => 'Part-time',  'description' => 'Teach contemporary and Afrobeat techniques at the XTouch Dance Academy.'],
            ['title' => 'Marketing Executive',  'department' => 'Marketing',   'type' => 'Full-time',  'description' => 'Drive growth across social, email and partnerships for the XTouch brand.'],
            ['title' => 'IT Support Technician','department' => 'Technology',  'type' => 'Contract',   'description' => 'Keep our broadcast infrastructure, networking and workstations running at peak performance.'],
        ];

        foreach ($careers as $c) {
            Career::firstOrCreate(
                ['title' => $c['title'], 'department' => $c['department']],
                array_merge($c, ['is_active' => false, 'location' => 'Accra, Ghana'])
            );
        }

        $this->command->info('Content seeded successfully!');
    }
}
