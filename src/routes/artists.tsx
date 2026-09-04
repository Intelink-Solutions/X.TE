import { createFileRoute, Link } from "@tanstack/react-router";
import { Loader, UserCheck, UserPlus } from "lucide-react";
import { toast } from "sonner";
import studioImg from "@/assets/studio.jpg";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading, PageHero, GlassCard } from "@/components/site/Primitives";
import { useArtistFollowStatus, useArtists, useToggleArtistFollow } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth";
import { mediaUrl } from "@/lib/api/client";

export const Route = createFileRoute("/artists")({
  head: () => ({
    meta: [
      { title: "Artists — The X'Touch Roster" },
      {
        name: "description",
        content:
          "Meet the artists signed to X'Touch: vocalists, producers, live bands and genre pioneers.",
      },
      { property: "og:title", content: "X'Touch Artists" },
      { property: "og:description", content: "The roster behind the X'Touch sound." },
    ],
  }),
  component: ArtistsPage,
});

function ArtistsPage() {
  const { data: raw, isLoading } = useArtists();
  const artists = (raw ?? []).map((a) => ({
    id: a.id ?? 0,
    name: a.name,
    role: a.role ?? "Artist",
    listeners: a.monthly_listeners ?? "0",
    image_url: mediaUrl(a.image_url) ?? studioImg,
  }));

  return (
    <>
      <PageHero
        eyebrow="Artists"
        title="The roster"
        description="The voices, producers and bands shaping the X'Touch sound — available for shows, features and bookings."
        image={studioImg}
      />
      <Section>
        <SectionHeading eyebrow="Signed" title="Our artists" />
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gold">
            <Loader className="mr-2 h-5 w-5 animate-spin" /> Loading artists...
          </div>
        ) : artists.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
            No artists are available right now.
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {artists.map((artist) => (
              <ArtistCard key={artist.id || artist.name} artist={artist} />
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

type ArtistCardData = {
  id: number;
  name: string;
  role: string;
  listeners: string;
  image_url: string;
};

function ArtistCard({ artist }: { artist: ArtistCardData }) {
  const { user } = useAuth();
  const toggleFollow = useToggleArtistFollow();
  const { data: followStatus } = useArtistFollowStatus(artist.id, Boolean(user));

  async function handleFollow() {
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

  const following = toggleFollow.data?.following ?? followStatus?.following ?? false;
  const followersCount = toggleFollow.data?.followers_count ?? followStatus?.followers_count ?? 0;

  return (
    <GlassCard className="overflow-hidden p-0">
      <Link to="/artists/$artistId" params={{ artistId: String(artist.id) }}>
        <img
          src={artist.image_url}
          alt={artist.name}
          loading="lazy"
          width={1024}
          height={768}
          className="h-52 w-full object-cover"
        />
      </Link>
      <div className="p-5">
        <h3 className="text-lg font-bold hover:text-gold">
          <Link to="/artists/$artistId" params={{ artistId: String(artist.id) }}>
            {artist.name}
          </Link>
        </h3>
        <p className="text-sm text-muted-foreground">{artist.role}</p>
        <p className="mt-2 text-xs uppercase tracking-widest text-gold">
          {artist.listeners} monthly listeners
        </p>
        {followersCount > 0 ? (
          <p className="mt-1 text-xs text-muted-foreground">
            {followersCount} {followersCount === 1 ? "follower" : "followers"}
          </p>
        ) : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            size="sm"
            variant={following ? "secondary" : "outline"}
            disabled={toggleFollow.isPending}
            onClick={() => void handleFollow()}
            aria-pressed={following}
            className="rounded-full border-gold/40"
          >
            {following ? (
              <UserCheck className="mr-1.5 h-4 w-4" />
            ) : (
              <UserPlus className="mr-1.5 h-4 w-4" />
            )}
            {following ? "Following" : "Follow"}
          </Button>
          <Button
            asChild
            size="sm"
            className="rounded-full bg-gradient-gold text-primary-foreground hover:opacity-90"
          >
            <Link to="/bookings">Book artist</Link>
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
