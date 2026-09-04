<?php

// Single source of truth for the admin sidebar navigation and the
// module-level permission matrix. Add a new business unit by adding
// an entry here — set `built` => true and a `route` once real screens
// exist for it; until then it renders as a "coming soon" placeholder
// reachable from the sidebar, wired through admin.modules.placeholder.

return [
    'groups' => [
        [
            'label' => 'Overview',
            'items' => [
                ['slug' => 'dashboard', 'label' => 'Dashboard', 'icon' => 'chart-bar', 'route' => 'dashboard', 'built' => true],
            ],
        ],
        [
            'label' => 'CMS',
            'items' => [
                ['slug' => 'news-feed', 'label' => 'News Feed', 'icon' => 'rss', 'built' => false],
                ['slug' => 'blog', 'label' => 'Blog', 'icon' => 'document-text', 'built' => false],
                ['slug' => 'pages', 'label' => 'Pages', 'icon' => 'document', 'built' => false],
                ['slug' => 'menus', 'label' => 'Menus', 'icon' => 'bars-3', 'built' => false],
                ['slug' => 'media-library', 'label' => 'Media Library', 'icon' => 'photo', 'built' => false],
                ['slug' => 'forms', 'label' => 'Forms', 'icon' => 'clipboard-document-list', 'built' => false],
                ['slug' => 'announcements', 'label' => 'Announcements', 'icon' => 'megaphone', 'built' => false],
                ['slug' => 'popup-manager', 'label' => 'Popup Manager', 'icon' => 'window', 'built' => false],
                ['slug' => 'seo-manager', 'label' => 'SEO Manager', 'icon' => 'magnifying-glass', 'built' => false],
            ],
        ],
        [
            'label' => 'People',
            'items' => [
                ['slug' => 'users', 'label' => 'Users', 'icon' => 'users', 'route' => 'admin.users.index', 'built' => true],
                ['slug' => 'roles', 'label' => 'Roles & Permissions', 'icon' => 'key', 'route' => 'admin.roles.index', 'built' => true],
                ['slug' => 'artists', 'label' => 'Artists', 'icon' => 'star', 'built' => false],
                ['slug' => 'dancers', 'label' => 'Dancers', 'icon' => 'sparkles', 'built' => false],
                ['slug' => 'sponsors', 'label' => 'Sponsors', 'icon' => 'briefcase', 'built' => false],
                ['slug' => 'support-center', 'label' => 'Support Center', 'icon' => 'lifebuoy', 'built' => false],
            ],
        ],
        [
            'label' => 'Broadcast & Media',
            'items' => [
                ['slug' => 'xtouch-tv', 'label' => 'XTouch TV', 'icon' => 'tv', 'built' => false],
                ['slug' => 'live-streaming', 'label' => 'Live Streaming', 'icon' => 'signal', 'built' => false],
                ['slug' => 'music', 'label' => 'Music', 'icon' => 'musical-note', 'built' => false],
                ['slug' => 'video', 'label' => 'Video', 'icon' => 'film', 'built' => false],
                ['slug' => 'podcast', 'label' => 'Podcast', 'icon' => 'microphone', 'built' => false],
                ['slug' => 'gallery', 'label' => 'Gallery', 'icon' => 'photo', 'built' => false],
            ],
        ],
        [
            'label' => 'Operations',
            'items' => [
                ['slug' => 'production', 'label' => 'Production', 'icon' => 'video-camera', 'built' => false],
                ['slug' => 'events', 'label' => 'Events', 'icon' => 'calendar-days', 'built' => false],
                ['slug' => 'bookings', 'label' => 'Bookings', 'icon' => 'calendar-date-range', 'built' => false],
                ['slug' => 'studio', 'label' => 'Studio', 'icon' => 'building-office-2', 'built' => false],
            ],
        ],
        [
            'label' => 'Commerce',
            'items' => [
                ['slug' => 'store', 'label' => 'Store', 'icon' => 'shopping-bag', 'built' => false],
                ['slug' => 'payments', 'label' => 'Payments', 'icon' => 'credit-card', 'built' => false],
                ['slug' => 'advertisements', 'label' => 'Advertisements', 'icon' => 'megaphone', 'built' => false],
                ['slug' => 'newsletter', 'label' => 'Newsletter', 'icon' => 'envelope', 'built' => false],
                ['slug' => 'notifications', 'label' => 'Notifications', 'icon' => 'bell', 'built' => false],
            ],
        ],
        [
            'label' => 'Insights',
            'items' => [
                ['slug' => 'reports', 'label' => 'Reports', 'icon' => 'document-chart-bar', 'built' => false],
                ['slug' => 'analytics', 'label' => 'Analytics', 'icon' => 'presentation-chart-line', 'built' => false],
            ],
        ],
        [
            'label' => 'System',
            'items' => [
                ['slug' => 'settings', 'label' => 'Settings', 'icon' => 'cog-6-tooth', 'built' => false],
                ['slug' => 'system', 'label' => 'System Health', 'icon' => 'server', 'built' => false],
            ],
        ],
    ],
];
