import { useEffect, useRef, useState } from "react";
import { Download, Pause, Play, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export type PlayerTrack = {
  id: number;
  title: string;
  artist: string;
  streamUrl: string;
  downloadUrl: string;
  coverUrl?: string | null;
};

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  return `${Math.floor(value / 60)}:${String(Math.floor(value % 60)).padStart(2, "0")}`;
}

export function AudioVisualizerPlayer({ track }: { track: PlayerTrack | null }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const frameRef = useRef<number | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const trackId = track?.id;

  function connectAnalyser() {
    const audio = audioRef.current;
    if (!audio || analyserRef.current) return;
    const AudioContextClass = window.AudioContext ?? window.webkitAudioContext;
    const context = new AudioContextClass();
    const analyser = context.createAnalyser();
    analyser.fftSize = 128;
    analyser.smoothingTimeConstant = 0.82;
    const source = context.createMediaElementSource(audio);
    source.connect(analyser);
    analyser.connect(context.destination);
    contextRef.current = context;
    analyserRef.current = analyser;
    sourceRef.current = source;
  }

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !trackId) return;
    setCurrentTime(0);
    setDuration(0);
    audio.load();
    void audio.play().catch(() => setPlaying(false));
  }, [trackId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !playing) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const data = new Uint8Array(analyser?.frequencyBinCount ?? 32);

    const draw = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      const ratio = window.devicePixelRatio || 1;
      if (canvas.width !== width * ratio || canvas.height !== height * ratio) {
        canvas.width = width * ratio;
        canvas.height = height * ratio;
        context.setTransform(ratio, 0, 0, ratio, 0, 0);
      }
      context.clearRect(0, 0, width, height);
      if (analyser) analyser.getByteFrequencyData(data);
      const bars = Math.min(36, data.length);
      const gap = 3;
      const barWidth = Math.max(2, (width - gap * (bars - 1)) / bars);
      const gradient = context.createLinearGradient(0, height, 0, 0);
      gradient.addColorStop(0, "#8a6515");
      gradient.addColorStop(0.55, "#d4af37");
      gradient.addColorStop(1, "#fff1a8");
      context.fillStyle = gradient;
      for (let index = 0; index < bars; index++) {
        const amplitude = analyser ? data[index] / 255 : 0.08;
        const barHeight = Math.max(4, amplitude * height * 0.94);
        context.beginPath();
        context.roundRect(index * (barWidth + gap), height - barHeight, barWidth, barHeight, 3);
        context.fill();
      }
      frameRef.current = requestAnimationFrame(draw);
    };
    draw();
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [playing, trackId]);

  useEffect(
    () => () => {
      void contextRef.current?.close();
    },
    [],
  );

  async function toggle() {
    const audio = audioRef.current;
    if (!audio || !track) return;
    connectAnalyser();
    await contextRef.current?.resume();
    if (audio.paused) await audio.play();
    else audio.pause();
  }

  return (
    <div className="overflow-hidden rounded-3xl border border-gold/20 bg-gradient-to-br from-card via-card to-gold/5 shadow-gold">
      <div className="p-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.32em] text-gold">Now playing</p>
        <div className="mt-4 flex items-center gap-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center overflow-hidden rounded-xl bg-gold/10 text-xl font-black text-gold">
            {track?.coverUrl ? (
              <img src={track.coverUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              "♪"
            )}
          </span>
          <span className="min-w-0">
            <strong className="block truncate">{track?.title ?? "Choose a track"}</strong>
            <span className="block truncate text-xs text-muted-foreground">
              {track?.artist ?? "X'Touch Music"}
            </span>
          </span>
        </div>
        <canvas
          ref={canvasRef}
          aria-label="Live audio frequency visualization"
          className="mt-5 h-28 w-full rounded-xl bg-black/20"
        />
        <audio
          ref={audioRef}
          src={track?.streamUrl}
          crossOrigin="anonymous"
          preload="metadata"
          onPlay={() => {
            connectAnalyser();
            setPlaying(true);
          }}
          onPause={() => setPlaying(false)}
          onEnded={() => setPlaying(false)}
          onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
          onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
        />
        <input
          aria-label="Track position"
          type="range"
          min={0}
          max={duration || 0}
          value={Math.min(currentTime, duration || 0)}
          onChange={(event) => {
            if (audioRef.current) audioRef.current.currentTime = Number(event.target.value);
          }}
          className="mt-4 h-1.5 w-full accent-[#d4af37]"
        />
        <div className="mt-1 flex justify-between text-[11px] text-muted-foreground">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <input
              aria-label="Volume"
              type="range"
              min="0"
              max="1"
              step="0.05"
              defaultValue="1"
              onChange={(event) => {
                if (audioRef.current) audioRef.current.volume = Number(event.target.value);
              }}
              className="w-20 accent-[#d4af37]"
            />
          </span>
          <Button
            type="button"
            size="icon"
            disabled={!track}
            onClick={() => void toggle()}
            className="h-12 w-12 rounded-full bg-gradient-gold text-primary-foreground"
          >
            {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 fill-current" />}
          </Button>
          {track ? (
            <Button
              asChild
              variant="ghost"
              size="icon"
              className="rounded-full"
              title="Download track"
            >
              <a href={track.downloadUrl} download>
                <Download className="h-4 w-4" />
              </a>
            </Button>
          ) : (
            <span className="h-10 w-10" />
          )}
        </div>
      </div>
    </div>
  );
}

declare global {
  interface Window {
    webkitAudioContext: typeof AudioContext;
  }
}
