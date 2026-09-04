import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import {
  Download,
  Heart,
  ListPlus,
  Music2,
  Pause,
  Play,
  Repeat2,
  SkipBack,
  SkipForward,
  Square,
  Volume2,
  X,
} from "lucide-react";
import { useRouterState } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import {
  useCreatePlaylist,
  usePlaylists,
  useTogglePlaylistTrack,
  useToggleTrackLike,
} from "@/lib/api/hooks";

export type PlayerTrack = {
  id: number;
  title: string;
  artist: string;
  streamUrl: string;
  downloadUrl?: string;
  coverUrl?: string | null;
};

type PlayerContextValue = {
  track: PlayerTrack | null;
  playing: boolean;
  repeating: boolean;
  currentTime: number;
  duration: number;
  audio: HTMLAudioElement | null;
  widgetVisible: boolean;
  hasNext: boolean;
  hasPrevious: boolean;
  play: (track: PlayerTrack, queue?: PlayerTrack[]) => void;
  load: (track: PlayerTrack, queue?: PlayerTrack[]) => void;
  next: () => void;
  previous: () => void;
  toggle: () => Promise<void>;
  seek: (value: number) => void;
  setVolume: (value: number) => void;
  toggleRepeat: () => void;
  stop: () => void;
  show: () => void;
  close: () => void;
};

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const shouldAutoPlayRef = useRef(true);
  const [track, setTrack] = useState<PlayerTrack | null>(null);
  const [playing, setPlaying] = useState(false);
  const [repeating, setRepeating] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [widgetVisible, setWidgetVisible] = useState(true);
  const [queue, setQueue] = useState<PlayerTrack[]>([]);

  const queueIndex = track ? queue.findIndex((item) => item.id === track.id) : -1;
  const hasPrevious = queueIndex > 0;
  const hasNext = queueIndex >= 0 && queueIndex < queue.length - 1;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;
    audio.load();
    if (shouldAutoPlayRef.current) void audio.play().catch(() => setPlaying(false));
    else setPlaying(false);
  }, [track]);

  async function toggle() {
    const audio = audioRef.current;
    if (!audio || !track) return;
    if (audio.paused) await audio.play();
    else audio.pause();
  }

  function close() {
    setWidgetVisible(false);
  }

  function stop() {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    setPlaying(false);
    setCurrentTime(0);
  }

  function selectTrack(nextTrack: PlayerTrack, nextQueue?: PlayerTrack[], autoplay = true) {
    shouldAutoPlayRef.current = autoplay;
    setTrack(nextTrack);
    if (nextQueue?.length) setQueue(nextQueue);
    else if (!queue.some((item) => item.id === nextTrack.id)) setQueue([nextTrack]);
    if (autoplay) setWidgetVisible(true);
  }

  function next() {
    if (!hasNext) return;
    selectTrack(queue[queueIndex + 1], queue, true);
  }

  function previous() {
    if (!hasPrevious) return;
    selectTrack(queue[queueIndex - 1], queue, true);
  }

  return (
    <PlayerContext.Provider
      value={{
        track,
        playing,
        repeating,
        currentTime,
        duration,
        audio: audioRef.current,
        widgetVisible,
        hasNext,
        hasPrevious,
        play: (nextTrack, nextQueue) => selectTrack(nextTrack, nextQueue, true),
        load: (nextTrack, nextQueue) => selectTrack(nextTrack, nextQueue, false),
        next,
        previous,
        toggle,
        seek: (value) => {
          if (audioRef.current) audioRef.current.currentTime = value;
        },
        setVolume: (value) => {
          if (audioRef.current) audioRef.current.volume = value;
        },
        toggleRepeat: () => setRepeating((value) => !value),
        stop,
        show: () => setWidgetVisible(true),
        close,
      }}
    >
      {children}
      <audio
        ref={audioRef}
        src={track?.streamUrl}
        crossOrigin="anonymous"
        preload="metadata"
        loop={repeating}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          if (!repeating && hasNext) next();
        }}
        onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
        onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
      />
      <PersistentPlayerWidget />
    </PlayerContext.Provider>
  );
}

export function useAudioPlayer() {
  const context = useContext(PlayerContext);
  if (!context) throw new Error("useAudioPlayer must be used inside AudioPlayerProvider");
  return context;
}

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
}

export function AudioBars({ compact = false }: { compact?: boolean }) {
  const { audio, playing, track } = useAudioPlayer();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);

  useEffect(() => {
    if (!audio || !playing || analyserRef.current) return;
    try {
      const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
      const context = new AudioContextClass();
      const analyser = context.createAnalyser();
      analyser.fftSize = 128;
      analyser.smoothingTimeConstant = 0.84;
      const source = context.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(context.destination);
      contextRef.current = context;
      analyserRef.current = analyser;
      sourceRef.current = source;
      void context.resume();
    } catch {
      // A media element can only be connected once; animated fallback remains available.
    }
  }, [audio, playing]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const drawing = canvas.getContext("2d");
    if (!drawing) return;
    let frame = 0;
    const data = new Uint8Array(analyserRef.current?.frequencyBinCount ?? 32);
    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const ratio = window.devicePixelRatio || 1;
      if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        drawing.setTransform(ratio, 0, 0, ratio, 0, 0);
      }
      drawing.clearRect(0, 0, width, height);
      analyserRef.current?.getByteFrequencyData(data);
      const bars = Math.min(compact ? 24 : 42, data.length);
      const gap = compact ? 2 : 3;
      const barWidth = Math.max(2, (width - gap * (bars - 1)) / bars);
      const gradient = drawing.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, "#8a6515");
      gradient.addColorStop(0.55, "#d4af37");
      gradient.addColorStop(1, "#fff1a8");
      drawing.fillStyle = gradient;
      for (let index = 0; index < bars; index++) {
        const fallback = playing
          ? 0.15 + Math.abs(Math.sin(Date.now() / 260 + index)) * 0.55
          : 0.08;
        const amplitude = analyserRef.current ? data[index] / 255 : fallback;
        const barHeight = Math.max(3, amplitude * height * 0.94);
        drawing.beginPath();
        drawing.roundRect(index * (barWidth + gap), height - barHeight, barWidth, barHeight, 3);
        drawing.fill();
      }
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(frame);
  }, [compact, playing, track?.id]);

  return <canvas ref={canvasRef} className={compact ? "h-8 w-full" : "h-28 w-full"} />;
}

export function ExpandedAudioPlayer() {
  const player = useAudioPlayer();
  return (
    <div className="overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-card via-card to-gold/5 shadow-gold">
      <div className="grid gap-5 p-4 sm:p-6 md:grid-cols-[180px_minmax(0,1fr)] md:items-center lg:grid-cols-[220px_minmax(0,1fr)]">
        <div className="relative mx-auto aspect-square w-full max-w-[220px] overflow-hidden rounded-2xl bg-gradient-to-br from-gold/25 via-background to-card shadow-gold">
          <span className="grid h-full w-full place-items-center text-6xl font-black text-gold">
            {player.track?.coverUrl ? (
              <img src={player.track.coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              "♪"
            )}
          </span>
          {player.playing ? (
            <span className="absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-white backdrop-blur">
              Playing
            </span>
          ) : null}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gold">Now playing</p>
          <strong className="mt-2 block truncate text-2xl sm:text-3xl">
            {player.track?.title ?? "Choose a track"}
          </strong>
          <span className="mt-1 block truncate text-sm text-muted-foreground">
            {player.track?.artist ?? "Select a song from the X'Touch catalogue"}
          </span>
          <div className="mt-5 h-20 rounded-xl bg-black/20 p-2 sm:h-28">
            <AudioBars />
          </div>
          <input
            aria-label="Track position"
            type="range"
            min={0}
            max={player.duration || 0}
            value={Math.min(player.currentTime, player.duration || 0)}
            onChange={(event) => player.seek(Number(event.target.value))}
            className="mt-4 h-1.5 w-full accent-[#d4af37]"
          />
          <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
            <span>{formatTime(player.currentTime)}</span>
            <span>{formatTime(player.duration)}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Previous track"
              title="Previous track"
              disabled={!player.hasPrevious}
              onClick={player.previous}
            >
              <SkipBack className="h-5 w-5 fill-current" />
            </Button>
            <Button
              type="button"
              size="icon"
              aria-label={player.playing ? "Pause" : "Play"}
              disabled={!player.track}
              onClick={() => void player.toggle()}
              className="h-12 w-12 rounded-full bg-gradient-gold text-primary-foreground"
            >
              {player.playing ? (
                <Pause className="h-5 w-5" />
              ) : (
                <Play className="h-5 w-5 fill-current" />
              )}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label="Next track"
              title="Next track"
              disabled={!player.hasNext}
              onClick={player.next}
            >
              <SkipForward className="h-5 w-5 fill-current" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Repeat"
              onClick={player.toggleRepeat}
              aria-pressed={player.repeating}
              className={player.repeating ? "text-gold" : ""}
            >
              <Repeat2 className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              title="Stop"
              aria-label="Stop playback"
              disabled={!player.track}
              onClick={player.stop}
            >
              <Square className="h-4 w-4 fill-current" />
            </Button>
            <span className="flex items-center gap-2 px-1">
              <Volume2 className="h-4 w-4 text-muted-foreground" />
              <input
                aria-label="Volume"
                type="range"
                min="0"
                max="1"
                step="0.05"
                defaultValue="1"
                onChange={(event) => player.setVolume(Number(event.target.value))}
                className="w-20 accent-[#d4af37] sm:w-28"
              />
            </span>
            {player.track?.downloadUrl ? (
              <Button asChild variant="ghost" size="icon" title="Download">
                <a href={player.track.downloadUrl} download aria-label="Download track">
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

function PersistentPlayerWidget() {
  const player = useAudioPlayer();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const { user } = useAuth();
  const toggleLike = useToggleTrackLike();
  const { data: playlists = [] } = usePlaylists(Boolean(user));
  const createPlaylist = useCreatePlaylist();
  const togglePlaylistTrack = useTogglePlaylistTrack();
  const [liked, setLiked] = useState(false);
  useEffect(() => setLiked(false), [player.track?.id]);
  if (!player.track) return null;
  if (pathname === "/news-feed") return null;
  if (!player.widgetVisible) {
    return (
      <button
        type="button"
        onClick={player.show}
        aria-label="Show music player"
        title="Show music player"
        className="fixed bottom-20 right-3 z-[60] grid h-12 w-12 place-items-center rounded-full border border-gold/40 bg-card/95 text-gold shadow-gold backdrop-blur-xl sm:bottom-4 sm:right-4"
      >
        <Music2 className={`h-5 w-5 ${player.playing ? "animate-pulse" : ""}`} />
      </button>
    );
  }

  async function favorite() {
    if (!user) return toast.error("Sign in to save favourites");
    if (player.track!.id <= 0)
      return toast.error("This audio is not available in the music library yet");
    try {
      const result = await toggleLike.mutateAsync(player.track!.id);
      setLiked(result.liked);
      toast.success(result.liked ? "Saved to favourites" : "Removed from favourites");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save favourite");
    }
  }

  async function addToPlaylist() {
    if (!user) return toast.error("Sign in to use playlists");
    if (player.track!.id <= 0) return toast.error("This audio is not available for playlists yet");
    try {
      const playlist = playlists[0] ?? (await createPlaylist.mutateAsync("My Playlist"));
      const result = await togglePlaylistTrack.mutateAsync({
        playlistId: playlist.id,
        trackId: player.track!.id,
      });
      toast.success(result.saved ? `Added to ${playlist.name}` : `Removed from ${playlist.name}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update playlist");
    }
  }

  return (
    <aside className="fixed inset-x-3 bottom-20 z-[60] mx-auto max-w-3xl overflow-hidden rounded-2xl border border-gold/30 bg-card/95 shadow-2xl backdrop-blur-xl sm:bottom-4">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-3 sm:gap-4 sm:px-4">
        <button
          type="button"
          onClick={() => void player.toggle()}
          className="grid h-11 w-11 place-items-center rounded-full bg-gradient-gold text-primary-foreground"
          aria-label={player.playing ? "Pause" : "Play"}
        >
          {player.playing ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4 fill-current" />
          )}
        </button>
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="min-w-0 flex-1">
              <strong className="block truncate text-sm">{player.track.title}</strong>
              <span className="block truncate text-xs text-muted-foreground">
                {player.track.artist}
              </span>
            </span>
            <span className="hidden w-32 sm:block">
              <AudioBars compact />
            </span>
          </div>
          <input
            aria-label="Track position"
            type="range"
            min={0}
            max={player.duration || 0}
            value={Math.min(player.currentTime, player.duration || 0)}
            onChange={(event) => player.seek(Number(event.target.value))}
            className="mt-2 h-1 w-full accent-[#d4af37]"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{formatTime(player.currentTime)}</span>
            <span>{formatTime(player.duration)}</span>
          </div>
        </div>
        <div className="flex items-center gap-0.5">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={player.previous}
            disabled={!player.hasPrevious}
            aria-label="Previous track"
            className="hidden sm:inline-flex"
          >
            <SkipBack className="h-4 w-4 fill-current" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={player.next}
            disabled={!player.hasNext}
            aria-label="Next track"
          >
            <SkipForward className="h-4 w-4 fill-current" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void favorite()}
            aria-label="Save favourite"
            className={liked ? "text-gold" : ""}
          >
            <Heart className={`h-4 w-4 ${liked ? "fill-current" : ""}`} />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => void addToPlaylist()}
            aria-label="Add to playlist"
            className="hidden sm:inline-flex"
          >
            <ListPlus className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={player.toggleRepeat}
            aria-label="Repeat"
            aria-pressed={player.repeating}
            className={player.repeating ? "text-gold" : ""}
          >
            <Repeat2 className="h-4 w-4" />
          </Button>
          <span className="hidden items-center gap-1 lg:flex">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <input
              aria-label="Volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              defaultValue="1"
              onChange={(event) => player.setVolume(Number(event.target.value))}
              className="w-16 accent-[#d4af37]"
            />
          </span>
          {player.track.downloadUrl ? (
            <Button asChild variant="ghost" size="icon" className="hidden sm:inline-flex">
              <a href={player.track.downloadUrl} download aria-label="Download">
                <Download className="h-4 w-4" />
              </a>
            </Button>
          ) : null}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={player.stop}
            aria-label="Stop playback"
            title="Stop playback"
          >
            <Square className="h-4 w-4 fill-current" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={player.close}
            aria-label="Hide player; audio keeps playing"
            title="Hide player; audio keeps playing"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}
