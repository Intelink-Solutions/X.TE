import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import {
  CheckCircle2,
  Crown,
  Facebook,
  Globe,
  Loader,
  MessageCircle,
  Play,
  Send,
  Ticket,
  Tv,
  Youtube,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import heroImg from "@/assets/hero.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Section, SectionHeading, GlassCard } from "@/components/site/Primitives";
import { EmbeddedVideo } from "@/components/site/EmbeddedVideo";
import {
  type TvSchedule,
  useLiveChatMessages,
  useSendLiveChatMessage,
  useSubmitBooking,
  useTvSchedules,
} from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/live")({
  head: () => ({
    meta: [
      { title: "Live Streaming — Watch X'Touch Live" },
      {
        name: "description",
        content:
          "Watch X'Touch live streams with multi-camera broadcast, live chat, viewer counter, premium streams and pay-per-view.",
      },
      { property: "og:title", content: "X'Touch Live Streaming" },
      {
        property: "og:description",
        content: "Multi-camera live broadcast with chat and pay-per-view.",
      },
    ],
  }),
  component: LivePage,
});

const STREAMING_SERVICES = [
  {
    key: "app",
    icon: Tv,
    title: "X'Touch TV App",
    description: "Mobile and smart TV apps are being prepared for release.",
  },
  {
    key: "website",
    icon: Globe,
    title: "Website player",
    description: "Stream instantly in your browser — no sign-up required.",
  },
  {
    key: "youtube",
    icon: Youtube,
    title: "YouTube simulcast",
    description: "Available here when the active programme uses a YouTube live source.",
  },
  {
    key: "social",
    icon: Facebook,
    title: "Facebook & social",
    description: "Available here when the live source is Facebook, Instagram or TikTok.",
  },
];

const accessRequestSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z
    .string()
    .trim()
    .max(30)
    .refine((value) => !value || /^[+0-9()\-\s]+$/.test(value), "Enter a valid phone number"),
});

function minutesSinceMidnight(time: string) {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function useCurrentScheduleIndex(schedule: { time: string }[]) {
  const [index, setIndex] = useState<number | null>(null);

  useEffect(() => {
    function update() {
      if (!schedule.length) {
        setIndex(null);
        return;
      }
      const now = new Date();
      const nowMinutes = now.getHours() * 60 + now.getMinutes();
      let current = schedule.length - 1;
      for (let i = 0; i < schedule.length; i++) {
        if (minutesSinceMidnight(schedule[i].time) <= nowMinutes) current = i;
      }
      setIndex(current);
    }

    update();
    const timer = window.setInterval(update, 60_000);
    return () => window.clearInterval(timer);
  }, [schedule]);

  return index;
}

function localDate() {
  const now = new Date();
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
}

function AccessRequestDialog({
  type,
  programme,
}: {
  type: "premium" | "pay_per_view";
  programme?: TvSchedule;
}) {
  const { user } = useAuth();
  const submitBooking = useSubmitBooking();
  const [open, setOpen] = useState(false);
  const [reference, setReference] = useState<string | null>(null);
  const premium = type === "premium";
  const label = premium ? "Unlock premium stream" : "Buy pay-per-view";

  async function submitRequest(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const parsed = accessRequestSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }

    try {
      const result = await submitBooking.mutateAsync({
        service_type: premium ? "Live Premium Stream" : "Live Pay-Per-View",
        client_name: parsed.data.name,
        client_email: parsed.data.email,
        client_phone: parsed.data.phone || undefined,
        preferred_date: localDate(),
        preferred_time: programme?.time?.match(/^\d{2}:\d{2}$/)?.[0],
        contact_method: "email",
        project_details: `${label} access request for ${programme?.show_name ?? "X'Touch Live"}. Programme ID: ${programme?.id ?? "not scheduled"}.`,
      });
      setReference(result.reference);
      toast.success("Your live access request has been sent");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The access request could not be sent");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        setOpen(nextOpen);
        if (!nextOpen) {
          setReference(null);
          submitBooking.reset();
        }
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant={premium ? "default" : "outline"}
          className={
            premium
              ? "rounded-full bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90"
              : "rounded-full border-border"
          }
        >
          {premium ? <Crown className="mr-2 h-4 w-4" /> : <Ticket className="mr-2 h-4 w-4" />}
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{label}</DialogTitle>
        </DialogHeader>
        {reference ? (
          <div className="py-3 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-gold" />
            <h3 className="mt-4 text-lg font-bold">Request received</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Your reference is <strong className="text-foreground">{reference}</strong>. Payment
              and access instructions will be sent to your email.
            </p>
            <Button
              type="button"
              className="mt-5 rounded-full bg-gradient-gold text-primary-foreground"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        ) : (
          <form key={user?.id ?? "guest"} className="grid gap-4" onSubmit={submitRequest}>
            <div className="rounded-xl border border-gold/20 bg-gold/5 p-3 text-sm">
              <strong>{programme?.show_name ?? "X'Touch Live"}</strong>
              <p className="mt-1 text-xs text-muted-foreground">
                No charge is made on this form. The X&apos;Touch team will email the confirmed
                price, payment instructions and secure viewing access.
              </p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${type}-name`}>Full name</Label>
              <Input
                id={`${type}-name`}
                name="name"
                defaultValue={user?.name ?? ""}
                required
                maxLength={100}
                autoComplete="name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${type}-email`}>Email</Label>
              <Input
                id={`${type}-email`}
                name="email"
                type="email"
                defaultValue={user?.email ?? ""}
                required
                maxLength={255}
                autoComplete="email"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor={`${type}-phone`}>Phone number (optional)</Label>
              <Input
                id={`${type}-phone`}
                name="phone"
                type="tel"
                maxLength={30}
                autoComplete="tel"
              />
            </div>
            <Button
              type="submit"
              disabled={submitBooking.isPending}
              className="rounded-full bg-gradient-gold text-primary-foreground shadow-gold"
            >
              {submitBooking.isPending ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : premium ? (
                <Crown className="mr-2 h-4 w-4" />
              ) : (
                <Ticket className="mr-2 h-4 w-4" />
              )}
              {submitBooking.isPending ? "Sending request..." : "Request access"}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

function LivePage() {
  const { user } = useAuth();
  const [draft, setDraft] = useState("");
  const [showOffline, setShowOffline] = useState(false);
  const chatEndRef = useRef<HTMLLIElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const { data: raw, isLoading } = useTvSchedules();
  const schedule = raw ?? [];
  const onAirIndex = useCurrentScheduleIndex(schedule);
  const streamingProgramme = schedule.find((item) => item.is_live && item.stream_url);
  const timedProgramme = onAirIndex === null ? undefined : schedule[onAirIndex];
  const currentProgramme =
    streamingProgramme ?? timedProgramme ?? schedule.find((item) => item.is_live);
  const programmeTitle = currentProgramme?.show_name ?? "X'Touch Live";
  const programmeDescription =
    currentProgramme?.description?.trim() ||
    (currentProgramme
      ? `${currentProgramme.show_name} · ${currentProgramme.tag || "X'Touch TV"} programme scheduled for ${currentProgramme.time}.`
      : "The live schedule is being prepared. Please check again shortly.");
  const {
    data: messages = [],
    isLoading: chatLoading,
    isError: chatError,
    refetch: refetchChat,
  } = useLiveChatMessages(currentProgramme?.id);
  const sendMessage = useSendLiveChatMessage();
  const socialProvider = ["facebook", "instagram", "tiktok"].includes(
    streamingProgramme?.stream_provider ?? "",
  );

  function focusPlayer() {
    playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (!streamingProgramme) setShowOffline(true);
  }

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages.length]);

  async function submitChat(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = draft.trim();
    if (!user) {
      toast.error("Sign in to join the live chat");
      return;
    }
    if (!body) return;

    try {
      await sendMessage.mutateAsync({
        ...(currentProgramme ? { tv_schedule_id: currentProgramme.id } : {}),
        body,
      });
      setDraft("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Your message could not be sent");
    }
  }

  return (
    <Section className="pt-10">
      <div className="grid gap-6 lg:grid-cols-[1.7fr_1fr]">
        <div ref={playerRef} className="scroll-mt-24">
          {streamingProgramme ? (
            <div className="glass overflow-hidden rounded-3xl p-2">
              <EmbeddedVideo
                url={streamingProgramme.stream_url}
                title={streamingProgramme.show_name}
                autoPlay
              />
              <div className="flex flex-wrap items-center gap-3 px-3 py-3">
                <Badge className="rounded-full bg-destructive/90 text-destructive-foreground">
                  LIVE
                </Badge>
                <span className="text-xs text-muted-foreground">Streaming on X&apos;Touch</span>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setShowOffline(true)}
              className="glass relative block w-full overflow-hidden rounded-3xl text-left"
            >
              <img
                src={heroImg}
                alt="X'Touch live channel"
                width={1920}
                height={1088}
                className="h-[300px] w-full object-cover sm:h-[460px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/95 to-background/20" />
              <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-gold text-primary-foreground shadow-gold">
                <Play className="h-6 w-6 fill-current" />
              </span>
              {showOffline ? (
                <span className="absolute inset-x-4 bottom-7 text-center text-lg font-black">
                  We are not live at the moment.
                </span>
              ) : null}
            </button>
          )}
          <h1 className="mt-6 text-3xl font-black sm:text-4xl">{programmeTitle}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{programmeDescription}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <AccessRequestDialog type="premium" programme={currentProgramme} />
            <AccessRequestDialog type="pay_per_view" programme={currentProgramme} />
          </div>
        </div>

        <GlassCard className="flex min-h-[420px] max-h-[560px] flex-col p-0">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <span className="text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              Live chat
            </span>
            <span className="flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-muted-foreground">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" /> Chat online
            </span>
          </div>
          <ul className="flex-1 space-y-3 overflow-y-auto p-5" aria-live="polite">
            {chatLoading ? (
              <li className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader className="h-4 w-4 animate-spin text-gold" /> Loading chat...
              </li>
            ) : chatError ? (
              <li className="py-8 text-center text-sm text-muted-foreground">
                Chat could not be loaded.
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="ml-1 rounded-full text-gold"
                  onClick={() => void refetchChat()}
                >
                  Retry
                </Button>
              </li>
            ) : messages.length ? (
              messages.map((message) => (
                <li key={message.id} className="text-sm">
                  <span className="font-semibold text-gold">{message.user.name}</span>{" "}
                  <span className="break-words text-muted-foreground">{message.body}</span>
                </li>
              ))
            ) : (
              <li className="py-10 text-center text-sm text-muted-foreground">
                <MessageCircle className="mx-auto mb-2 h-6 w-6 text-gold" />
                Be the first to join the conversation.
              </li>
            )}
            <li ref={chatEndRef} aria-hidden="true" />
          </ul>
          {user ? (
            <form className="flex gap-2 border-t border-border p-4" onSubmit={submitChat}>
              <Input
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Say something..."
                aria-label="Chat message"
                maxLength={500}
                disabled={sendMessage.isPending}
                className="h-10 rounded-full border-border bg-background/60"
              />
              <Button
                size="icon"
                aria-label="Send"
                disabled={!draft.trim() || sendMessage.isPending}
                className="h-10 w-10 shrink-0 rounded-full bg-gradient-gold text-primary-foreground"
              >
                {sendMessage.isPending ? (
                  <Loader className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </form>
          ) : (
            <div className="border-t border-border p-4 text-center text-sm text-muted-foreground">
              <Button
                asChild
                size="sm"
                className="rounded-full bg-gradient-gold text-primary-foreground"
              >
                <Link to="/login">Sign in to join the chat</Link>
              </Button>
            </div>
          )}
        </GlassCard>
      </div>

      <div className="mt-14">
        <SectionHeading eyebrow="Where to watch" title="Streaming services" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STREAMING_SERVICES.map((service) => {
            const Icon = service.icon;
            const available =
              service.key === "website" ||
              (service.key === "youtube" && streamingProgramme?.stream_provider === "youtube") ||
              (service.key === "social" && socialProvider);
            const liveNow = available && Boolean(streamingProgramme);
            const status = service.key === "app" ? "Coming soon" : liveNow ? "Live now" : "Offline";

            return (
              <GlassCard key={service.key} className="flex h-full flex-col">
                <div className="flex items-start justify-between gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-gold/10 text-gold">
                    <Icon className="h-5 w-5" />
                  </span>
                  <Badge
                    variant="outline"
                    className={
                      liveNow
                        ? "rounded-full border-destructive/40 text-destructive"
                        : "rounded-full border-border text-muted-foreground"
                    }
                  >
                    {status}
                  </Badge>
                </div>
                <h3 className="mt-4 font-bold">{service.title}</h3>
                <p className="mt-2 flex-1 text-sm text-muted-foreground">{service.description}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={service.key === "app" || (service.key !== "website" && !available)}
                  className="mt-4 w-fit rounded-full border-border"
                  onClick={focusPlayer}
                >
                  {liveNow ? "Watch here" : service.key === "website" ? "Open player" : status}
                </Button>
              </GlassCard>
            );
          })}
        </div>
      </div>

      <div className="mt-14">
        <SectionHeading eyebrow="Programme" title="Ongoing & upcoming live shows" />
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-gold">
            <Loader className="mr-2 h-5 w-5 animate-spin" /> Loading live schedule...
          </div>
        ) : schedule.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
            No live schedule is available right now.
          </div>
        ) : (
          <div className="glass overflow-hidden rounded-3xl">
            <ul className="divide-y divide-border">
              {schedule.map((show, index) => {
                const isOnAir = show.id === currentProgramme?.id;
                const isPast = onAirIndex !== null && index < onAirIndex && !isOnAir;
                return (
                  <li
                    key={show.id}
                    className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-4 sm:gap-4 sm:px-5"
                  >
                    <span className="w-12 shrink-0 text-sm font-black text-muted-foreground sm:w-14">
                      {show.time}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate font-semibold">{show.show_name}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {show.tag ?? (show.is_live ? "Live" : "Replay")}
                      </span>
                    </span>
                    {isOnAir ? (
                      <Badge className="shrink-0 rounded-full bg-destructive/90 text-destructive-foreground">
                        {streamingProgramme ? "ON AIR" : "NOW"}
                      </Badge>
                    ) : isPast ? (
                      <Badge
                        variant="outline"
                        className="shrink-0 rounded-full border-border text-xs text-muted-foreground"
                      >
                        Earlier
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="shrink-0 rounded-full border-gold/40 text-xs text-gold"
                      >
                        Upcoming
                      </Badge>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </Section>
  );
}
