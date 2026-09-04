import { createFileRoute, Link } from "@tanstack/react-router";
import { CalendarDays, Eye, MapPin, Music2, Pause, Play, UserCheck, UserPlus } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmbeddedVideo } from "@/components/site/EmbeddedVideo";
import { GlassCard, Section } from "@/components/site/Primitives";
import { useAudioPlayer } from "@/components/music/GlobalAudioPlayer";
import {
  useToggleUserFollow,
  useRecordUserProfileView,
  useUserFollowStatus,
  useUserProfile,
  type FeedPost,
  type Playlist,
} from "@/lib/api/hooks";
import { mediaUrl } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/users/$userId")({
  component: PublicUserProfilePage,
});

function PublicUserProfilePage() {
  const { userId } = Route.useParams();
  const id = Number(userId);
  const { user } = useAuth();
  const { data: profile, isLoading, isError } = useUserProfile(Number.isFinite(id) ? id : null);
  const canFollow = Boolean(profile?.is_followable && user && user.id !== id);
  const { data: followStatus } = useUserFollowStatus(id, canFollow);
  const toggleFollow = useToggleUserFollow();
  const recordProfileView = useRecordUserProfileView();
  const following = toggleFollow.data?.following ?? followStatus?.following ?? false;
  const followers =
    toggleFollow.data?.followers_count ??
    followStatus?.followers_count ??
    profile?.followers_count ??
    0;

  useEffect(() => {
    if (!profile || profile.id === user?.id) return;
    recordProfileView.mutate(profile.id);
    // The API deduplicates repeated renders within the same browser session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id, user?.id]);

  if (isLoading) {
    return (
      <Section className="pt-10">
        <div className="glass h-72 animate-pulse rounded-3xl" />
      </Section>
    );
  }

  if (isError || !profile) {
    return (
      <Section className="pt-10">
        <GlassCard className="mx-auto max-w-xl py-14 text-center">
          <h1 className="text-2xl font-black">Profile unavailable</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            This member profile could not be loaded.
          </p>
          <Button asChild variant="outline" className="mt-5 rounded-full">
            <Link to="/news-feed">Return to the feed</Link>
          </Button>
        </GlassCard>
      </Section>
    );
  }

  const initials = profile.name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <Section className="pt-8 sm:pt-10">
      <GlassCard className="grid gap-5 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
        <Avatar className="h-24 w-24">
          {profile.profile_photo_url ? (
            <AvatarImage src={profile.profile_photo_url} alt={profile.name} />
          ) : null}
          <AvatarFallback className="bg-gradient-gold text-2xl font-black text-primary-foreground">
            {initials || "X"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black sm:text-3xl">{profile.name}</h1>
            <Badge variant="outline" className="rounded-full border-gold/40 text-gold">
              {profile.role}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-gold">{profile.handle}</p>
          {profile.bio ? (
            <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{profile.bio}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            {profile.location ? (
              <span className="inline-flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {profile.location}
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> Joined{" "}
              {new Date(profile.joined_at).getFullYear()}
            </span>
            <span>
              {followers} {followers === 1 ? "follower" : "followers"}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-3.5 w-3.5" />
              {recordProfileView.data?.views ?? profile.profile_views} profile views
            </span>
          </div>
        </div>
        {profile.is_followable && user?.id !== profile.id ? (
          <Button
            type="button"
            variant={following ? "secondary" : "default"}
            disabled={toggleFollow.isPending}
            onClick={() => {
              if (!user) {
                toast.error("Sign in to follow this profile");
                return;
              }
              void toggleFollow
                .mutateAsync(profile.id)
                .then((result) =>
                  toast.success(
                    result.following ? `Following ${profile.name}` : `Unfollowed ${profile.name}`,
                  ),
                )
                .catch((error) =>
                  toast.error(
                    error instanceof Error ? error.message : "Follow could not be updated",
                  ),
                );
            }}
            className="rounded-full"
          >
            {following ? (
              <UserCheck className="mr-2 h-4 w-4" />
            ) : (
              <UserPlus className="mr-2 h-4 w-4" />
            )}
            {following ? "Following" : "Follow"}
          </Button>
        ) : null}
      </GlassCard>

      <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,0.8fr)]">
        <section>
          <div className="mb-4 flex items-end justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-gold">Personal timeline</p>
              <h2 className="mt-1 text-2xl font-black">Posts</h2>
            </div>
            <span className="text-sm text-muted-foreground">{profile.posts_count}</span>
          </div>
          {profile.posts.length ? (
            <div className="grid gap-5">
              {profile.posts.map((post) => (
                <ProfilePost key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <GlassCard className="py-10 text-center text-sm text-muted-foreground">
              No approved posts yet.
            </GlassCard>
          )}
        </section>

        <section>
          <p className="text-xs uppercase tracking-[0.25em] text-gold">Music library</p>
          <h2 className="mt-1 text-2xl font-black">Playlists</h2>
          <div className="mt-4 grid gap-4">
            {profile.playlists.length ? (
              profile.playlists.map((playlist) => (
                <PublicPlaylist key={playlist.id} playlist={playlist} />
              ))
            ) : (
              <GlassCard className="py-8 text-center text-sm text-muted-foreground">
                No public playlists yet.
              </GlassCard>
            )}
          </div>
        </section>
      </div>
    </Section>
  );
}

function ProfilePost({ post }: { post: FeedPost }) {
  const player = useAudioPlayer();
  const image = mediaUrl(post.image_url);
  const video = mediaUrl(post.media_url);
  const isPlaying = post.track_id && player.track?.id === post.track_id && player.playing;

  return (
    <GlassCard className="overflow-hidden p-0">
      <div className="p-5">
        <div className="flex items-center justify-between gap-3 text-xs text-muted-foreground">
          <Badge variant="outline" className="rounded-full border-border">
            {post.category}
          </Badge>
          <Link to="/news-feed" hash={`post-${post.id}`} className="hover:text-gold">
            Open in feed
          </Link>
        </div>
        {post.title ? <h3 className="mt-4 text-xl font-black">{post.title}</h3> : null}
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed">{post.text}</p>
      </div>
      {image ? (
        <img
          src={image}
          alt={post.title ?? post.text.slice(0, 60)}
          className="max-h-[520px] w-full object-cover"
        />
      ) : null}
      {["video", "tv"].includes(post.kind) && video ? (
        <div className="bg-black p-2">
          <EmbeddedVideo url={video} title={post.title ?? "Video post"} />
        </div>
      ) : null}
      {post.kind === "music" && video ? (
        <button
          type="button"
          onClick={() =>
            isPlaying
              ? void player.toggle()
              : player.play({
                  id: post.track_id ?? -Number(post.id),
                  title: post.title ?? "Music post",
                  artist: post.author,
                  streamUrl: post.track_id
                    ? mediaUrl(`/api/tracks/${post.track_id}/stream`)!
                    : video,
                  coverUrl: image ?? undefined,
                })
          }
          className="m-5 flex items-center gap-3 rounded-full bg-gold/10 px-4 py-2 text-sm font-semibold text-gold"
        >
          {isPlaying ? (
            <Pause className="h-4 w-4 fill-current" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
          {isPlaying ? "Pause" : "Play track"}
        </button>
      ) : null}
    </GlassCard>
  );
}

function PublicPlaylist({ playlist }: { playlist: Playlist }) {
  const player = useAudioPlayer();
  return (
    <GlassCard>
      <div className="flex items-center gap-2">
        <Music2 className="h-4 w-4 text-gold" />
        <h3 className="truncate font-bold">{playlist.name}</h3>
      </div>
      <ul className="mt-3 space-y-1">
        {playlist.tracks.map((track) => {
          const active = player.track?.id === track.id;
          return (
            <li key={track.id}>
              <button
                type="button"
                disabled={!track.stream_url}
                onClick={() => {
                  if (!track.stream_url) return;
                  if (active) void player.toggle();
                  else
                    player.play({
                      id: track.id,
                      title: track.title,
                      artist: track.artist?.name ?? "X'Touch artist",
                      streamUrl: track.stream_url,
                      downloadUrl: track.download_url ?? undefined,
                      coverUrl: track.cover_url ?? undefined,
                    });
                }}
                className="flex w-full items-center gap-2 rounded-xl p-2 text-left hover:bg-accent"
              >
                {active && player.playing ? (
                  <Pause className="h-4 w-4 text-gold" />
                ) : (
                  <Play className="h-4 w-4 text-gold" />
                )}
                <span className="min-w-0 truncate text-sm">{track.title}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {!playlist.tracks.length ? (
        <p className="mt-3 text-xs text-muted-foreground">Empty playlist</p>
      ) : null}
    </GlassCard>
  );
}
