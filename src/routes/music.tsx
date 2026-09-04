import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Heart,
  ListMusic,
  Loader,
  Play,
  Download,
  Pause,
  UploadCloud,
  Rss,
  Music2,
  UserCheck,
  UserPlus,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import studioImg from "@/assets/studio.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Section, SectionHeading, GlassCard, PageHero } from "@/components/site/Primitives";
import { AdPostCard } from "@/components/site/AdPostCard";
import { FormsWidget } from "@/components/site/FormsWidget";
import { EmbeddedVideo } from "@/components/site/EmbeddedVideo";
import { addUpload, getUploads, type MusicUpload } from "@/lib/local-store";
import {
  useArtists,
  useArtistFollowStatus,
  useFeedPosts,
  usePlaylists,
  useSubmitTrack,
  useToggleArtistFollow,
  useToggleTrackLike,
  useTracks,
} from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth";
import { mediaUrl } from "@/lib/api/client";
import {
  ExpandedAudioPlayer,
  useAudioPlayer,
  type PlayerTrack,
} from "@/components/music/GlobalAudioPlayer";

export const Route = createFileRoute("/music")({
  head: () => ({
    meta: [
      { title: "Music — Stream X'Touch Albums, Singles & Charts" },
      {
        name: "description",
        content:
          "Stream X'Touch albums, singles, music videos and playlists. Charts, genres, lyrics, favourites and downloads.",
      },
      { property: "og:title", content: "X'Touch Music" },
      {
        property: "og:description",
        content: "Albums, singles, playlists, charts and music videos.",
      },
    ],
  }),
  component: MusicPage,
});

const GENRES = ["Afrobeats", "Amapiano", "Kalindula", "Gospel", "Hip-Hop", "R&B", "Live Band"];
const uploadSchema = z.object({
  title: z.string().trim().min(2, "Add a track title").max(120),
  artist: z.string().trim().min(2, "Add an artist name").max(120),
  genre: z.string().trim().min(1, "Pick a genre"),
});

function MusicPage() {
  const { user } = useAuth();
  const { data: rawTracks, isLoading: tracksLoading } = useTracks();
  const { data: rawArtists, isLoading: artistsLoading } = useArtists();
  const { data: videoFeed, isLoading: videosLoading } = useFeedPosts("kind=video");
  const { data: userPlaylists = [] } = usePlaylists(Boolean(user));
  const TRACKS = useMemo(
    () =>
      (rawTracks ?? []).map((t) => ({
        id: t.id,
        title: t.title,
        artist: t.artist?.name ?? "Unknown artist",
        album: t.album ?? "",
        length: t.duration ?? "",
        plays: t.plays ?? "0",
        streamUrl: mediaUrl(t.stream_url) ?? "",
        downloadUrl: mediaUrl(t.download_url) ?? "",
        coverUrl: mediaUrl(t.cover_url),
        likesCount: t.likes_count ?? 0,
        initiallyLiked: t.is_liked ?? false,
      })),
    [rawTracks],
  );
  const ARTISTS = (rawArtists ?? []).map((a) => ({
    id: a.id,
    name: a.name,
    role: a.role ?? "Artist",
    listeners: a.monthly_listeners ?? "0",
    imageUrl: mediaUrl(a.image_url) ?? studioImg,
  }));
  const MUSIC_VIDEOS = (videoFeed?.data ?? [])
    .filter((post) => Boolean(post.media_url))
    .slice(0, 4);

  const player = useAudioPlayer();
  const playableQueue = useMemo<PlayerTrack[]>(
    () =>
      TRACKS.filter((track) => Boolean(track.streamUrl)).map((track) => ({
        id: track.id,
        title: track.title,
        artist: track.artist,
        streamUrl: track.streamUrl,
        downloadUrl: track.downloadUrl,
        coverUrl: track.coverUrl,
      })),
    [TRACKS],
  );
  const [liked, setLiked] = useState<Set<number>>(new Set());
  const [likeCounts, setLikeCounts] = useState<Record<number, number>>({});
  const [uploads, setUploads] = useState<MusicUpload[]>([]);
  const [genre, setGenre] = useState("");
  const [fileName, setFileName] = useState("");
  const [trackUrl, setTrackUrl] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const audioInputRef = useRef<HTMLInputElement>(null);
  const submitTrack = useSubmitTrack();
  const toggleTrackLike = useToggleTrackLike();

  useEffect(() => {
    setUploads(getUploads());
  }, []);

  useEffect(() => {
    setLiked(new Set(TRACKS.filter((track) => track.initiallyLiked).map((track) => track.id)));
  }, [TRACKS]);

  useEffect(() => {
    if (player.track) return;
    const track = playableQueue[0];
    if (!track) return;
    player.load(track, playableQueue);
  }, [player, playableQueue]);

  async function toggleLike(track: (typeof TRACKS)[number]) {
    if (!user) {
      toast.error("Sign in to like music");
      return;
    }
    try {
      const result = await toggleTrackLike.mutateAsync(track.id);
      setLiked((previous) => {
        const next = new Set(previous);
        if (result.liked) next.add(track.id);
        else next.delete(track.id);
        return next;
      });
      setLikeCounts((previous) => ({ ...previous, [track.id]: result.likes_count }));
      toast.success(
        result.liked
          ? `Added "${track.title}" to your likes`
          : `Removed "${track.title}" from your likes`,
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update like");
    }
  }

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = uploadSchema.safeParse({
      title: fd.get("title"),
      artist: fd.get("artist"),
      genre,
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const file = fd.get("audio") as File | null;
    const hasFile = Boolean(file?.size);
    const audioUrl = String(fd.get("audio_url") ?? "").trim();
    const hasAudioUrl = Boolean(audioUrl);
    if (hasFile === hasAudioUrl) {
      toast.error("Choose either an audio file or an embedded audio URL");
      return;
    }
    if (hasAudioUrl) {
      try {
        const parsedUrl = new URL(audioUrl);
        if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error();
      } catch {
        toast.error("Add a valid audio URL");
        return;
      }
    }
    if (file && file.size > 30 * 1024 * 1024) {
      toast.error("Audio files must be 30 MB or smaller");
      return;
    }
    if (!user) {
      toast.error("Register or sign in before uploading music.");
      return;
    }
    const upload: MusicUpload = {
      id: crypto.randomUUID(),
      title: parsed.data.title,
      artist: parsed.data.artist,
      genre: parsed.data.genre,
      fileName: hasFile ? file!.name : audioUrl,
      uploadedAt: "Just now",
    };
    const submission = new FormData();
    submission.set("title", upload.title);
    submission.set("artist", upload.artist);
    submission.set("genre", upload.genre);
    if (hasFile) submission.set("audio", file!);
    else submission.set("audio_url", audioUrl);
    const cover = fd.get("cover") as File | null;
    if (cover?.size) {
      if (cover.size > 5 * 1024 * 1024) {
        toast.error("Cover images must be 5 MB or smaller");
        return;
      }
      submission.set("cover", cover);
    }
    try {
      await submitTrack.mutateAsync(submission);
      setUploads(addUpload(upload));
      toast.success(`"${upload.title}" submitted for music approval`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Music submission failed");
      return;
    }
    form.reset();
    setGenre("");
    setFileName("");
    setTrackUrl("");
    setUploadOpen(false);
  }

  const chartTracks = TRACKS.filter((track) => Boolean(track.streamUrl));

  return (
    <>
      <PageHero
        eyebrow="Music"
        title="Stream the X'Touch catalogue"
        description="Albums, singles, music videos, lyrics, playlists and charts — built for listening, not scrolling."
        image={studioImg}
      />

      <Section className="pb-0">
        <ExpandedAudioPlayer />
      </Section>

      <Section>
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <div className="min-w-0">
            <SectionHeading eyebrow="Charts" title="Available songs" />
            {tracksLoading ? (
              <div className="flex items-center justify-center py-12 text-gold">
                <Loader className="mr-2 h-5 w-5 animate-spin" /> Loading music...
              </div>
            ) : chartTracks.length === 0 ? (
              <div className="rounded-3xl border border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
                No playable songs are available right now. Approved uploads will appear here as soon
                as their audio file is published.
              </div>
            ) : (
              <div className="glass overflow-hidden rounded-3xl">
                <ul className="divide-y divide-border">
                  {chartTracks.map((t, i) => (
                    <li
                      key={t.id}
                      className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2.5 px-3 py-3 sm:grid-cols-[auto_auto_minmax(0,1fr)_auto] sm:gap-4 sm:px-5 sm:py-4"
                    >
                      <span className="hidden w-5 shrink-0 text-sm font-black text-muted-foreground sm:block">
                        {i + 1}
                      </span>
                      <button
                        aria-label={`Play ${t.title}`}
                        onClick={() => {
                          if (player.track?.id === t.id) void player.toggle();
                          else
                            player.play(
                              {
                                id: t.id,
                                title: t.title,
                                artist: t.artist,
                                streamUrl: t.streamUrl,
                                downloadUrl: t.downloadUrl,
                                coverUrl: t.coverUrl,
                              },
                              playableQueue,
                            );
                        }}
                        title={`Play ${t.title}`}
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gradient-gold text-primary-foreground"
                      >
                        {player.track?.id === t.id && player.playing ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4 fill-current" />
                        )}
                      </button>
                      <span className="min-w-0">
                        <span className="block truncate font-semibold">{t.title}</span>
                        <span className="block truncate text-sm text-muted-foreground">
                          {t.artist} · {t.plays} plays · {likeCounts[t.id] ?? t.likesCount} likes
                        </span>
                      </span>
                      <span className="flex shrink-0 items-center gap-3 text-muted-foreground">
                        <button
                          type="button"
                          aria-label={liked.has(t.id) ? `Unlike ${t.title}` : `Like ${t.title}`}
                          onClick={() => void toggleLike(t)}
                        >
                          <Heart
                            className={`h-4 w-4 transition-colors ${
                              liked.has(t.id) ? "fill-gold text-gold" : "hover:text-gold"
                            }`}
                          />
                        </button>
                        {t.downloadUrl ? (
                          <a
                            href={t.downloadUrl}
                            download
                            aria-label={`Download ${t.title}`}
                            className="hidden sm:block"
                          >
                            <Download className="h-4 w-4 transition-colors hover:text-gold" />
                          </a>
                        ) : null}
                        <span className="hidden text-xs min-[420px]:inline">{t.length}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <SectionHeading eyebrow="Videos" title="Music videos" />
            {videosLoading ? (
              <div className="flex items-center justify-center py-10 text-gold">
                <Loader className="mr-2 h-5 w-5 animate-spin" /> Loading videos...
              </div>
            ) : MUSIC_VIDEOS.length ? (
              <div className="grid gap-5 sm:grid-cols-2">
                {MUSIC_VIDEOS.map((video) => (
                  <GlassCard key={video.id} className="overflow-hidden p-0">
                    <EmbeddedVideo
                      url={video.media_url}
                      title={video.title ?? video.text ?? "X'Touch music video"}
                      className="rounded-none"
                    />
                    <div className="p-5">
                      <h3 className="line-clamp-2 font-bold">
                        {video.title ?? "X'Touch music video"}
                      </h3>
                      <p className="mt-1 truncate text-sm text-muted-foreground">
                        {video.author} · Published video
                      </p>
                    </div>
                  </GlassCard>
                ))}
              </div>
            ) : (
              <GlassCard className="text-center">
                <p className="text-sm text-muted-foreground">
                  No music videos have been published yet.
                </p>
              </GlassCard>
            )}

            <SectionHeading eyebrow="Community" title="Upload your music" />
            <GlassCard className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
              <div>
                <h3 className="font-bold">Got a track? Get it on X&apos;Touch.</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload a single, demo or full project — our A&amp;R team reviews every submission.
                </p>
              </div>
              <Dialog
                open={uploadOpen}
                onOpenChange={(next) => {
                  if (next && !user) {
                    toast.error("Register or sign in before uploading music.");
                    return;
                  }
                  setUploadOpen(next);
                }}
              >
                <DialogTrigger asChild>
                  <Button className="shrink-0 rounded-full bg-gradient-gold font-semibold text-primary-foreground shadow-gold hover:opacity-90">
                    <UploadCloud className="mr-2 h-4 w-4" />{" "}
                    {user ? "Upload track" : "Sign in to upload"}
                  </Button>
                </DialogTrigger>
                <DialogContent className="border-border bg-background sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle>Upload your track</DialogTitle>
                  </DialogHeader>
                  <form className="grid gap-4" onSubmit={handleUpload}>
                    <div className="grid gap-2">
                      <Label htmlFor="title">Track title</Label>
                      <Input
                        id="title"
                        name="title"
                        required
                        maxLength={120}
                        className="rounded-xl border-border bg-background/60"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="artist">Artist name</Label>
                      <Input
                        id="artist"
                        name="artist"
                        required
                        maxLength={120}
                        className="rounded-xl border-border bg-background/60"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="genre">Genre</Label>
                      <Select value={genre} onValueChange={setGenre}>
                        <SelectTrigger
                          id="genre"
                          className="rounded-xl border-border bg-background/60"
                        >
                          <SelectValue placeholder="Choose a genre" />
                        </SelectTrigger>
                        <SelectContent>
                          {GENRES.map((g) => (
                            <SelectItem key={g} value={g}>
                              {g}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="audio">Upload audio file</Label>
                      <Input
                        ref={audioInputRef}
                        id="audio"
                        name="audio"
                        type="file"
                        disabled={Boolean(trackUrl)}
                        accept=".mp3,.wav,.m4a,.aac,.ogg,audio/*"
                        onChange={(e) => {
                          const nextFileName = e.target.files?.[0]?.name ?? "";
                          setFileName(nextFileName);
                          if (nextFileName) setTrackUrl("");
                        }}
                        className="rounded-xl border-border bg-background/60 file:mr-3 file:rounded-full file:border-0 file:bg-gold/15 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-gold"
                      />
                      {fileName ? (
                        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                          <p className="truncate">{fileName}</p>
                          <button
                            type="button"
                            onClick={() => {
                              setFileName("");
                              if (audioInputRef.current) audioInputRef.current.value = "";
                            }}
                            className="inline-flex shrink-0 items-center gap-1 font-semibold text-gold hover:underline"
                          >
                            <X className="h-3 w-3" /> Remove
                          </button>
                        </div>
                      ) : null}
                    </div>
                    <div className="flex items-center gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground before:h-px before:flex-1 before:bg-border after:h-px after:flex-1 after:bg-border">
                      or
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="audio-url">Embed audio URL</Label>
                      <Input
                        id="audio-url"
                        name="audio_url"
                        type="url"
                        value={trackUrl}
                        disabled={Boolean(fileName)}
                        onChange={(event) => setTrackUrl(event.target.value)}
                        placeholder="https://…/track.mp3"
                        className="rounded-xl border-border bg-background/60"
                      />
                      <p className="text-xs text-muted-foreground">
                        Choose one source only: an uploaded file or an audio URL.
                      </p>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="cover">Cover image (optional)</Label>
                      <Input
                        id="cover"
                        name="cover"
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="rounded-xl border-border bg-background/60 file:mr-3 file:rounded-full file:border-0 file:bg-gold/15 file:px-3 file:py-1 file:text-xs file:font-semibold file:text-gold"
                      />
                    </div>
                    <Button
                      disabled={submitTrack.isPending}
                      className="mt-2 rounded-full bg-gradient-gold font-semibold text-primary-foreground shadow-gold hover:opacity-90"
                    >
                      {submitTrack.isPending ? (
                        <Loader className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      {submitTrack.isPending ? "Uploading..." : "Submit for review"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </GlassCard>
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <FormsWidget />

            <GlassCard>
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs uppercase tracking-[0.3em] text-gold">Community uploads</p>
                <Button
                  asChild
                  variant="ghost"
                  size="icon"
                  aria-label="Open feed"
                  title="Open feed"
                  className="h-7 w-7 shrink-0 rounded-full text-muted-foreground hover:text-gold"
                >
                  <Link to="/news-feed">
                    <Rss className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
              {uploads.length ? (
                <ul className="mt-4 space-y-4">
                  {uploads.slice(0, 5).map((upload) => (
                    <li key={upload.id} className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
                        <Music2 className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{upload.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {upload.artist} · Pending review
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  Your pending music submissions will appear here.
                </p>
              )}
            </GlassCard>

            <AdPostCard />

            <GlassCard>
              <p className="text-xs uppercase tracking-[0.3em] text-gold">Playlists</p>
              {!user ? (
                <div className="mt-4">
                  <p className="text-sm text-muted-foreground">
                    Sign in to save tracks and manage your playlists.
                  </p>
                  <Button asChild size="sm" variant="outline" className="mt-3 rounded-full">
                    <Link to="/login">Sign in</Link>
                  </Button>
                </div>
              ) : userPlaylists.length ? (
                <ul className="mt-4 space-y-3 text-sm">
                  {userPlaylists.map((playlist) => (
                    <li key={playlist.id} className="flex items-center gap-2 text-muted-foreground">
                      <ListMusic className="h-4 w-4 shrink-0 text-gold" />
                      <span className="min-w-0 flex-1 truncate">{playlist.name}</span>
                      <span className="text-xs">{playlist.tracks.length}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">
                  No playlists yet. Use the playlist button on the player to create one.
                </p>
              )}
            </GlassCard>
            <GlassCard>
              <p className="text-xs uppercase tracking-[0.3em] text-gold">Genres</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <span
                    key={g}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    {g}
                  </span>
                ))}
              </div>
            </GlassCard>
          </aside>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Artists" title="On the label" />
        {artistsLoading ? (
          <div className="flex items-center justify-center py-8 text-gold">
            <Loader className="mr-2 h-5 w-5 animate-spin" /> Loading artists...
          </div>
        ) : ARTISTS.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
            No artists are available right now.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {ARTISTS.map((artist) => (
              <MusicArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

type MusicArtistData = {
  id: number;
  name: string;
  role: string;
  listeners: string;
  imageUrl: string;
};

function MusicArtistCard({ artist }: { artist: MusicArtistData }) {
  const { user } = useAuth();
  const toggleFollow = useToggleArtistFollow();
  const { data: followStatus } = useArtistFollowStatus(artist.id, Boolean(user));
  const following = toggleFollow.data?.following ?? followStatus?.following ?? false;

  async function follow() {
    if (!user) {
      toast.error("Sign in to follow artists");
      return;
    }
    try {
      const result = await toggleFollow.mutateAsync(artist.id);
      toast.success(result.following ? `Following ${artist.name}` : `Unfollowed ${artist.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update follow");
    }
  }

  return (
    <GlassCard className="overflow-hidden p-0">
      <Link to="/artists/$artistId" params={{ artistId: String(artist.id) }}>
        <img
          src={artist.imageUrl}
          alt={artist.name}
          loading="lazy"
          width={640}
          height={480}
          className="h-44 w-full object-cover"
        />
      </Link>
      <div className="p-5">
        <Link
          to="/artists/$artistId"
          params={{ artistId: String(artist.id) }}
          className="font-bold hover:text-gold"
        >
          {artist.name}
        </Link>
        <p className="text-sm text-muted-foreground">{artist.role}</p>
        <p className="mt-1 text-xs text-gold">{artist.listeners} monthly listeners</p>
        <Button
          type="button"
          onClick={() => void follow()}
          disabled={toggleFollow.isPending}
          variant={following ? "secondary" : "outline"}
          size="sm"
          aria-pressed={following}
          className="mt-4 rounded-full border-gold/40"
        >
          {following ? (
            <UserCheck className="mr-1.5 h-4 w-4" />
          ) : (
            <UserPlus className="mr-1.5 h-4 w-4" />
          )}
          {following ? "Following" : "Follow"}
        </Button>
      </div>
    </GlassCard>
  );
}
