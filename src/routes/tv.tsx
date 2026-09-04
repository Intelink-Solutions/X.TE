import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { Clock3, LoaderCircle, Play, Radio, RefreshCw } from "lucide-react";
import tvImg from "@/assets/tv.jpg";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Section,
  SectionHeading,
  GlassCard,
  PageHero,
  FeatureGrid,
} from "@/components/site/Primitives";
import { SCHEDULE as STATIC_SCHEDULE } from "@/lib/site-data";
import { type TvSchedule, useTvSchedules } from "@/lib/api/hooks";
import { EmbeddedVideo } from "@/components/site/EmbeddedVideo";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/tv")({
  head: () => ({
    meta: [
      { title: "XTouch TV — Live Channel, Schedule & Replays" },
      {
        name: "description",
        content:
          "Watch XTouch TV live, browse the daily schedule, catch replays and book commercial airtime with our presenters.",
      },
      { property: "og:title", content: "XTouch TV" },
      {
        property: "og:description",
        content: "Live channel, schedule, replay library and commercial booking.",
      },
    ],
  }),
  component: TvPage,
});

function TvPage() {
  const { data: raw, isLoading, isError, refetch } = useTvSchedules();
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const playerRef = useRef<HTMLDivElement>(null);

  const fallbackSchedule = useMemo<TvSchedule[]>(
    () =>
      STATIC_SCHEDULE.map((show, index) => ({
        id: -(index + 1),
        show_name: show.show,
        time: show.time,
        tag: show.tag,
        is_live: false,
        stream_url: null,
      })),
    [],
  );
  const schedule = raw?.length ? raw : isLoading ? [] : fallbackSchedule;
  const selectedShow =
    schedule.find((show) => show.id === selectedId) ??
    schedule.find((show) => show.is_live && show.stream_url) ??
    schedule.find((show) => show.stream_url) ??
    schedule[0];
  const replayShows = schedule.filter((show) => !show.is_live).slice(0, 8);

  function selectShow(show: TvSchedule) {
    setSelectedId(show.id);
    window.requestAnimationFrame(() =>
      playerRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
    );
  }

  return (
    <>
      <PageHero
        eyebrow="XTouch TV"
        title="Live television, built for the stream era"
        description="A 24/7 channel with multi-camera production, a full replay library and airtime you can book."
        image={tvImg}
      />

      <Section>
        {isError ? (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p>The live TV service could not be reached. The published schedule is shown below.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-fit rounded-full border-destructive/30"
              onClick={() => void refetch()}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Retry
            </Button>
          </div>
        ) : null}
        <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          <div ref={playerRef} className="glass scroll-mt-24 overflow-hidden rounded-3xl p-2">
            {isLoading ? (
              <div className="grid aspect-video place-items-center rounded-2xl bg-black/80 text-sm text-white/70">
                <span className="flex items-center gap-2">
                  <LoaderCircle className="h-5 w-5 animate-spin text-gold" /> Loading X&apos;Touch
                  TV...
                </span>
              </div>
            ) : selectedShow?.stream_url ? (
              <EmbeddedVideo
                key={`${selectedShow.id}-${selectedShow.stream_url}`}
                url={selectedShow.stream_url}
                title={selectedShow.show_name}
              />
            ) : (
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-black">
                <img
                  src={tvImg}
                  alt="X'Touch TV studio"
                  width={1024}
                  height={768}
                  className="absolute inset-0 h-full w-full object-cover opacity-45"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/45 to-black/10" />
                <div className="absolute inset-0 flex flex-col items-center justify-center px-5 text-center text-white">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-white/10 backdrop-blur sm:h-16 sm:w-16">
                    <Radio className="h-5 w-5 text-gold sm:h-7 sm:w-7" />
                  </span>
                  <h2 className="mt-4 text-lg font-black sm:text-2xl">
                    {selectedShow?.is_live ? "We are not live at the moment" : "Replay coming soon"}
                  </h2>
                  <p className="mt-1 max-w-lg text-xs text-white/70 sm:text-sm">
                    {selectedShow
                      ? `${selectedShow.show_name} does not have a published video yet.`
                      : "The next X'Touch programme will appear here when it is published."}
                  </p>
                  <Button
                    asChild
                    size="sm"
                    className="mt-4 rounded-full bg-gradient-gold text-primary-foreground shadow-gold"
                  >
                    <Link to="/live">Open live channel</Link>
                  </Button>
                </div>
              </div>
            )}
            <div className="p-4">
              <Badge
                className={
                  selectedShow?.is_live && selectedShow.stream_url
                    ? "rounded-full bg-destructive/90 text-destructive-foreground"
                    : "rounded-full bg-gold/15 text-gold"
                }
              >
                {selectedShow?.is_live && selectedShow.stream_url
                  ? "LIVE"
                  : selectedShow?.stream_url
                    ? "REPLAY"
                    : "TV SHOW"}
              </Badge>
              <h2 className="mt-3 text-2xl font-black">
                {selectedShow?.show_name ?? "X'Touch Television"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {selectedShow?.description ??
                  "Programmes, interviews and entertainment from X'Touch."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  asChild
                  size="sm"
                  className="rounded-full bg-gradient-gold text-primary-foreground shadow-gold"
                >
                  <Link to="/live">
                    <Radio className="mr-2 h-4 w-4" /> Watch Live
                  </Link>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-full border-border">
                  <Link to="/bookings">Book airtime</Link>
                </Button>
              </div>
            </div>
          </div>
          <GlassCard className="p-0">
            <div className="border-b border-border px-6 py-4 text-xs font-semibold uppercase tracking-[0.25em] text-gold">
              TV schedule
            </div>
            <ul className="divide-y divide-border">
              {isLoading ? (
                <li className="flex items-center justify-center gap-2 px-6 py-12 text-sm text-muted-foreground">
                  <LoaderCircle className="h-5 w-5 animate-spin text-gold" /> Loading schedule...
                </li>
              ) : (
                schedule.map((show) => {
                  const selected = show.id === selectedShow?.id;
                  return (
                    <li key={show.id}>
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => selectShow(show)}
                        className={cn(
                          "grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 text-left transition sm:px-6",
                          selected ? "bg-gold/10" : "hover:bg-accent/60",
                        )}
                      >
                        <span className="text-sm font-bold text-gold">{show.time}</span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">
                            {show.show_name}
                          </span>
                          <span className="block truncate text-[10px] uppercase tracking-widest text-muted-foreground">
                            {show.tag ?? (show.is_live ? "Live" : "TV show")}
                          </span>
                        </span>
                        {show.is_live && show.stream_url ? (
                          <Badge className="rounded-full bg-destructive/90 px-2 text-[9px] text-destructive-foreground">
                            LIVE
                          </Badge>
                        ) : show.stream_url ? (
                          <Play className="h-4 w-4 fill-current text-gold" />
                        ) : (
                          <Clock3 className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>
                    </li>
                  );
                })
              )}
            </ul>
          </GlassCard>
        </div>
      </Section>

      <Section>
        <SectionHeading
          eyebrow="Replay library"
          title="Catch up on X'Touch shows"
          action="Watch live"
          actionTo="/live"
        />
        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="glass h-64 animate-pulse rounded-3xl bg-card/40" />
            ))}
          </div>
        ) : replayShows.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {replayShows.map((show) => (
              <button
                key={show.id}
                type="button"
                onClick={() => selectShow(show)}
                className={cn(
                  "glass card-hover group min-w-0 overflow-hidden rounded-3xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold",
                  show.id === selectedShow?.id && "ring-1 ring-gold/70",
                )}
              >
                <span className="relative block h-40 overflow-hidden">
                  <img
                    src={tvImg}
                    alt=""
                    loading="lazy"
                    width={1024}
                    height={768}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                  <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-gold text-primary-foreground shadow-gold">
                    {show.stream_url ? (
                      <Play className="ml-0.5 h-4 w-4 fill-current" />
                    ) : (
                      <Clock3 className="h-4 w-4" />
                    )}
                  </span>
                </span>
                <span className="block p-5">
                  <span className="block truncate font-bold">{show.show_name}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">
                    {show.stream_url ? "Watch replay" : "Replay coming soon"}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : (
          <GlassCard className="text-center">
            <Clock3 className="mx-auto h-8 w-8 text-gold" />
            <h3 className="mt-3 font-bold">Replays are being prepared</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Published episodes will automatically appear here.
            </p>
          </GlassCard>
        )}
      </Section>

      <Section>
        <SectionHeading eyebrow="Presenters & airtime" title="On screen and on the rate card" />
        <FeatureGrid
          items={[
            {
              title: "Presenters",
              description:
                "Meet the anchors, hosts and correspondents fronting every X'Touch show.",
            },
            {
              title: "Commercial booking",
              description: "30s and 60s spots, sponsored segments and full branded programmes.",
            },
            {
              title: "Programme partnerships",
              description: "Co-produce a series with our in-house production team and studios.",
            },
          ]}
        />
        <Button
          asChild
          className="mt-8 rounded-full bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90"
        >
          <Link to="/bookings">Book commercial airtime</Link>
        </Button>
      </Section>
    </>
  );
}
