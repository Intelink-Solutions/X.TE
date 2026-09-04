import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Loader, Pause, Play, UserCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import studioImg from "@/assets/studio.jpg";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section, GlassCard } from "@/components/site/Primitives";
import { useArtist, useArtistFollowStatus, useToggleArtistFollow } from "@/lib/api/hooks";
import { mediaUrl } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { useAudioPlayer } from "@/components/music/GlobalAudioPlayer";

export const Route = createFileRoute("/artists/$artistId")({ component: ArtistProfilePage });

function ArtistProfilePage() {
  const { artistId } = Route.useParams();
  const id = Number(artistId);
  const { data: artist, isLoading, isError } = useArtist(id);
  const { user } = useAuth();
  const player = useAudioPlayer();
  const follow = useToggleArtistFollow();
  const { data: followStatus } = useArtistFollowStatus(id, Boolean(user));
  const following = follow.data?.following ?? followStatus?.following ?? false;
  const followers =
    follow.data?.followers_count ?? followStatus?.followers_count ?? artist?.followers_count ?? 0;

  async function toggleFollow() {
    if (!user) return toast.error("Sign in to follow artists");
    try {
      const result = await follow.mutateAsync(id);
      toast.success(result.following ? `Following ${artist?.name}` : `Unfollowed ${artist?.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update follow");
    }
  }

  if (isLoading)
    return (
      <Section className="py-20 text-center text-gold">
        <Loader className="mr-2 inline h-5 w-5 animate-spin" />
        Loading artist…
      </Section>
    );
  if (isError || !artist)
    return (
      <Section className="py-20 text-center">
        <h1 className="text-3xl font-black">Artist not found</h1>
        <Button asChild variant="link">
          <Link to="/artists">Back to artists</Link>
        </Button>
      </Section>
    );

  return (
    <Section className="pt-8 sm:pt-12">
      <Button asChild variant="ghost" className="rounded-full">
        <Link to="/artists">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Artists
        </Link>
      </Button>
      <div className="mt-6 grid gap-7 lg:grid-cols-[320px_minmax(0,1fr)]">
        <GlassCard className="h-fit overflow-hidden p-0 lg:sticky lg:top-24">
          <img
            src={mediaUrl(artist.image_url) ?? studioImg}
            alt={artist.name}
            className="aspect-square w-full object-cover"
          />
          <div className="p-6">
            <Badge variant="outline" className="rounded-full border-gold/40 text-gold">
              Verified {artist.role || "Artist"}
            </Badge>
            <h1 className="mt-3 text-3xl font-black">{artist.name}</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {artist.bio ?? "Discover music and updates from this X'Touch artist."}
            </p>
            <p className="mt-4 text-xs uppercase tracking-widest text-gold">
              {followers} followers · {artist.monthly_listeners ?? "0"} listeners
            </p>
            <Button
              type="button"
              disabled={follow.isPending}
              onClick={() => void toggleFollow()}
              className="mt-5 w-full rounded-full bg-gradient-gold text-primary-foreground"
            >
              {following ? (
                <UserCheck className="mr-2 h-4 w-4" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              {following ? "Following" : "Follow artist"}
            </Button>
          </div>
        </GlassCard>
        <div>
          <h2 className="text-2xl font-black">Music by {artist.name}</h2>
          {!artist.tracks.length ? (
            <p className="mt-5 rounded-3xl border border-border p-8 text-sm text-muted-foreground">
              No approved music has been published yet.
            </p>
          ) : (
            <div className="mt-5 overflow-hidden rounded-3xl border border-border">
              {artist.tracks.map((track) => {
                const streamUrl = mediaUrl(track.stream_url);
                const active = player.track?.id === track.id;
                return (
                  <div
                    key={track.id}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 border-b border-border p-4 last:border-0"
                  >
                    <button
                      type="button"
                      disabled={!streamUrl}
                      onClick={() =>
                        active
                          ? void player.toggle()
                          : player.play({
                              id: track.id,
                              title: track.title,
                              artist: artist.name,
                              streamUrl: streamUrl!,
                              downloadUrl: mediaUrl(track.download_url) ?? undefined,
                              coverUrl: mediaUrl(track.cover_url),
                            })
                      }
                      className="grid h-11 w-11 place-items-center rounded-full bg-gradient-gold text-primary-foreground disabled:opacity-40"
                    >
                      {active && player.playing ? (
                        <Pause className="h-4 w-4 fill-current" />
                      ) : (
                        <Play className="h-4 w-4 fill-current" />
                      )}
                    </button>
                    <span className="min-w-0">
                      <span className="block truncate font-bold">{track.title}</span>
                      <span className="block truncate text-sm text-muted-foreground">
                        {track.album ?? "Single"} · {track.plays ?? 0} plays
                      </span>
                    </span>
                    <span className="text-xs text-muted-foreground">{track.duration}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </Section>
  );
}
