import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { Play, Radio, Ticket, Mic, Heart, MessageCircle, Eye, Loader } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import tvImg from "@/assets/tv.jpg";
import dancersImg from "@/assets/dancers.jpg";
import studioImg from "@/assets/studio.jpg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section, SectionHeading, GlassCard } from "@/components/site/Primitives";
import { AdPostCard } from "@/components/site/AdPostCard";
import {
  useArtists,
  useTracks,
  useEvents,
  useFeedPosts,
  useTvSchedules,
  useBlogPosts,
} from "@/lib/api/hooks";

export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/news-feed" });
  },
  head: () => ({
    meta: [
      { title: "X'Touch Entertainment — The Home of African Entertainment" },
      {
        name: "description",
        content:
          "Watch XTouch TV live, stream music, explore productions, book studios and follow the X'Touch news feed — all in one premium platform.",
      },
      { property: "og:title", content: "X'Touch Entertainment" },
      {
        property: "og:description",
        content: "Live TV, music, production, dancers, events and a social news feed.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const { data: artistsData, isLoading: artistsLoading } = useArtists();
  const { data: tracksData, isLoading: tracksLoading } = useTracks();
  const { data: eventsData, isLoading: eventsLoading } = useEvents();
  const { data: postsData, isLoading: postsLoading } = useFeedPosts();
  const { data: scheduleData, isLoading: scheduleLoading } = useTvSchedules();
  const { data: blogData, isLoading: blogLoading } = useBlogPosts();

  // Pure API data transformers (no static fallbacks)
  const artists = (artistsData ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    role: a.role ?? "Artist",
    listeners: a.monthly_listeners ?? "0",
    slug: a.slug,
    image_url: a.image_url,
  }));

  const tracks = (tracksData ?? []).map((t) => ({
    id: t.id,
    title: t.title,
    album: t.album,
    artist: t.artist?.name ?? "",
    length: t.duration ?? "",
    cover_url: t.cover_url,
  }));

  const events = (eventsData ?? []).map((e) => ({
    id: e.id,
    name: e.name,
    venue: e.venue,
    date: new Date(e.starts_at).toLocaleDateString("en-ZM", { day: "numeric", month: "short" }),
    price: e.price,
    status: e.status,
  }));

  const posts = (postsData?.data ?? []).map((p) => ({
    id: p.id,
    author: p.author,
    handle: p.handle,
    time: p.created_at ? new Date(p.created_at).toLocaleDateString() : "Recently",
    text: p.text,
    likes: p.likes ?? 0,
    comments: p.comments ?? 0,
    views: p.views ?? 0,
    image_url: p.image_url,
  }));

  const schedule = (scheduleData ?? []).map((s) => ({
    id: s.id,
    show: s.show_name,
    time: s.time,
    tag: s.is_live ? "Live" : "Replay",
  }));

  const blogPosts = (blogData?.data ?? []).map((b) => ({
    slug: b.slug ?? String(b.id),
    title: b.title,
    excerpt: b.excerpt ?? "",
    category: b.category ?? "General",
    read: b.read_time ?? "3 min read",
  }));

  return (
    <>
      {/* Cinematic hero */}
      <section className="relative isolate flex min-h-[88vh] items-end overflow-hidden">
        <img
          src={heroImg}
          alt="X'Touch live arena show with golden stage lights"
          width={1920}
          height={1088}
          className="absolute inset-0 -z-10 h-full w-full object-cover"
        />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-background via-background/70 to-background/30" />
        <div className="mx-auto w-full max-w-7xl px-3 pb-12 pt-24 min-[380px]:px-4 sm:pb-16 sm:pt-32 lg:px-8">
          <Badge className="rounded-full border-gold/40 bg-gold/10 text-gold hover:bg-gold/10">
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-gold" />
            Live now · Gold Night Countdown
          </Badge>
          <h1 className="mt-5 max-w-4xl break-words text-4xl font-black leading-[0.98] min-[380px]:text-5xl sm:mt-6 sm:text-6xl md:text-8xl">
            The future of <span className="text-gradient-gold">African entertainment</span>
          </h1>
          <p className="mt-6 max-w-2xl text-base text-muted-foreground sm:text-lg">
            Television, music, film production, dancers, live streaming and a social newsroom — the
            official digital headquarters of X&apos;Touch Entertainment.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="w-full rounded-full bg-gradient-gold px-5 font-semibold text-primary-foreground shadow-gold hover:opacity-90 min-[420px]:w-auto sm:px-7"
            >
              <Link to="/live">
                <Radio className="mr-2 h-4 w-4" /> Watch Live
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full rounded-full border-border px-5 backdrop-blur min-[420px]:w-auto sm:px-7"
            >
              <Link to="/production">Explore Productions</Link>
            </Button>
          </div>
          <dl className="mt-14 grid max-w-3xl grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              ["48M+", "Streams"],
              ["320+", "Productions"],
              ["1.4M", "Followers"],
              ["24/7", "Live TV"],
            ].map(([v, k]) => (
              <div key={k}>
                <dt className="text-2xl font-black text-gradient-gold sm:text-3xl">{v}</dt>
                <dd className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{k}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Live TV preview + schedule */}
      <Section>
        <SectionHeading
          eyebrow="XTouch TV"
          title="Live now on channel one"
          action="Full schedule"
          actionTo="/tv"
        />
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div className="glass card-hover group relative overflow-hidden rounded-3xl">
            <img
              src={tvImg}
              alt="X'Touch TV studio"
              loading="lazy"
              width={1024}
              height={768}
              className="h-full max-h-[420px] w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6">
              <Badge className="rounded-full bg-destructive/90 text-destructive-foreground">
                LIVE
              </Badge>
              <h3 className="mt-3 text-2xl font-black">Gold Night Countdown</h3>
              <p className="text-sm text-muted-foreground">
                Multi-camera broadcast · 12.4K watching
              </p>
            </div>
            <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-gold text-primary-foreground shadow-gold transition-transform duration-300 group-hover:scale-110">
              <Play className="h-6 w-6 fill-current" />
            </span>
          </div>
          <GlassCard className="p-0">
            <div className="border-b border-border px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Today&apos;s schedule
            </div>
            {scheduleLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader className="h-5 w-5 animate-spin text-gold" />
              </div>
            ) : schedule.length === 0 ? (
              <div className="px-6 py-8 text-center text-sm text-muted-foreground">
                No schedule available
              </div>
            ) : (
              <ul className="divide-y divide-border">
                {schedule.map((s) => (
                  <li
                    key={s.id}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-6 py-3.5"
                  >
                    <span className="text-sm font-bold text-gold">{s.time}</span>
                    <span className="truncate text-sm">{s.show}</span>
                    <span className="shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground">
                      {s.tag}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </GlassCard>
        </div>
      </Section>

      {/* Featured music */}
      <Section>
        <SectionHeading
          eyebrow="Music"
          title="Featured releases"
          action="Open player"
          actionTo="/music"
        />
        {tracksLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : tracks.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">No tracks available yet</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {tracks.slice(0, 6).map((t) => (
              <GlassCard
                key={t.id}
                className="group grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4"
              >
                {t.cover_url ? (
                  <img
                    src={t.cover_url}
                    alt={t.title}
                    className="h-14 w-14 rounded-2xl object-cover"
                  />
                ) : (
                  <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-gradient-gold text-primary-foreground">
                    <Play className="h-5 w-5 fill-current" />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block truncate font-bold">{t.title}</span>
                  <span className="block truncate text-sm text-muted-foreground">
                    {t.artist} · {t.album}
                  </span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{t.length}</span>
              </GlassCard>
            ))}
          </div>
        )}
      </Section>

      {/* Trending posts */}
      <Section>
        <SectionHeading
          eyebrow="News Feed"
          title="Trending right now"
          action="Open feed"
          actionTo="/news-feed"
        />
        {postsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">No posts yet</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-3">
            {posts.slice(0, 3).map((p) => (
              <GlassCard key={p.id}>
                {p.image_url && (
                  <img
                    src={p.image_url}
                    alt={p.author}
                    className="mb-4 h-32 w-full rounded-lg object-cover"
                  />
                )}
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-gold text-sm font-black text-primary-foreground">
                    {p.author.charAt(0)}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold">{p.author}</span>
                    <span className="block text-xs text-muted-foreground">
                      @{p.handle} · {p.time}
                    </span>
                  </span>
                </div>
                <p className="mt-4 line-clamp-4 text-sm text-muted-foreground">{p.text}</p>
                <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Heart className="h-3.5 w-3.5" />
                    {p.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-3.5 w-3.5" />
                    {p.comments}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3.5 w-3.5" />
                    {p.views}
                  </span>
                </div>
              </GlassCard>
            ))}
            <AdPostCard />
          </div>
        )}
      </Section>

      {/* Artists & dancers */}
      <Section>
        <SectionHeading
          eyebrow="Talent"
          title="Featured artists & dancers"
          action="Meet the roster"
          actionTo="/artists"
        />
        {artistsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : artists.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">No artists yet</div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {artists.map((a) => (
              <GlassCard key={a.id} className="p-0 overflow-hidden">
                {a.image_url ? (
                  <img
                    src={a.image_url}
                    alt={a.name}
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="h-44 w-full object-cover"
                  />
                ) : (
                  <div className="h-44 w-full bg-gradient-to-br from-gold/20 to-gold/5" />
                )}
                <div className="p-5">
                  <h3 className="font-bold">{a.name}</h3>
                  <p className="text-sm text-muted-foreground">{a.role}</p>
                  <p className="mt-2 text-xs uppercase tracking-widest text-gold">
                    {a.listeners} monthly
                  </p>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </Section>

      {/* Events */}
      <Section>
        <SectionHeading
          eyebrow="Events"
          title="Upcoming events"
          action="All events"
          actionTo="/events"
        />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {events.map((e) => (
            <GlassCard key={e.name + e.venue}>
              <p className="text-3xl font-black text-gradient-gold">{e.date}</p>
              <h3 className="mt-3 font-bold">{e.name}</h3>
              <p className="text-sm text-muted-foreground">{e.venue}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-sm font-semibold">{e.price}</span>
                <Button
                  asChild
                  size="sm"
                  className="rounded-full bg-gradient-gold text-primary-foreground hover:opacity-90"
                >
                  <Link to="/events">
                    <Ticket className="mr-1 h-3.5 w-3.5" />
                    Tickets
                  </Link>
                </Button>
              </div>
            </GlassCard>
          ))}
        </div>
      </Section>

      {/* Podcast + Booking CTA */}
      <Section>
        <div className="grid gap-6 lg:grid-cols-2">
          <GlassCard className="p-0 overflow-hidden">
            <img
              src={studioImg}
              alt="Podcast studio"
              loading="lazy"
              width={1024}
              height={768}
              className="h-52 w-full object-cover"
            />
            <div className="p-6">
              <p className="text-xs uppercase tracking-[0.3em] text-gold">Podcast</p>
              <h3 className="mt-2 text-2xl font-black">
                Episode 42 — Building an African studio system
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                With producer Mwansa Bwalya. 58 min · Video & audio.
              </p>
              <Button
                asChild
                className="mt-5 rounded-full bg-gradient-gold text-primary-foreground hover:opacity-90"
              >
                <Link to="/podcast">
                  <Mic className="mr-2 h-4 w-4" />
                  Listen now
                </Link>
              </Button>
            </div>
          </GlassCard>
          <GlassCard className="flex flex-col justify-center p-8">
            <p className="text-xs uppercase tracking-[0.3em] text-gold">Studio booking</p>
            <h3 className="mt-3 text-3xl font-black">Book the room the hits come from</h3>
            <p className="mt-3 text-sm text-muted-foreground">
              Recording, mixing, mastering, film sets, drone crews and full production teams —
              available by the hour, day or project.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                asChild
                className="rounded-full bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90"
              >
                <Link to="/bookings">Start a booking</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full border-border">
                <Link to="/contact">Talk to us</Link>
              </Button>
            </div>
          </GlassCard>
        </div>
      </Section>

      {/* Blog */}
      <Section>
        <SectionHeading
          eyebrow="Blog"
          title="From the newsroom"
          action="Read the blog"
          actionTo="/blog"
        />
        {blogLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader className="h-6 w-6 animate-spin text-gold" />
          </div>
        ) : blogPosts.length === 0 ? (
          <div className="text-center text-sm text-muted-foreground">
            No blog posts available yet
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {blogPosts.slice(0, 2).map((b) => (
              <GlassCard key={b.slug}>
                <p className="text-xs uppercase tracking-[0.25em] text-gold">
                  {b.category} · {b.read}
                </p>
                <h3 className="mt-3 text-xl font-bold">{b.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.excerpt}</p>
              </GlassCard>
            ))}
          </div>
        )}
      </Section>

      {/* Testimonials + sponsors */}
      <Section>
        <SectionHeading eyebrow="Testimonials" title="Trusted by the continent's best" />
        <div className="grid gap-5 md:grid-cols-3">
          {[
            [
              "“They shot, scored and delivered our campaign in nine days. Nobody else came close.”",
              "Chanda M., Brand Director",
            ],
            [
              "“The live stream held 40,000 viewers without a stutter. That's world class.”",
              "Tafadzwa N., Festival Producer",
            ],
            [
              "“X'Touch built my sound and my stage show. I owe them the room.”",
              "Nyla K., Recording Artist",
            ],
          ].map(([quote, who]) => (
            <GlassCard key={who}>
              <p className="text-sm leading-relaxed">{quote}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.2em] text-gold">{who}</p>
            </GlassCard>
          ))}
        </div>
        <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {["Zamtel", "Copper FM", "Lusaka Arts", "AfroWave", "SkyBank", "GoldMedia"].map((s) => (
            <div
              key={s}
              className="glass grid h-16 place-items-center rounded-2xl text-xs uppercase tracking-[0.2em] text-muted-foreground"
            >
              {s}
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
