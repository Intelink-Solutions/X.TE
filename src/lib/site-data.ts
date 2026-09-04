export const NAV_LINKS = [
  { to: "/news-feed", label: "Feed" },
  { to: "/about", label: "About" },
  { to: "/tv", label: "XTouch TV" },
  { to: "/production", label: "Production" },
  { to: "/music", label: "Music" },
  { to: "/artists", label: "Artists" },
  { to: "/dancers", label: "Dancers" },
  { to: "/events", label: "Events" },
  { to: "/live", label: "Live" },
  { to: "/podcast", label: "Podcast" },
  { to: "/gallery", label: "Gallery" },
  { to: "/blog", label: "Blog" },
  { to: "/store", label: "Store" },
  { to: "/bookings", label: "Bookings" },
  { to: "/careers", label: "Careers" },
  { to: "/contact", label: "Contact" },
  { to: "/profile", label: "Profile" },
] as const;

export const PRIMARY_NAV = NAV_LINKS.slice(0, 8);

export type FeedPost = {
  id: string;
  userId?: number;
  trackId?: number;
  authorType?: string;
  author: string;
  handle: string;
  verified: boolean;
  time: string;
  category: string;
  kind:
    | "photo"
    | "video"
    | "music"
    | "event"
    | "ticket"
    | "news"
    | "update"
    | "poll"
    | "podcast"
    | "announcement"
    | "tv"
    | "production";
  pinned?: boolean;
  text: string;
  hashtags: string[];
  tags?: string[];
  location?: string;
  likes: number;
  comments: number;
  shares: number;
  reposts?: number;
  views: string;
  image?: string;
  imageUrl?: string;
  mediaUrl?: string;
  title?: string;
  eventDate?: string;
  venue?: string;
  ticketPrice?: string;
  ticketUrl?: string;
  poll?: { option: string; percent: number; votes?: number }[];
};

export const FEED_POSTS: FeedPost[] = [
  {
    id: "1",
    author: "X'Touch Entertainment",
    handle: "@xtouch",
    verified: true,
    time: "12m",
    category: "Announcements",
    kind: "announcement",
    pinned: true,
    text: "The new X'Touch TV studio opens this month — three stages, 4K multi-cam and a live audience floor. Bookings for commercials and shows are officially open.",
    hashtags: ["#XTouchTV", "#StudioLaunch"],
    location: "Accra, Ghana.",
    likes: 2841,
    comments: 214,
    shares: 96,
    views: "48.2K",
    image: "tv",
  },
  {
    id: "2",
    author: "X'Touch Music",
    handle: "@xtouchmusic",
    verified: true,
    time: "1h",
    category: "Music",
    kind: "music",
    text: "OUT NOW — 'Golden Hour' by Nyla K. Recorded, mixed and mastered in Studio A. Stream it on the X'Touch player.",
    hashtags: ["#GoldenHour", "#NewMusic", "#Afrobeats"],
    likes: 5120,
    comments: 486,
    shares: 302,
    views: "112K",
    image: "studio",
  },
  {
    id: "3",
    author: "X'Touch Dancers",
    handle: "@xtouchdancers",
    verified: true,
    time: "3h",
    category: "Videos",
    kind: "video",
    text: "Behind the scenes from last night's arena set. Eight dancers, one take, zero cuts.",
    hashtags: ["#XTouchDancers", "#BTS"],
    location: "Heroes Arena",
    likes: 3390,
    comments: 188,
    shares: 141,
    views: "76.4K",
    image: "dancers",
  },
  {
    id: "4",
    author: "X'Touch Newsroom",
    handle: "@xtouchnews",
    verified: true,
    time: "5h",
    category: "Events",
    kind: "poll",
    text: "Which headline act should close the X'Touch Gold Night finale?",
    hashtags: ["#GoldNight", "#YouDecide"],
    likes: 921,
    comments: 730,
    shares: 44,
    views: "29.8K",
    poll: [
      { option: "Nyla K", percent: 46 },
      { option: "Sam Dee", percent: 31 },
      { option: "The Copper Collective", percent: 23 },
    ],
  },
  {
    id: "5",
    author: "X'Touch Production",
    handle: "@xtouchproduction",
    verified: true,
    time: "9h",
    category: "Production",
    kind: "photo",
    text: "Drone plates for the new tourism film. Sunrise, 4.6km of coastline, one very cold crew.",
    hashtags: ["#DroneServices", "#FilmProduction"],
    likes: 1470,
    comments: 92,
    shares: 58,
    views: "33.1K",
    image: "hero",
  },
  {
    id: "6",
    author: "The X'Touch Podcast",
    handle: "@xtouchpodcast",
    verified: true,
    time: "1d",
    category: "TV",
    kind: "podcast",
    text: "Episode 42 — 'Building an African studio system' with producer Mwansa Bwalya. Audio and video versions are live.",
    hashtags: ["#Podcast", "#Episode42"],
    likes: 860,
    comments: 74,
    shares: 39,
    views: "18.7K",
    image: "studio",
  },
];

export const FEED_TABS = [
  "Latest",
  "Trending",
  "Popular",
  "Updates",
  "News",
  "Videos",
  "Music",
  "Events",
  "Tickets",
  "Announcements",
  "TV",
  "Production",
];

export const TRENDING_TAGS = [
  "#GoldNight",
  "#XTouchTV",
  "#GoldenHour",
  "#XTouchDancers",
  "#StudioLaunch",
  "#Afrobeats",
  "#Episode42",
];

export const TRACKS = [
  { title: "Golden Hour", artist: "Nyla K", album: "Gold Standard", length: "3:42", plays: "1.2M" },
  {
    title: "Copper Skyline",
    artist: "Sam Dee",
    album: "Nightdrive",
    length: "4:05",
    plays: "884K",
  },
  {
    title: "Kalahari",
    artist: "The Copper Collective",
    album: "Dust & Gold",
    length: "3:18",
    plays: "742K",
  },
  {
    title: "Midnight Kalindula",
    artist: "Zola B",
    album: "Heritage",
    length: "5:01",
    plays: "610K",
  },
  {
    title: "Lights On Me",
    artist: "Nyla K",
    album: "Gold Standard",
    length: "3:29",
    plays: "588K",
  },
  { title: "Rooftop Sermon", artist: "Mwila", album: "Single", length: "4:20", plays: "431K" },
];

export const ARTISTS = [
  { name: "Nyla K", role: "Afro-soul vocalist", listeners: "1.9M" },
  { name: "Sam Dee", role: "Producer / DJ", listeners: "1.1M" },
  { name: "The Copper Collective", role: "Live band", listeners: "870K" },
  { name: "Zola B", role: "Kalindula revivalist", listeners: "640K" },
];

export const EVENTS = [
  {
    name: "X'Touch Gold Night",
    date: "12 Sep",
    venue: "Heroes Arena",
    price: "K350",
    status: "Selling fast",
  },
  {
    name: "Studio Sessions Live",
    date: "27 Sep",
    venue: "X'Touch Studio A",
    price: "K180",
    status: "On sale",
  },
  {
    name: "Dance Academy Showcase",
    date: "09 Oct",
    venue: "National Theatre",
    price: "K120",
    status: "On sale",
  },
  {
    name: "Gold Night Afterparty",
    date: "12 Sep",
    venue: "Skyline Rooftop",
    price: "K250",
    status: "Few left",
  },
];

export const SCHEDULE = [
  { time: "06:00", show: "Morning Touch", tag: "Live" },
  { time: "10:00", show: "Studio Sessions", tag: "Music" },
  { time: "13:00", show: "The Newsroom", tag: "News" },
  { time: "16:00", show: "Dance Floor", tag: "Culture" },
  { time: "19:00", show: "Gold Night Countdown", tag: "Live" },
  { time: "22:00", show: "Late Replay", tag: "Replay" },
];

export const BLOG_POSTS = [
  {
    slug: "african-studio-system",
    title: "Building an African studio system that exports",
    excerpt:
      "Why owning the pipeline — from writers' room to distribution — is the only way the continent keeps the value of its own stories.",
    category: "Industry",
    read: "8 min",
    date: "28 Jul 2026",
  },
  {
    slug: "shooting-in-gold",
    title: "Shooting in gold: our house look, explained",
    excerpt: "The lighting recipe behind every X'Touch music video, broken down shot by shot.",
    category: "Craft",
    read: "6 min",
    date: "21 Jul 2026",
  },
  {
    slug: "live-streaming-stack",
    title: "Inside our live streaming stack: OBS, RTMP and HLS",
    excerpt:
      "How we push multi-camera broadcasts to 40,000 concurrent viewers without a dropped frame.",
    category: "Technology",
    read: "11 min",
    date: "14 Jul 2026",
  },
  {
    slug: "dance-academy",
    title: "The Dance Academy is changing who gets on stage",
    excerpt:
      "Three seasons in, our training programme has moved 60 dancers from auditions to paid contracts.",
    category: "Culture",
    read: "5 min",
    date: "02 Jul 2026",
  },
];
