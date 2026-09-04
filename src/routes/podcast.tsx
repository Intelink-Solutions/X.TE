import { createFileRoute } from "@tanstack/react-router";
import { useRef, useState } from "react";
import { Loader, Mic, Pause, Play, Square, UploadCloud } from "lucide-react";
import { toast } from "sonner";
import studioImg from "@/assets/studio.jpg";
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
import { Textarea } from "@/components/ui/textarea";
import { Section, SectionHeading, PageHero, GlassCard } from "@/components/site/Primitives";
import { usePodcastEpisodes, useSubmitPodcast } from "@/lib/api/hooks";
import { mediaUrl } from "@/lib/api/client";
import { useAuth } from "@/lib/auth";
import { useAudioPlayer } from "@/components/music/GlobalAudioPlayer";
import { EmbeddedVideo } from "@/components/site/EmbeddedVideo";

export const Route = createFileRoute("/podcast")({
  head: () => ({
    meta: [
      { title: "The X'Touch Podcast — Video & Audio Episodes" },
      {
        name: "description",
        content:
          "Video and audio episodes of the X'Touch Podcast, with guest profiles, series and categories.",
      },
    ],
  }),
  component: PodcastPage,
});

function PodcastSubmission() {
  const { user } = useAuth();
  const submit = useSubmitPodcast();
  const [open, setOpen] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      toast.error("Direct recording is not supported by this browser");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => event.data.size && chunksRef.current.push(event.data);
      recorder.onstop = () => {
        setRecordedAudio(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
        stream.getTracks().forEach((track) => track.stop());
        setRecording(false);
      };
      recorder.start();
      setRecording(true);
    } catch {
      toast.error("Microphone permission is required to record a podcast");
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") ?? "").trim();
    const upload = data.get("audio");
    if (title.length < 2) return toast.error("Add a podcast title");
    if (!(upload instanceof File && upload.size) && !recordedAudio)
      return toast.error("Upload audio or make a direct recording");
    if (recordedAudio) data.set("recorded_audio", recordedAudio, `podcast-${Date.now()}.webm`);
    try {
      await submit.mutateAsync(data);
      toast.success("Podcast submitted for review");
      form.reset();
      setRecordedAudio(null);
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Podcast submission failed");
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next && !user) return toast.error("Sign in to submit a podcast");
        if (!next && recording) stopRecording();
        setOpen(next);
      }}
    >
      <DialogTrigger asChild>
        <Button className="rounded-full bg-gradient-gold text-primary-foreground">
          <Mic className="mr-2 h-4 w-4" />
          Submit a podcast
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-border bg-background sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Podcast submission</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          Upload finished audio or record directly. Every submission is reviewed before it appears
          publicly.
        </p>
        <form className="grid gap-4" onSubmit={handleSubmit}>
          <div className="grid gap-2">
            <Label htmlFor="podcast-title">Title</Label>
            <Input id="podcast-title" name="title" minLength={2} maxLength={160} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="podcast-guest">Guest</Label>
            <Input id="podcast-guest" name="guest" maxLength={120} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="podcast-description">Description</Label>
            <Textarea id="podcast-description" name="description" maxLength={2000} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="podcast-audio">Upload audio</Label>
            <Input id="podcast-audio" name="audio" type="file" accept="audio/*" />
          </div>
          <div className="rounded-2xl border border-border p-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => (recording ? stopRecording() : void startRecording())}
                className="rounded-full"
              >
                {recording ? (
                  <>
                    <Square className="mr-2 h-4 w-4 fill-current" />
                    Stop recording
                  </>
                ) : (
                  <>
                    <Mic className="mr-2 h-4 w-4" />
                    Record now
                  </>
                )}
              </Button>
              <span className="text-xs text-muted-foreground">
                {recording ? "Recording…" : recordedAudio ? "Recording ready" : "No recording yet"}
              </span>
            </div>
            {recordedAudio ? (
              <audio controls src={URL.createObjectURL(recordedAudio)} className="mt-3 w-full" />
            ) : null}
          </div>
          <Button
            disabled={submit.isPending || recording}
            className="rounded-full bg-gradient-gold text-primary-foreground"
          >
            <UploadCloud className="mr-2 h-4 w-4" />
            {submit.isPending ? "Submitting…" : "Submit for approval"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function PodcastPage() {
  const { data: raw, isLoading } = usePodcastEpisodes();
  const player = useAudioPlayer();
  const episodes = raw?.data ?? [];

  return (
    <>
      <PageHero
        eyebrow="Podcast"
        title="The X'Touch Podcast"
        description="Long-form conversations with the artists, producers and executives building the continent's entertainment industry."
        image={studioImg}
      />
      <Section>
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading eyebrow="Latest" title="Episodes" />
          <PodcastSubmission />
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gold">
            <Loader className="mr-2 h-5 w-5 animate-spin" />
            Loading episodes…
          </div>
        ) : episodes.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
            No approved podcast episodes are live yet.
          </div>
        ) : (
          <div className="grid gap-5">
            {episodes.map((episode) => {
              const audioUrl = episode.audio_url
                ? mediaUrl(`/api/podcast-episodes/${episode.id}/stream`)
                : null;
              const downloadUrl = episode.audio_url
                ? mediaUrl(`/api/podcast-episodes/${episode.id}/download`)
                : null;
              const playerId = -1_000_000 - episode.id;
              const active = player.track?.id === playerId;
              return (
                <GlassCard
                  key={episode.id}
                  className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                >
                  <button
                    type="button"
                    disabled={!audioUrl}
                    onClick={() =>
                      active
                        ? void player.toggle()
                        : player.play({
                            id: playerId,
                            title: episode.title,
                            artist: episode.guest
                              ? `X'Touch Podcast · ${episode.guest}`
                              : "X'Touch Podcast",
                            streamUrl: audioUrl!,
                            downloadUrl: downloadUrl ?? undefined,
                            coverUrl: mediaUrl(episode.cover_url),
                          })
                    }
                    aria-label={`${active && player.playing ? "Pause" : "Play"} ${episode.title}`}
                    className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-gradient-gold text-primary-foreground disabled:opacity-40"
                  >
                    {active && player.playing ? (
                      <Pause className="h-5 w-5 fill-current" />
                    ) : (
                      <Play className="h-5 w-5 fill-current" />
                    )}
                  </button>
                  <span className="min-w-0">
                    <span className="block text-xs uppercase tracking-[0.25em] text-gold">
                      Episode {episode.episode_number ?? episode.id}
                    </span>
                    <span className="block truncate text-lg font-bold">{episode.title}</span>
                    <span className="block truncate text-sm text-muted-foreground">
                      {episode.guest ? `Guest: ${episode.guest}` : episode.description}
                    </span>
                  </span>
                  <span className="col-start-2 shrink-0 text-xs text-muted-foreground sm:col-start-auto">
                    {episode.duration}
                  </span>
                  {episode.video_url ? (
                    <div className="col-span-full mt-2 w-full">
                      <EmbeddedVideo url={episode.video_url} title={episode.title} />
                    </div>
                  ) : null}
                </GlassCard>
              );
            })}
          </div>
        )}
      </Section>
    </>
  );
}
