import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  MapPin,
  CalendarDays,
  Music2,
  Ticket,
  Tag,
  UploadCloud,
  Download,
  Pencil,
  ShieldCheck,
  CircleUserRound,
  Bookmark,
  ListMusic,
  Pause,
  Play,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Section, GlassCard } from "@/components/site/Primitives";
import {
  getProfile,
  saveProfile,
  getUploads,
  getOrders,
  getListings,
  type Profile,
  type MusicUpload,
  type TicketOrder,
  type TicketListing,
} from "@/lib/local-store";
import {
  useBookmarks,
  usePlaylists,
  useSubmitVerificationRequest,
  useUpdateMyProfile,
  useUserProfile,
  type Playlist,
} from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth";
import { useAudioPlayer } from "@/components/music/GlobalAudioPlayer";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Profile — X'Touch Entertainment" },
      {
        name: "description",
        content: "Manage your X'Touch profile, uploads, ticket orders and resale listings.",
      },
    ],
  }),
  component: ProfilePage,
});

const profileSchema = z.object({
  name: z.string().trim().min(2, "Add your name").max(60),
  handle: z
    .string()
    .trim()
    .min(2, "Add a handle")
    .max(30)
    .regex(/^@?[a-zA-Z0-9_]+$/, "Letters, numbers and underscores only"),
  bio: z.string().trim().max(200).optional().default(""),
  location: z.string().trim().max(80).optional().default(""),
  accountRole: z.enum(["member", "approved_user", "artist", "podcaster", "event_organizer"]),
});

const ROLE_LABELS: Record<Profile["accountRole"], string> = {
  guest: "Guest",
  member: "Member",
  approved_user: "Approved creator",
  artist: "Artist",
  podcaster: "Podcaster",
  event_organizer: "Event organiser",
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p.charAt(0).toUpperCase())
    .join("");
}

function ProfilePage() {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [uploads, setUploads] = useState<MusicUpload[]>([]);
  const [orders, setOrders] = useState<TicketOrder[]>([]);
  const [listings, setListings] = useState<TicketListing[]>([]);
  const { data: bookmarksData } = useBookmarks(Boolean(user));
  const { data: publicProfile } = useUserProfile(user?.id);
  const { data: playlists = [] } = usePlaylists(Boolean(user));

  useEffect(() => {
    const saved = getProfile();
    setProfile(user ? { ...saved, name: user.name, approvalStatus: user.approval } : saved);
    setUploads(getUploads());
    setOrders(getOrders());
    setListings(getListings());
  }, [user]);

  useEffect(() => {
    if (!publicProfile || !user) return;
    const roleMap: Record<string, Profile["accountRole"]> = {
      Creator: "approved_user",
      Artist: "artist",
      Podcaster: "podcaster",
    };
    setProfile((current) => ({
      ...(current ?? getProfile()),
      name: publicProfile.name,
      handle: publicProfile.handle,
      bio: publicProfile.bio ?? "",
      location: publicProfile.location ?? "",
      joined: new Date(publicProfile.joined_at).getFullYear().toString(),
      accountRole: roleMap[publicProfile.role] ?? current?.accountRole ?? "member",
      approvalStatus: user.approval,
    }));
  }, [publicProfile, user]);

  if (!isLoading && !user) {
    return (
      <Section className="pt-10">
        <GlassCard className="mx-auto max-w-lg py-12 text-center">
          <CircleUserRound className="mx-auto h-12 w-12 text-gold" />
          <h1 className="mt-5 text-2xl font-black">Your profile starts with an account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Sign in or register to upload music, like posts and join conversations.
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/login">Sign in</Link>
            </Button>
            <Button asChild className="rounded-full bg-gradient-gold text-primary-foreground">
              <Link to="/register">Create account</Link>
            </Button>
          </div>
        </GlassCard>
      </Section>
    );
  }

  if (!profile) {
    return (
      <Section className="pt-10">
        <div className="glass h-64 animate-pulse rounded-3xl" />
      </Section>
    );
  }

  const stats = [
    { label: "Uploads", value: uploads.length, icon: Music2 },
    { label: "Tickets bought", value: orders.reduce((n, o) => n + o.quantity, 0), icon: Ticket },
    { label: "Listed for resale", value: listings.length, icon: Tag },
    { label: "Saved posts", value: bookmarksData?.data.length ?? 0, icon: Bookmark },
  ];

  return (
    <Section className="pt-10">
      <GlassCard className="grid gap-6 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:items-center">
        <Avatar className="h-20 w-20 shrink-0 sm:h-24 sm:w-24">
          <AvatarFallback className="bg-gradient-gold text-2xl font-black text-primary-foreground">
            {initials(profile.name) || "X"}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-black sm:text-3xl">{profile.name}</h1>
            <Badge variant="outline" className="rounded-full border-gold/40 text-xs text-gold">
              {profile.handle.startsWith("@") ? profile.handle : `@${profile.handle}`}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-border text-xs text-muted-foreground"
            >
              {ROLE_LABELS[profile.accountRole]}
            </Badge>
            {profile.approvalStatus === "approved" ? (
              <Badge className="rounded-full bg-gold/10 text-gold hover:bg-gold/10">
                <ShieldCheck className="mr-1 h-3.5 w-3.5" /> Approved
              </Badge>
            ) : null}
          </div>
          {profile.bio ? (
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">{profile.bio}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            {profile.location ? (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" /> {profile.location}
              </span>
            ) : null}
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" /> Member since {profile.joined}
            </span>
          </div>
        </div>
      </GlassCard>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <GlassCard key={s.label} className="flex items-center gap-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
              <s.icon className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-2xl font-black">{s.value}</span>
              <span className="block text-xs text-muted-foreground">{s.label}</span>
            </span>
          </GlassCard>
        ))}
      </div>

      <Tabs defaultValue="uploads" className="mt-8">
        <TabsList className="h-auto flex-wrap gap-1 bg-transparent p-0">
          <TabsTrigger
            value="uploads"
            className="rounded-full border border-border data-[state=active]:border-gold/50 data-[state=active]:bg-gold/10 data-[state=active]:text-gold"
          >
            Uploads
          </TabsTrigger>
          <TabsTrigger
            value="playlists"
            className="rounded-full border border-border data-[state=active]:border-gold/50 data-[state=active]:bg-gold/10 data-[state=active]:text-gold"
          >
            Playlists
          </TabsTrigger>
          <TabsTrigger
            value="tickets"
            className="rounded-full border border-border data-[state=active]:border-gold/50 data-[state=active]:bg-gold/10 data-[state=active]:text-gold"
          >
            Tickets
          </TabsTrigger>
          <TabsTrigger
            value="saved"
            className="rounded-full border border-border data-[state=active]:border-gold/50 data-[state=active]:bg-gold/10 data-[state=active]:text-gold"
          >
            Saved posts
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-full border border-border data-[state=active]:border-gold/50 data-[state=active]:bg-gold/10 data-[state=active]:text-gold"
          >
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="uploads" className="mt-5">
          {uploads.length === 0 ? (
            <EmptyState
              icon={UploadCloud}
              title="No uploads yet"
              description="Submit a track and it'll show up here."
              cta="Upload music"
              to="/music"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {uploads.map((u) => (
                <GlassCard key={u.id} className="flex items-center gap-3">
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
                    <Music2 className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-semibold">{u.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {u.artist} · {u.genre} · {u.uploadedAt}
                    </span>
                  </span>
                </GlassCard>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="playlists" className="mt-5">
          <PlaylistCollection playlists={playlists} />
        </TabsContent>

        <TabsContent value="saved" className="mt-5">
          {!bookmarksData?.data.length ? (
            <EmptyState
              icon={Bookmark}
              title="No saved posts"
              description="Use the bookmark button on a feed post to keep it here for later."
              cta="Browse the feed"
              to="/news-feed"
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {bookmarksData.data.map((bookmark) => (
                <a
                  key={bookmark.id}
                  href={`/news-feed#post-${bookmark.feed_post.id}`}
                  className="glass group rounded-2xl p-5 transition hover:border-gold/40"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
                      <Bookmark className="h-4 w-4" />
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold group-hover:text-gold">
                        {bookmark.feed_post.title || bookmark.feed_post.author || "Saved post"}
                      </span>
                      <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">
                        {bookmark.feed_post.text || "Open this saved post in the community feed."}
                      </span>
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="tickets" className="mt-5 space-y-8">
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">Purchased</p>
            {orders.length === 0 ? (
              <EmptyState
                icon={Ticket}
                title="No tickets yet"
                description="Grab a seat to an upcoming show."
                cta="Browse events"
                to="/events"
              />
            ) : (
              <div className="grid gap-3">
                {orders.map((o) => (
                  <GlassCard key={o.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{o.event}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {o.quantity} ticket{o.quantity > 1 ? "s" : ""} · {o.email}
                      </span>
                    </span>
                    <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
          <div>
            <p className="mb-3 text-xs uppercase tracking-[0.3em] text-gold">Listed for resale</p>
            {listings.length === 0 ? (
              <EmptyState
                icon={Tag}
                title="Nothing listed"
                description="Selling a ticket? List it from the events page."
                cta="Sell a ticket"
                to="/events"
              />
            ) : (
              <div className="grid gap-3">
                {listings.map((l) => (
                  <GlassCard key={l.id} className="flex items-center justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold">{l.event}</span>
                      <span className="block truncate text-xs text-muted-foreground">{l.seat}</span>
                    </span>
                    <span className="shrink-0 text-sm font-black text-gold">{l.price}</span>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-5">
          <SettingsForm profile={profile} onSaved={setProfile} />
        </TabsContent>
      </Tabs>
    </Section>
  );
}

function EmptyState({
  icon: Icon,
  title,
  description,
  cta,
  to,
}: {
  icon: typeof Ticket;
  title: string;
  description: string;
  cta: string;
  to: string;
}) {
  return (
    <GlassCard className="flex flex-col items-center gap-3 py-10 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-full bg-gold/10 text-gold">
        <Icon className="h-5 w-5" />
      </span>
      <p className="font-bold">{title}</p>
      <p className="max-w-xs text-sm text-muted-foreground">{description}</p>
      <Button
        asChild
        size="sm"
        className="mt-2 rounded-full bg-gradient-gold text-primary-foreground hover:opacity-90"
      >
        <Link to={to}>{cta}</Link>
      </Button>
    </GlassCard>
  );
}

function PlaylistCollection({ playlists }: { playlists: Playlist[] }) {
  const player = useAudioPlayer();

  if (!playlists.length) {
    return (
      <EmptyState
        icon={ListMusic}
        title="No playlists yet"
        description="Add music to a playlist from the music player and it will appear here."
        cta="Browse music"
        to="/music"
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {playlists.map((playlist) => (
        <GlassCard key={playlist.id} className="min-w-0">
          <div className="flex items-center gap-3 border-b border-border pb-4">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-gold/10 text-gold">
              <ListMusic className="h-5 w-5" />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-bold">{playlist.name}</span>
              <span className="text-xs text-muted-foreground">
                {playlist.tracks.length} {playlist.tracks.length === 1 ? "track" : "tracks"}
              </span>
            </span>
          </div>
          {playlist.tracks.length ? (
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
                      className="flex w-full items-center gap-3 rounded-xl px-2 py-2 text-left transition hover:bg-accent"
                    >
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
                        {active && player.playing ? (
                          <Pause className="h-3.5 w-3.5 fill-current" />
                        ) : (
                          <Play className="h-3.5 w-3.5 fill-current" />
                        )}
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold">{track.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {track.artist?.name ?? track.album ?? "Music"}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="pt-4 text-sm text-muted-foreground">This playlist is empty.</p>
          )}
        </GlassCard>
      ))}
    </div>
  );
}

function SettingsForm({ profile, onSaved }: { profile: Profile; onSaved: (p: Profile) => void }) {
  const verificationRequest = useSubmitVerificationRequest();
  const updateProfile = useUpdateMyProfile();
  const { refresh } = useAuth();

  async function handleSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = profileSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const next: Profile = {
      ...profile,
      name: parsed.data.name,
      handle: parsed.data.handle.startsWith("@") ? parsed.data.handle : `@${parsed.data.handle}`,
      bio: parsed.data.bio ?? "",
      location: parsed.data.location ?? "",
      accountRole: parsed.data.accountRole,
      approvalStatus:
        parsed.data.accountRole === profile.accountRole && profile.approvalStatus === "approved"
          ? "approved"
          : parsed.data.accountRole === "member"
            ? "unverified"
            : "pending",
    };
    try {
      const updated = await updateProfile.mutateAsync({
        name: next.name,
        handle: next.handle,
        bio: next.bio,
        location: next.location,
      });
      next.name = updated.name;
      next.handle = updated.handle;
      next.bio = updated.bio ?? "";
      next.location = updated.location ?? "";
      saveProfile(next);
      onSaved(next);
      await refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Profile changes could not be saved");
      return;
    }
    if (next.approvalStatus === "pending") {
      try {
        await verificationRequest.mutateAsync({
          type: next.accountRole as "approved_user" | "artist" | "podcaster" | "event_organizer",
          note: `${next.name} (${next.handle}) — ${next.bio}`,
        });
        toast.success("Profile updated and approval request sent to the X'Touch team");
      } catch {
        toast.warning(
          "Profile saved. Sign in to your registered account, then save again to send the approval request.",
        );
      }
    } else {
      toast.success("Profile updated");
    }
  }

  return (
    <GlassCard className="max-w-lg">
      <div className="mb-5 flex items-center gap-2 text-sm font-semibold text-gold">
        <Pencil className="h-4 w-4" /> Edit profile
      </div>
      <form className="grid gap-4" onSubmit={handleSave}>
        <div className="grid gap-2">
          <Label htmlFor="name">Display name</Label>
          <Input
            id="name"
            name="name"
            defaultValue={profile.name}
            maxLength={60}
            className="rounded-xl border-border bg-background/60"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="handle">Handle</Label>
          <Input
            id="handle"
            name="handle"
            defaultValue={profile.handle}
            maxLength={30}
            className="rounded-xl border-border bg-background/60"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="location">Location</Label>
          <Input
            id="location"
            name="location"
            defaultValue={profile.location}
            maxLength={80}
            className="rounded-xl border-border bg-background/60"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            name="bio"
            defaultValue={profile.bio}
            rows={4}
            maxLength={200}
            className="rounded-xl border-border bg-background/60"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="account-role">Account type</Label>
          <Select
            name="accountRole"
            defaultValue={profile.accountRole === "guest" ? "member" : profile.accountRole}
          >
            <SelectTrigger
              id="account-role"
              className="h-11 rounded-xl border-border bg-background/60"
            >
              <SelectValue placeholder="Choose an account type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="member">Member</SelectItem>
              <SelectItem value="approved_user">Creator / approved user</SelectItem>
              <SelectItem value="artist">Artist</SelectItem>
              <SelectItem value="podcaster">Podcaster</SelectItem>
              <SelectItem value="event_organizer">Event organiser</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Creator, artist and organiser roles require approval before they can publish to the
            feed. Current status: {profile.approvalStatus}.
          </p>
        </div>
        <Button
          disabled={updateProfile.isPending || verificationRequest.isPending}
          className="mt-2 rounded-full bg-gradient-gold font-semibold text-primary-foreground shadow-gold hover:opacity-90"
        >
          {updateProfile.isPending ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </GlassCard>
  );
}
