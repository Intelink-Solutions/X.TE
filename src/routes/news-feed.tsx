import { createFileRoute, Link } from "@tanstack/react-router";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  BadgeCheck,
  Bookmark,
  CalendarDays,
  ExternalLink,
  Flag,
  Heart,
  MapPin,
  MessageCircle,
  Music2,
  Headphones,
  Pin,
  Play,
  Pause,
  Plus,
  BarChart3,
  Maximize2,
  Repeat2,
  Search,
  Send,
  Share2,
  ShieldCheck,
  Ticket,
  Eye,
  ImageOff,
  ImagePlus,
  Video,
  CalendarPlus,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { toast } from "sonner";
import heroImg from "@/assets/hero.jpg";
import tvImg from "@/assets/tv.jpg";
import dancersImg from "@/assets/dancers.jpg";
import studioImg from "@/assets/studio.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FEED_POSTS as STATIC_FEED_POSTS,
  FEED_TABS,
  TRENDING_TAGS,
  type FeedPost,
} from "@/lib/site-data";
import { AdPostCard } from "@/components/site/AdPostCard";
import { FormsWidget } from "@/components/site/FormsWidget";
import {
  useCreateFeedPost,
  useCreateFeedComment,
  useFeedComments,
  useFeedPostEngagement,
  useReportFeedPost,
  useRecordFeedPostView,
  useShareFeedPost,
  useToggleFeedPostBookmark,
  useToggleFeedPostLike,
  useToggleFeedPostRepost,
  useVoteFeedPoll,
  useFeedPosts,
  type FeedPost as ApiFeedPost,
} from "@/lib/api/hooks";
import { canPublishToFeed, getLocalFeedPosts, getProfile, type Profile } from "@/lib/local-store";
import { trackEvent } from "@/lib/analytics";
import { useAuth } from "@/lib/auth";
import { mediaUrl } from "@/lib/api/client";
import { useAudioPlayer } from "@/components/music/GlobalAudioPlayer";
import { EmbeddedVideo } from "@/components/site/EmbeddedVideo";

export const Route = createFileRoute("/news-feed")({
  head: () => ({
    meta: [
      { title: "News Feed — X'Touch Entertainment" },
      {
        name: "description",
        content:
          "The live X'Touch social timeline: music releases, TV announcements, event flyers, polls, podcasts and artist updates.",
      },
      { property: "og:title", content: "X'Touch News Feed" },
      { property: "og:description", content: "A live social timeline for everything X'Touch." },
    ],
  }),
  component: NewsFeedPage,
});

const IMAGES: Record<string, string> = {
  hero: heroImg,
  tv: tvImg,
  dancers: dancersImg,
  studio: studioImg,
};

const POST_TYPES = [
  { value: "update", label: "Update", category: "Updates" },
  { value: "photo", label: "Photo", category: "Photos" },
  { value: "news", label: "News", category: "News" },
  { value: "event", label: "Event", category: "Events" },
  { value: "ticket", label: "Ticket for sale", category: "Tickets" },
  { value: "music", label: "Music", category: "Music" },
  { value: "video", label: "Video", category: "Videos" },
  { value: "poll", label: "Poll", category: "Polls" },
  { value: "announcement", label: "Announcement", category: "Announcements" },
  { value: "tv", label: "TV", category: "TV" },
  { value: "production", label: "Production", category: "Production" },
] as const;

type ComposerKind = (typeof POST_TYPES)[number]["value"];

const VALID_KINDS = new Set<FeedPost["kind"]>([
  "photo",
  "video",
  "music",
  "event",
  "ticket",
  "news",
  "update",
  "poll",
  "podcast",
  "announcement",
  "tv",
  "production",
]);

function metricToNumber(value: string | number | undefined): number {
  if (typeof value === "number") return value;
  const normalized = String(value ?? "0")
    .trim()
    .toUpperCase();
  const match = normalized.match(/^([0-9]+(?:\.[0-9]+)?)([KMB])?$/);
  if (!match) return 0;
  const multiplier = { K: 1_000, M: 1_000_000, B: 1_000_000_000 }[match[2] ?? ""] ?? 1;
  return Number(match[1]) * multiplier;
}

function matchesFeedTab(post: FeedPost, tab: string): boolean {
  if (["Latest", "Trending", "Popular"].includes(tab)) return true;
  const normalizedCategory = post.category.toLowerCase();
  const normalizedTab = tab.toLowerCase();
  const kindAliases: Record<string, string[]> = {
    updates: ["update"],
    news: ["news"],
    videos: ["video"],
    music: ["music"],
    events: ["event", "poll"],
    tickets: ["ticket"],
    announcements: ["announcement"],
    tv: ["tv", "podcast"],
    production: ["production", "photo"],
  };
  return (
    normalizedCategory === normalizedTab || (kindAliases[normalizedTab] ?? []).includes(post.kind)
  );
}

function normalizeApiPost(post: ApiFeedPost): FeedPost {
  const kind = VALID_KINDS.has(post.kind as FeedPost["kind"])
    ? (post.kind as FeedPost["kind"])
    : "update";
  return {
    id: String(post.id),
    userId: post.user_id ?? undefined,
    trackId: post.track_id ?? undefined,
    authorType: post.author_type ?? undefined,
    author: post.author,
    handle: post.handle,
    verified: post.verified,
    time: post.created_at ? new Date(post.created_at).toLocaleDateString() : "Now",
    category: post.category,
    kind,
    pinned: post.is_pinned,
    text: post.text,
    hashtags: post.hashtags ?? [],
    tags: post.tags ?? [],
    location: post.location ?? undefined,
    likes: post.likes ?? 0,
    comments: post.comments ?? 0,
    shares: post.shares ?? 0,
    reposts: post.reposts ?? 0,
    views: post.views ?? "0",
    image: post.image_key ?? undefined,
    imageUrl: mediaUrl(post.image_url) ?? undefined,
    mediaUrl:
      post.kind === "music" && post.track_id
        ? (mediaUrl(`/api/tracks/${post.track_id}/stream`) ?? undefined)
        : (mediaUrl(post.media_url) ?? undefined),
    title: post.title ?? undefined,
    eventDate: post.event_date ?? undefined,
    venue: post.venue ?? undefined,
    ticketPrice: post.ticket_price ?? undefined,
    ticketUrl: post.ticket_url ?? undefined,
    poll: post.poll_options ?? undefined,
  };
}

function NewsFeedPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState("Latest");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(4);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [localPosts, setLocalPosts] = useState<FeedPost[]>([]);
  const [composerOpen, setComposerOpen] = useState(false);
  const { data: feedData } = useFeedPosts();

  useEffect(() => {
    document.documentElement.classList.add("news-feed-scroll");
    setProfile(getProfile());
    setLocalPosts(getLocalFeedPosts());
    return () => document.documentElement.classList.remove("news-feed-scroll");
  }, []);

  const rawPosts = useMemo(() => {
    const remotePosts = feedData?.data?.length
      ? feedData.data.map(normalizeApiPost)
      : STATIC_FEED_POSTS;
    return [...localPosts, ...remotePosts];
  }, [feedData, localPosts]);

  const posts = useMemo(() => {
    const filtered = rawPosts.filter((p) => {
      const matchTab = matchesFeedTab(p, tab);
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        p.text.toLowerCase().includes(q) ||
        p.author.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.hashtags.join(" ").toLowerCase().includes(q) ||
        (p.tags ?? []).join(" ").toLowerCase().includes(q);
      return matchTab && matchQuery;
    });
    const sorted = [...filtered];
    if (tab === "Popular") {
      sorted.sort(
        (a, b) => metricToNumber(b.views) + b.likes * 20 - metricToNumber(a.views) - a.likes * 20,
      );
    } else if (tab === "Trending") {
      sorted.sort(
        (a, b) =>
          b.likes * 2 +
          b.comments * 4 +
          b.shares * 5 +
          (b.reposts ?? 0) * 6 -
          (a.likes * 2 + a.comments * 4 + a.shares * 5 + (a.reposts ?? 0) * 6),
      );
    }
    return [...sorted].sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned));
  }, [rawPosts, tab, query]);

  return (
    <div className="news-feed-scrollbar mx-auto max-w-7xl px-4 py-6 sm:py-10 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          <h1 className="text-4xl font-black sm:text-5xl">
            News <span className="text-gradient-gold">Feed</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Everything happening across X&apos;Touch, in real time.
          </p>

          {profile && !user ? (
            <div className="glass mt-6 flex flex-col gap-4 rounded-3xl p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
                  <ShieldCheck className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-bold">Join the conversation</span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    Guests can read and watch. Register to like, comment and submit content for
                    review.
                  </span>
                </span>
              </div>
              <Button asChild variant="outline" className="shrink-0 rounded-full border-border">
                <Link to="/register">Create account</Link>
              </Button>
            </div>
          ) : null}

          <div className="mt-6 flex items-center gap-2">
            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search posts and hashtags"
                aria-label="Search the feed"
                className="h-11 rounded-full border-border bg-card/50 pl-9"
              />
            </div>
          </div>

          <div className="news-feed-scrollbar mt-4 flex gap-2 overflow-x-auto pb-2">
            {FEED_TABS.map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTab(t);
                  setVisible(4);
                }}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
                  tab === t
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="mt-6 grid gap-5">
            {posts.slice(0, visible).map((post, i) => (
              <Fragment key={post.id}>
                <PostCard post={post} onTagClick={setQuery} />
                {i === 1 ? <AdPostCard /> : null}
              </Fragment>
            ))}
            {posts.length === 0 ? (
              <p className="glass rounded-3xl p-10 text-center text-sm text-muted-foreground">
                No posts match that filter yet.
              </p>
            ) : null}
          </div>

          {visible < posts.length ? (
            <Button
              onClick={() => setVisible((v) => v + 3)}
              variant="outline"
              className="mt-6 w-full rounded-full border-border"
            >
              Load more posts
            </Button>
          ) : null}
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          <FormsWidget />
          <div className="glass rounded-3xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">Trending</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {TRENDING_TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setQuery(t)}
                  className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold"
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="glass rounded-3xl p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">
              Follow categories
            </h2>
            <ul className="mt-4 space-y-3">
              {FEED_TABS.slice(3).map((c) => (
                <li key={c} className="flex items-center justify-between gap-3">
                  <span className="text-sm">{c}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setTab(c);
                      setVisible(4);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="h-8 rounded-full border-border text-xs"
                  >
                    View
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>

      {profile && user ? (
        <>
          <Button
            type="button"
            onClick={() => setComposerOpen(true)}
            aria-label="Create a feed post"
            className="fixed bottom-24 right-5 z-40 h-14 w-14 rounded-full bg-gradient-gold p-0 text-primary-foreground shadow-gold hover:scale-105 hover:opacity-95 sm:bottom-8 sm:right-8"
          >
            <Plus className="h-7 w-7" />
          </Button>
          <Dialog open={composerOpen} onOpenChange={setComposerOpen}>
            <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto rounded-3xl border-border bg-card p-0">
              <DialogTitle className="sr-only">Create a feed post</DialogTitle>
              <CreatorComposer
                profile={{
                  ...profile,
                  name: user.name,
                  approvalStatus: user.approval,
                  accountRole: user.roles.some((role) => ["Artist", "Musician"].includes(role))
                    ? "artist"
                    : user.roles.includes("Event Organizer")
                      ? "event_organizer"
                      : user.approval === "approved"
                        ? "approved_user"
                        : "member",
                  handle:
                    profile.handle === "@guest"
                      ? `@${user.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}`
                      : profile.handle,
                }}
                onPublished={(post, isPublic) => {
                  if (isPublic) {
                    setLocalPosts((posts) => [
                      post,
                      ...posts.filter((item) => item.id !== post.id),
                    ]);
                    setVisible((count) => Math.max(count, 5));
                  }
                  setComposerOpen(false);
                }}
              />
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </div>
  );
}

function CreatorComposer({
  profile,
  onPublished,
}: {
  profile: Profile;
  onPublished: (post: FeedPost, isPublic: boolean) => void;
}) {
  const draftKey = `xtouch:feed-draft:${profile.handle}`;
  const [savedDraft, setSavedDraft] = useState<Record<string, string> | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      return JSON.parse(window.localStorage.getItem(draftKey) ?? "null");
    } catch {
      return null;
    }
  });
  const [kind, setKind] = useState<ComposerKind>(
    () => (savedDraft?.kind as ComposerKind | undefined) ?? "update",
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioPreview, setAudioPreview] = useState<string | null>(null);
  const [mediaUrlValue, setMediaUrlValue] = useState(savedDraft?.mediaUrl ?? "");
  const [pollOptions, setPollOptions] = useState<string[]>(() => {
    try {
      const parsed: unknown = savedDraft?.pollOptions
        ? JSON.parse(savedDraft.pollOptions)
        : ["", ""];
      return Array.isArray(parsed) && parsed.every((option) => typeof option === "string")
        ? parsed
        : ["", ""];
    } catch {
      return ["", ""];
    }
  });
  const [draftSaved, setDraftSaved] = useState(Boolean(savedDraft));
  const [showDetails, setShowDetails] = useState(
    Boolean(savedDraft && savedDraft.kind && savedDraft.kind !== "update"),
  );
  const imageInputRef = useRef<HTMLInputElement>(null);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const draftTimerRef = useRef<number | null>(null);
  const createPost = useCreateFeedPost();
  const type = POST_TYPES.find((item) => item.value === kind) ?? POST_TYPES[0];
  const needsTitle = !["update", "photo", "poll"].includes(kind);
  const isEventPost = kind === "event" || kind === "ticket";

  useEffect(
    () => () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    },
    [imagePreview],
  );

  useEffect(
    () => () => {
      if (audioPreview) URL.revokeObjectURL(audioPreview);
    },
    [audioPreview],
  );

  function clearImage() {
    setImageFile(null);
    setImagePreview(null);
    if (imageInputRef.current) imageInputRef.current.value = "";
    if (kind === "photo") setKind("update");
  }

  function selectImage(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Choose a JPG, PNG or WebP image.");
      event.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Images must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    if (kind === "update") setKind("photo");
  }

  function clearAudio() {
    setAudioFile(null);
    setAudioPreview(null);
    if (audioInputRef.current) audioInputRef.current.value = "";
    if (kind === "music") setKind("update");
  }

  function selectAudio(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const extension = file.name.split(".").pop()?.toLowerCase();
    const acceptedExtensions = new Set(["mp3", "m4a", "mp4", "wav", "ogg", "aac"]);
    const hasAudioType = file.type.startsWith("audio/") || file.type === "video/mp4";
    if (!hasAudioType && !acceptedExtensions.has(extension ?? "")) {
      toast.error("Choose an MP3, M4A, WAV, AAC or OGG audio file.");
      event.target.value = "";
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("Music uploads must be 25 MB or smaller.");
      event.target.value = "";
      return;
    }
    setAudioFile(file);
    setAudioPreview(URL.createObjectURL(file));
    setKind("music");
    setShowDetails(true);
  }

  function saveDraft(nextKind = kind) {
    if (!formRef.current) return;
    if (draftTimerRef.current) window.clearTimeout(draftTimerRef.current);
    draftTimerRef.current = window.setTimeout(() => {
      const values: Record<string, string> = {
        kind: nextKind,
        pollOptions: JSON.stringify(pollOptions),
      };
      new FormData(formRef.current!).forEach((value, key) => {
        if (typeof value === "string") values[key] = value;
      });
      window.localStorage.setItem(draftKey, JSON.stringify(values));
      setSavedDraft(values);
      setDraftSaved(true);
    }, 300);
  }

  function clearDraft() {
    window.localStorage.removeItem(draftKey);
    setSavedDraft(null);
    setDraftSaved(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canPublishToFeed(profile)) {
      toast.error("Your creator account must be approved before publishing.");
      return;
    }

    const form = event.currentTarget;
    const fields = new FormData(form);
    const value = (name: string) => String(fields.get(name) ?? "").trim();
    const text = value("text");
    const mediaUrl = value("mediaUrl");
    if (kind === "music" && Boolean(audioFile) === Boolean(mediaUrl)) {
      toast.error("Choose either an uploaded music file or an embedded audio URL.");
      return;
    }
    if (!text && !imageFile && !audioFile && !mediaUrl) {
      toast.error("Write something or add a photo, music file or media URL.");
      return;
    }

    const normalizedPollOptions = pollOptions.map((option) => option.trim()).filter(Boolean);
    if (kind === "poll" && normalizedPollOptions.length < 2) {
      toast.error("Add at least two poll choices.");
      return;
    }

    const hashtags = value("hashtags")
      .split(/[\s,]+/)
      .map((tag) => tag.trim())
      .filter(Boolean)
      .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`))
      .slice(0, 8);
    const tags = value("tags")
      .split(",")
      .map((tag) => tag.trim().replace(/^@/, ""))
      .filter(Boolean)
      .slice(0, 8);

    const submittedKind = imageFile && kind === "update" ? "photo" : kind;
    const submittedType = POST_TYPES.find((item) => item.value === submittedKind) ?? type;
    const payload = new FormData();
    payload.append("author", profile.name);
    payload.append(
      "handle",
      profile.handle.startsWith("@") ? profile.handle : `@${profile.handle}`,
    );
    payload.append("kind", submittedKind);
    payload.append("category", submittedType.category);
    payload.append("text", text);
    hashtags.forEach((tag, index) => payload.append(`hashtags[${index}]`, tag));
    tags.forEach((tag, index) => payload.append(`tags[${index}]`, tag));

    const optionalFields = {
      title: value("title"),
      location: value("location"),
      media_url: mediaUrl,
      event_date: value("eventDate"),
      venue: value("venue"),
      ticket_price: value("ticketPrice"),
      ticket_url: value("ticketUrl"),
    };
    Object.entries(optionalFields).forEach(([name, fieldValue]) => {
      if (fieldValue) payload.append(name, fieldValue);
    });
    if (imageFile) payload.append("image", imageFile, imageFile.name);
    if (audioFile) payload.append("audio", audioFile, audioFile.name);
    if (submittedKind === "poll") {
      normalizedPollOptions.forEach((option, index) => {
        payload.append(`poll_options[${index}][option]`, option);
        payload.append(`poll_options[${index}][percent]`, "0");
      });
    }

    try {
      const result = await createPost.mutateAsync(payload);
      const published = normalizeApiPost(result);
      const isPublic = result.approval_status === "approved";
      toast.success(isPublic ? "Published to the news feed" : "Submitted for admin approval");
      onPublished(published, isPublic);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Your post could not be published.");
      return;
    }

    form.reset();
    clearDraft();
    clearImage();
    clearAudio();
    setMediaUrlValue("");
    setPollOptions(["", ""]);
    setKind("update");
    setShowDetails(false);
  }

  return (
    <section className="overflow-hidden rounded-3xl" aria-labelledby="create-feed-post">
      <form
        ref={formRef}
        className="p-4 sm:p-5"
        onSubmit={handleSubmit}
        onInput={() => saveDraft()}
      >
        <div className="flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-gold text-sm font-black text-primary-foreground">
            {profile.name.charAt(0).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-3 px-1">
              <div>
                <h2 id="create-feed-post" className="text-sm font-bold">
                  {profile.name}
                </h2>
                <p className="text-[11px] text-muted-foreground">
                  Share with the X&apos;Touch community
                </p>
              </div>
              <Badge className="rounded-full bg-gold/10 text-gold hover:bg-gold/10">
                <BadgeCheck className="mr-1 h-3.5 w-3.5" /> Approved
              </Badge>
            </div>
            <Textarea
              id="feed-text"
              name="text"
              maxLength={2000}
              rows={3}
              defaultValue={savedDraft?.text ?? ""}
              placeholder={`What's on your mind, ${profile.name.split(" ")[0]}?`}
              className="min-h-24 resize-none rounded-2xl border-0 bg-accent/45 px-4 py-3 text-base shadow-none focus-visible:ring-1 focus-visible:ring-gold/50"
            />
          </div>
        </div>

        <input
          ref={imageInputRef}
          id="feed-image-file"
          name="image"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={selectImage}
          className="sr-only"
        />
        <input
          ref={audioInputRef}
          id="feed-audio-file"
          name="audio"
          type="file"
          disabled={Boolean(mediaUrlValue.trim())}
          accept="audio/*,audio/mpeg,audio/mp4,video/mp4,.mp3,.m4a,.mp4,.wav,.ogg,.aac"
          onChange={selectAudio}
          className="sr-only"
        />

        {imagePreview ? (
          <div className="relative mt-4 overflow-hidden rounded-2xl border border-border bg-black/20">
            <img
              src={imagePreview}
              alt="Selected post upload preview"
              className="max-h-[420px] w-full object-contain"
            />
            <button
              type="button"
              onClick={clearImage}
              aria-label="Remove selected image"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-black/70 text-white transition-colors hover:bg-black"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-10 text-xs text-white/80">
              {imageFile?.name}
            </div>
          </div>
        ) : null}

        {audioPreview ? (
          <div className="relative mt-4 rounded-2xl border border-border bg-background/40 p-4 pr-14">
            <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
              <Headphones className="h-4 w-4 text-gold" />
              <span className="truncate">{audioFile?.name}</span>
            </div>
            <audio controls preload="metadata" src={audioPreview} className="h-10 w-full" />
            <button
              type="button"
              onClick={clearAudio}
              aria-label="Remove selected music"
              className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-full bg-accent text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : null}

        <div className="mt-4 flex flex-wrap items-center gap-1 border-y border-border py-2">
          <span className="mr-auto px-2 text-xs font-semibold text-muted-foreground">
            Add to your post
          </span>
          <label
            htmlFor="feed-image-file"
            className="inline-flex cursor-pointer items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-emerald-400 transition-colors hover:bg-accent"
          >
            <ImagePlus className="h-4 w-4" /> Photo
          </label>
          <label
            htmlFor="feed-audio-file"
            aria-disabled={Boolean(mediaUrlValue.trim())}
            className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-fuchsia-400 transition-colors ${
              mediaUrlValue.trim()
                ? "cursor-not-allowed opacity-40"
                : "cursor-pointer hover:bg-accent"
            }`}
          >
            <Headphones className="h-4 w-4" /> Music
          </label>
          <button
            type="button"
            onClick={() => {
              setKind("video");
              setShowDetails(true);
            }}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-sky-400 transition-colors hover:bg-accent"
          >
            <Video className="h-4 w-4" /> Video
          </button>
          <button
            type="button"
            onClick={() => {
              setKind("event");
              setShowDetails(true);
            }}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-amber-400 transition-colors hover:bg-accent"
          >
            <CalendarPlus className="h-4 w-4" /> Event
          </button>
          <button
            type="button"
            onClick={() => {
              setKind("poll");
              setShowDetails(true);
            }}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-violet-400 transition-colors hover:bg-accent"
          >
            <BarChart3 className="h-4 w-4" /> Poll
          </button>
          <button
            type="button"
            onClick={() => setShowDetails((visible) => !visible)}
            className="inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <SlidersHorizontal className="h-4 w-4" /> Details
          </button>
        </div>

        {draftSaved ? (
          <div className="mt-3 flex items-center justify-between gap-3 rounded-xl bg-gold/5 px-3 py-2 text-xs text-muted-foreground">
            <span>Draft restored and saved automatically on this device.</span>
            <button
              type="button"
              onClick={clearDraft}
              className="font-semibold text-gold hover:underline"
            >
              Clear draft
            </button>
          </div>
        ) : null}

        {showDetails ? (
          <div className="mt-4 grid gap-4 rounded-2xl border border-border bg-background/25 p-4">
            <div className="grid gap-2 sm:grid-cols-[180px_minmax(0,1fr)] sm:items-start">
              <div className="grid gap-2">
                <Label htmlFor="feed-post-type">Post type</Label>
                <Select
                  value={kind}
                  onValueChange={(value) => {
                    setKind(value as ComposerKind);
                    saveDraft(value as ComposerKind);
                  }}
                >
                  <SelectTrigger
                    id="feed-post-type"
                    className="h-11 rounded-xl border-border bg-background/60"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {POST_TYPES.map((item) => (
                      <SelectItem key={item.value} value={item.value}>
                        {item.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {needsTitle ? (
                <div className="grid gap-2">
                  <Label htmlFor="feed-title">
                    {kind === "music"
                      ? "Track title"
                      : isEventPost
                        ? "Event / listing title"
                        : "Headline"}
                  </Label>
                  <Input
                    id="feed-title"
                    name="title"
                    defaultValue={savedDraft?.title ?? ""}
                    required={kind !== "music" || !audioFile}
                    maxLength={120}
                    placeholder={
                      kind === "music" && audioFile
                        ? "Optional — the filename will be used"
                        : undefined
                    }
                    className="h-11 rounded-xl border-border bg-background/60"
                  />
                </div>
              ) : null}
            </div>

            {kind === "music" || kind === "video" || kind === "tv" ? (
              <div className="grid gap-2">
                <Label htmlFor="feed-media-url">
                  {kind === "music" ? "Embed audio URL" : "Video URL"}
                </Label>
                <Input
                  id="feed-media-url"
                  name="mediaUrl"
                  value={mediaUrlValue}
                  onChange={(event) => setMediaUrlValue(event.target.value)}
                  type="url"
                  required={kind !== "music"}
                  disabled={kind === "music" && Boolean(audioFile)}
                  placeholder={kind === "music" ? "https://…/track.mp3" : "https://…/video.mp4"}
                  className="h-11 rounded-xl border-border bg-background/60"
                />
                {kind === "music" ? (
                  <p className="text-xs text-muted-foreground">
                    Use one source only: this URL or an uploaded music file.
                  </p>
                ) : null}
              </div>
            ) : null}

            {kind === "poll" ? (
              <div className="grid gap-3">
                <Label>Poll choices</Label>
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex gap-2">
                    <Input
                      value={option}
                      onChange={(event) =>
                        setPollOptions((options) =>
                          options.map((item, optionIndex) =>
                            optionIndex === index ? event.target.value : item,
                          ),
                        )
                      }
                      maxLength={100}
                      placeholder={`Choice ${index + 1}`}
                      aria-label={`Poll choice ${index + 1}`}
                      className="h-11 rounded-xl border-border bg-background/60"
                    />
                    {pollOptions.length > 2 ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label={`Remove poll choice ${index + 1}`}
                        onClick={() =>
                          setPollOptions((options) => options.filter((_, i) => i !== index))
                        }
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </div>
                ))}
                {pollOptions.length < 6 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setPollOptions((options) => [...options, ""])}
                    className="w-fit rounded-full border-border"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add choice
                  </Button>
                ) : null}
              </div>
            ) : null}

            {isEventPost ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="feed-event-date">Date and time</Label>
                  <Input
                    id="feed-event-date"
                    name="eventDate"
                    defaultValue={savedDraft?.eventDate ?? ""}
                    type="datetime-local"
                    required
                    className="h-11 rounded-xl border-border bg-background/60"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="feed-venue">Venue</Label>
                  <Input
                    id="feed-venue"
                    name="venue"
                    defaultValue={savedDraft?.venue ?? ""}
                    required
                    maxLength={120}
                    className="h-11 rounded-xl border-border bg-background/60"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="feed-ticket-price">
                    Ticket price {kind === "event" ? "(optional)" : ""}
                  </Label>
                  <Input
                    id="feed-ticket-price"
                    name="ticketPrice"
                    defaultValue={savedDraft?.ticketPrice ?? ""}
                    required={kind === "ticket"}
                    placeholder="K350"
                    maxLength={40}
                    className="h-11 rounded-xl border-border bg-background/60"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="feed-ticket-url">
                    Ticket / Buy URL {kind === "event" ? "(optional)" : ""}
                  </Label>
                  <Input
                    id="feed-ticket-url"
                    name="ticketUrl"
                    defaultValue={savedDraft?.ticketUrl ?? ""}
                    type="url"
                    required={kind === "ticket"}
                    placeholder="https://…"
                    className="h-11 rounded-xl border-border bg-background/60"
                  />
                </div>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="feed-location">
                  Location <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="feed-location"
                  name="location"
                  defaultValue={savedDraft?.location ?? ""}
                  maxLength={100}
                  className="h-11 rounded-xl border-border bg-background/60"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="feed-hashtags">
                  Hashtags <span className="text-muted-foreground">(optional)</span>
                </Label>
                <Input
                  id="feed-hashtags"
                  name="hashtags"
                  defaultValue={savedDraft?.hashtags ?? ""}
                  placeholder="#XTouch #NewMusic"
                  maxLength={160}
                  className="h-11 rounded-xl border-border bg-background/60"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="feed-tags">
                  Tags <span className="text-muted-foreground">(comma-separated)</span>
                </Label>
                <Input
                  id="feed-tags"
                  name="tags"
                  defaultValue={savedDraft?.tags ?? ""}
                  placeholder="artist, live show, Lusaka"
                  maxLength={200}
                  className="h-11 rounded-xl border-border bg-background/60"
                />
              </div>
            </div>
          </div>
        ) : null}

        <div className="mt-4">
          <Button
            type="submit"
            disabled={createPost.isPending}
            className="h-11 w-full rounded-xl bg-gradient-gold px-6 font-semibold text-primary-foreground shadow-gold hover:opacity-90"
          >
            <Send className="mr-2 h-4 w-4" /> {createPost.isPending ? "Publishing…" : "Publish"}
          </Button>
        </div>
      </form>
    </section>
  );
}

function PostCard({ post, onTagClick }: { post: FeedPost; onTagClick: (tag: string) => void }) {
  const { user } = useAuth();
  const reportPost = useReportFeedPost();
  const togglePostLike = useToggleFeedPostLike();
  const togglePostBookmark = useToggleFeedPostBookmark();
  const togglePostRepost = useToggleFeedPostRepost();
  const sharePost = useShareFeedPost();
  const recordPostView = useRecordFeedPostView();
  const player = useAudioPlayer();
  const votePoll = useVoteFeedPoll();
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [reposted, setReposted] = useState(false);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [shareCount, setShareCount] = useState(post.shares);
  const [repostCount, setRepostCount] = useState(post.reposts ?? 0);
  const [viewCount, setViewCount] = useState(post.views);
  const [showComments, setShowComments] = useState(false);
  const [showImage, setShowImage] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const [pollOptions, setPollOptions] = useState(post.poll ?? []);
  const [selectedPollOption, setSelectedPollOption] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState("");
  const commentInputRef = useRef<HTMLInputElement>(null);
  const imageSource = post.imageUrl ?? (post.image ? IMAGES[post.image] : undefined);
  const analyticsId = Number(post.id);
  const isRemotePost = Number.isFinite(analyticsId) && !String(post.id).startsWith("local-");
  const { data: engagement } = useFeedPostEngagement(post.id, Boolean(user) && isRemotePost);
  const { data: comments = [] } = useFeedComments(post.id, showComments && isRemotePost);
  const createComment = useCreateFeedComment();

  useEffect(() => {
    if (!engagement) return;
    setLiked(engagement.liked);
    setSaved(engagement.saved);
    setReposted(engagement.reposted);
    setLikeCount(engagement.likes_count);
    setCommentCount(engagement.comments_count);
    setShareCount(engagement.shares_count);
    setRepostCount(engagement.reposts_count);
    setViewCount(engagement.views);
  }, [engagement]);

  useEffect(() => setPollOptions(post.poll ?? []), [post.poll]);
  useEffect(() => setImageFailed(false), [imageSource]);

  function handlePostClick() {
    if (!isRemotePost) return;
    const key = `xtouch-feed-view:${post.id}`;
    if (window.sessionStorage.getItem(key)) return;
    window.sessionStorage.setItem(key, "1");
    void recordPostView
      .mutateAsync(post.id)
      .then((result) => setViewCount(result.views))
      .catch(() => window.sessionStorage.removeItem(key));
  }

  async function handleShare() {
    if (!user) {
      toast.error("Sign in to share posts");
      return;
    }
    if (!isRemotePost) {
      toast.error("This post is not available for sharing yet");
      return;
    }

    const url = `${window.location.origin}/news-feed#post-${post.id}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: post.title ?? "X'Touch post", text: post.text, url });
      } else {
        await navigator.clipboard.writeText(url);
        toast.success("Share link copied");
      }
      const result = await sharePost.mutateAsync(post.id);
      setShareCount(result.shares_count);
      trackEvent("post_share", { entity_type: "feed_post", entity_id: analyticsId });
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Could not share this post");
    }
  }

  return (
    <article
      id={`post-${post.id}`}
      onClickCapture={handlePostClick}
      className="glass card-hover scroll-mt-24 overflow-hidden rounded-3xl"
    >
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-5">
        {post.userId ? (
          <Link
            to="/users/$userId"
            params={{ userId: String(post.userId) }}
            aria-label={`View ${post.author}'s profile`}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-gold text-sm font-black text-primary-foreground transition hover:scale-105"
          >
            {post.author.charAt(0)}
          </Link>
        ) : (
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-gold text-sm font-black text-primary-foreground">
            {post.author.charAt(0)}
          </span>
        )}
        <span className="min-w-0">
          <span className="flex min-w-0 items-center gap-1.5">
            {post.userId ? (
              <Link
                to="/users/$userId"
                params={{ userId: String(post.userId) }}
                className="truncate text-sm font-bold transition hover:text-gold hover:underline"
              >
                {post.author}
              </Link>
            ) : (
              <span className="truncate text-sm font-bold">{post.author}</span>
            )}
            {post.verified ? <BadgeCheck className="h-4 w-4 shrink-0 text-gold" /> : null}
            {post.authorType && ["Artist", "Musician", "Podcaster"].includes(post.authorType) ? (
              <Badge
                variant="outline"
                className="h-5 rounded-full border-gold/40 px-2 text-[9px] uppercase tracking-wider text-gold"
              >
                {post.authorType === "Musician" ? "Artist" : post.authorType}
              </Badge>
            ) : null}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {post.handle} · {post.time}
            {post.location ? (
              <span className="ml-1 inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                {post.location}
              </span>
            ) : null}
          </span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          {post.pinned ? (
            <Badge className="rounded-full border-gold/40 bg-gold/10 text-gold hover:bg-gold/10">
              <Pin className="mr-1 h-3 w-3" /> Pinned
            </Badge>
          ) : null}
          <Badge
            variant="outline"
            className="rounded-full border-border text-xs text-muted-foreground"
          >
            {post.category}
          </Badge>
        </span>
      </div>

      <div className="px-5 pb-4">
        {post.title && !["event", "ticket", "music"].includes(post.kind) ? (
          <h2 className="mb-2 text-xl font-black">{post.title}</h2>
        ) : null}
        <p className={`text-sm leading-relaxed ${expanded ? "" : "line-clamp-3"}`}>{post.text}</p>
        {post.text.length > 120 ? (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-1 text-xs font-semibold text-gold"
          >
            {expanded ? "Show less" : "Read more"}
          </button>
        ) : null}
        <p className="mt-3 flex flex-wrap gap-2 text-xs text-gold">
          {post.hashtags.map((h) => (
            <button key={h} onClick={() => onTagClick(h)} className="hover:underline">
              {h}
            </button>
          ))}
        </p>
        {post.tags?.length ? (
          <div className="mt-3 flex flex-wrap gap-2" aria-label="Post tags">
            {post.tags.map((tag) => (
              <button
                key={tag}
                onClick={() => onTagClick(tag)}
                className="rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold"
              >
                @{tag}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {imageSource && !imageFailed && !(["video", "tv"].includes(post.kind) && post.mediaUrl) ? (
        <button
          type="button"
          onClick={() => setShowImage(true)}
          className="group relative block w-full overflow-hidden bg-black/20 text-left"
          aria-label="View image full screen"
        >
          <img
            src={imageSource}
            alt={post.text.slice(0, 60)}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            width={1024}
            height={768}
            className="max-h-[420px] w-full object-cover"
          />
          <span className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-2 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
            <Maximize2 className="h-4 w-4" /> View image
          </span>
          {post.kind === "video" ? (
            <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-gold text-primary-foreground shadow-gold">
              <Play className="h-5 w-5 fill-current" />
            </span>
          ) : null}
        </button>
      ) : null}

      <Dialog open={showImage} onOpenChange={setShowImage}>
        <DialogContent className="max-w-6xl border-border bg-black/95 p-3">
          <DialogTitle className="sr-only">{post.title ?? `${post.author}'s image`}</DialogTitle>
          {imageSource && !imageFailed ? (
            <img
              src={imageSource}
              alt={post.text.slice(0, 100)}
              decoding="async"
              onError={() => {
                setImageFailed(true);
                setShowImage(false);
              }}
              className="max-h-[85vh] w-full object-contain"
            />
          ) : null}
        </DialogContent>
      </Dialog>

      {imageSource && imageFailed ? (
        <div className="mx-5 grid min-h-32 place-items-center rounded-2xl border border-border bg-background/40 p-6 text-center text-muted-foreground">
          <span>
            <ImageOff className="mx-auto h-7 w-7 text-gold/70" />
            <span className="mt-2 block text-xs">This image is temporarily unavailable.</span>
          </span>
        </div>
      ) : null}

      {["video", "tv"].includes(post.kind) && post.mediaUrl ? (
        <div className="bg-black p-2">
          <EmbeddedVideo
            url={post.mediaUrl}
            title={post.title ?? post.text.slice(0, 60)}
            className="mx-auto max-h-[520px]"
          />
        </div>
      ) : null}

      {post.kind === "music" ? (
        <div className="mx-5 mt-4 grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 rounded-2xl border border-border bg-background/40 p-4">
          <button
            type="button"
            onClick={() => {
              if (!post.mediaUrl) return;
              const trackId = post.trackId ?? -Number(post.id);
              if (player.track?.id === trackId) void player.toggle();
              else
                player.play({
                  id: trackId,
                  title: post.title ?? "Featured track",
                  artist: post.author,
                  streamUrl: post.mediaUrl,
                  coverUrl: imageSource,
                });
            }}
            disabled={!post.mediaUrl}
            aria-label={
              player.track?.id === (post.trackId ?? -Number(post.id)) && player.playing
                ? "Pause music"
                : "Play music"
            }
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-gold text-primary-foreground disabled:opacity-50"
          >
            {player.track?.id === (post.trackId ?? -Number(post.id)) && player.playing ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : (
              <Play className="h-4 w-4 fill-current" />
            )}
          </button>
          <span className="min-w-0">
            <span className="flex items-center gap-2 truncate text-sm font-semibold">
              <Music2 className="h-4 w-4 shrink-0 text-gold" />
              <span className="truncate">{post.title ?? "Featured track"}</span>
            </span>
            {post.mediaUrl ? (
              <button
                type="button"
                onClick={() => {
                  const trackId = post.trackId ?? -Number(post.id);
                  if (player.track?.id === trackId) void player.toggle();
                  else
                    player.play({
                      id: trackId,
                      title: post.title ?? "Featured track",
                      artist: post.author,
                      streamUrl: post.mediaUrl!,
                      coverUrl: imageSource,
                    });
                }}
                className="mt-2 text-xs font-semibold text-gold hover:underline"
              >
                {player.track?.id === (post.trackId ?? -Number(post.id)) && player.playing
                  ? "Pause track"
                  : "Play Now"}
              </button>
            ) : (
              <Progress value={38} className="mt-2 h-1.5" />
            )}
          </span>
        </div>
      ) : null}

      {post.kind === "event" || post.kind === "ticket" ? (
        <div className="mx-5 mt-4 rounded-2xl border border-gold/20 bg-gold/5 p-4">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
              {post.kind === "ticket" ? (
                <Ticket className="h-4 w-4" />
              ) : (
                <CalendarDays className="h-4 w-4" />
              )}
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="font-bold">
                {post.title ?? (post.kind === "ticket" ? "Ticket listing" : "Event")}
              </h3>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-muted-foreground">
                {post.eventDate ? (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(post.eventDate).toLocaleString()}
                  </span>
                ) : null}
                {post.venue ? (
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-3.5 w-3.5" />
                    {post.venue}
                  </span>
                ) : null}
              </div>
            </div>
            {post.ticketPrice ? (
              <span className="shrink-0 font-black text-gold">{post.ticketPrice}</span>
            ) : null}
          </div>
          {post.ticketUrl ? (
            <Button
              asChild
              size="sm"
              className="mt-4 rounded-full bg-gradient-gold text-primary-foreground hover:opacity-90"
            >
              <a href={post.ticketUrl} target="_blank" rel="noreferrer">
                {post.kind === "ticket" ? "Buy Ticket" : "Get tickets"}
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </a>
            </Button>
          ) : null}
        </div>
      ) : null}

      {pollOptions.length ? (
        <div className="mx-5 mt-4 space-y-3">
          {pollOptions.map((opt, optionIndex) => (
            <button
              key={opt.option}
              type="button"
              disabled={votePoll.isPending}
              onClick={() => {
                if (!user) {
                  toast.error("Sign in to vote");
                  return;
                }
                if (!isRemotePost) {
                  toast.error("This poll is not available for voting yet");
                  return;
                }
                void votePoll
                  .mutateAsync({ id: post.id, optionIndex })
                  .then((result) => {
                    setPollOptions(result.poll_options);
                    setSelectedPollOption(result.selected_option_index);
                    toast.success(`Vote recorded for ${opt.option}`);
                  })
                  .catch((error) =>
                    toast.error(error instanceof Error ? error.message : "Vote could not be saved"),
                  );
              }}
              aria-pressed={selectedPollOption === optionIndex}
              className={`block w-full rounded-2xl border p-3 text-left transition-colors hover:border-gold/50 ${
                selectedPollOption === optionIndex ? "border-gold/60 bg-gold/10" : "border-border"
              }`}
            >
              <span className="flex items-center justify-between text-sm">
                <span className="truncate font-medium">{opt.option}</span>
                <span className="text-gold">
                  {opt.percent}%{typeof opt.votes === "number" ? ` · ${opt.votes}` : ""}
                </span>
              </span>
              <Progress value={opt.percent} className="mt-2 h-1.5" />
            </button>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-1 border-t border-border px-3 py-2">
        <ActionButton
          active={liked}
          onClick={() => {
            if (!user) {
              toast.error("Sign in to like posts");
              return;
            }
            if (!isRemotePost) {
              toast.error("This post is not available for likes yet");
              return;
            }
            void togglePostLike
              .mutateAsync(post.id)
              .then((result) => {
                setLiked(result.liked);
                setLikeCount(result.likes_count);
                if (result.liked)
                  trackEvent("post_like", { entity_type: "feed_post", entity_id: analyticsId });
              })
              .catch(() => toast.error("Could not update like"));
          }}
          icon={<Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />}
          label={String(likeCount)}
        />
        <ActionButton
          onClick={() => setShowComments((v) => !v)}
          expanded={showComments}
          icon={<MessageCircle className="h-4 w-4" />}
          label={String(commentCount)}
        />
        <ActionButton
          active={reposted}
          onClick={() => {
            if (!user) {
              toast.error("Sign in to repost");
              return;
            }
            if (!isRemotePost) {
              toast.error("This post is not available for reposting yet");
              return;
            }
            void togglePostRepost
              .mutateAsync(post.id)
              .then((result) => {
                setReposted(result.reposted);
                setRepostCount(result.reposts_count);
                toast.success(result.reposted ? "Reposted to your feed" : "Repost removed");
              })
              .catch(() => toast.error("Could not update repost"));
          }}
          icon={<Repeat2 className="h-4 w-4" />}
          label={String(repostCount)}
        />
        <ActionButton
          onClick={() => void handleShare()}
          icon={<Share2 className="h-4 w-4" />}
          label={String(shareCount)}
        />
        <ActionButton
          active={saved}
          onClick={() => {
            if (!user) {
              toast.error("Sign in to save posts");
              return;
            }
            if (!isRemotePost) {
              toast.error("This post is not available for saving yet");
              return;
            }
            void togglePostBookmark
              .mutateAsync(post.id)
              .then((result) => {
                setSaved(result.saved);
                toast.success(result.saved ? "Saved to your bookmarks" : "Removed from saved");
              })
              .catch(() => toast.error("Could not update bookmark"));
          }}
          icon={<Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />}
          label="Save"
        />
        <span className="ml-auto flex items-center gap-3 px-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            {viewCount}
          </span>
          <button
            aria-label="Report post"
            onClick={async () => {
              if (!user) {
                toast.error("Sign in to report posts");
                return;
              }
              if (String(post.id).startsWith("local-")) {
                toast("This offline post cannot be reported yet");
                return;
              }
              try {
                await reportPost.mutateAsync({ id: post.id, reason: "community_report" });
                toast.success("Post reported to moderators");
              } catch {
                toast.error("The report could not be sent. Please try again.");
              }
            }}
            className="transition-colors hover:text-destructive"
          >
            <Flag className="h-3.5 w-3.5" />
          </button>
        </span>
      </div>

      {showComments ? (
        <div className="border-t border-border p-5">
          <ul className="space-y-3">
            {comments.map((c) => (
              <li key={c.id} className="grid grid-cols-[auto_minmax(0,1fr)] gap-3">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent text-xs font-bold">
                  {c.user.name.charAt(0)}
                </span>
                <span className="min-w-0 rounded-2xl bg-background/50 px-4 py-2">
                  <span className="block text-xs font-semibold">{c.user.name}</span>
                  <span className="block text-sm text-muted-foreground">{c.body}</span>
                  {user ? (
                    <button
                      type="button"
                      onClick={() => {
                        setDraft(`@${c.user.name} `);
                        window.setTimeout(() => commentInputRef.current?.focus(), 0);
                      }}
                      className="mt-1 text-[11px] font-semibold text-gold"
                    >
                      Reply
                    </button>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
          {user ? (
            <form
              className="mt-4 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (!draft.trim()) return;
                if (!isRemotePost) {
                  toast.error("This post is not available for comments yet");
                  return;
                }
                void createComment
                  .mutateAsync({ id: post.id, body: draft.trim() })
                  .then(() => {
                    setCommentCount((count) => count + 1);
                    setDraft("");
                  })
                  .catch(() => toast.error("Comment could not be posted"));
                if (Number.isFinite(analyticsId))
                  trackEvent("post_comment", { entity_type: "feed_post", entity_id: analyticsId });
              }}
            >
              <Input
                ref={commentInputRef}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Write a comment…"
                aria-label="Write a comment"
                className="h-10 rounded-full border-border bg-background/60"
              />
              <Button
                disabled={createComment.isPending}
                className="h-10 shrink-0 rounded-full bg-gradient-gold text-primary-foreground hover:opacity-90"
              >
                {createComment.isPending ? "Posting…" : "Post"}
              </Button>
            </form>
          ) : (
            <p className="mt-4 rounded-2xl border border-border p-4 text-center text-sm text-muted-foreground">
              <Link to="/login" className="font-semibold text-gold">
                Sign in
              </Link>{" "}
              to write a comment.
            </p>
          )}
        </div>
      ) : null}
    </article>
  );
}

function ActionButton({
  icon,
  label,
  onClick,
  active,
  expanded,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  expanded?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-expanded={expanded}
      className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs transition-colors hover:bg-accent ${
        active ? "text-gold" : "text-muted-foreground"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
