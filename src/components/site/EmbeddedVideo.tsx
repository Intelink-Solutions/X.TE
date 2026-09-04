import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, Maximize2, Minimize2, Play, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { mediaUrl } from "@/lib/api/client";

type EmbeddedVideoProps = {
  url?: string | null;
  title?: string;
  className?: string;
  autoPlay?: boolean;
  orientation?: "auto" | "portrait" | "landscape";
};

type YoutubePlayer = {
  destroy: () => void;
};

type YoutubePlayerEvent = {
  data: number;
};

let youtubeApiPromise: Promise<void> | null = null;

function loadYoutubeApi() {
  if (typeof window === "undefined") return Promise.reject(new Error("Browser unavailable"));
  if (window.YT?.Player) return Promise.resolve();
  if (youtubeApiPromise) return youtubeApiPromise;

  youtubeApiPromise = new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => reject(new Error("YouTube player timed out")), 12_000);
    const previousReady = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      window.clearTimeout(timeout);
      previousReady?.();
      resolve();
    };

    const existing = document.querySelector<HTMLScriptElement>(
      'script[src="https://www.youtube.com/iframe_api"]',
    );
    if (existing) {
      existing.addEventListener(
        "error",
        () => {
          window.clearTimeout(timeout);
          reject(new Error("YouTube player blocked"));
        },
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      window.clearTimeout(timeout);
      reject(new Error("YouTube player blocked"));
    };
    document.head.appendChild(script);
  });

  void youtubeApiPromise.catch(() => {
    youtubeApiPromise = null;
  });

  return youtubeApiPromise;
}

function youtubeErrorMessage(code: number) {
  if (code === 2) return "This YouTube link is invalid.";
  if (code === 5) return "YouTube could not play this video in the browser.";
  if (code === 100) return "This video was removed or made private on YouTube.";
  if (code === 101 || code === 150)
    return "The video owner does not allow this video to play on other websites.";
  if (code === 153)
    return "YouTube could not verify this embedded player. Refresh the page and try again.";
  return "YouTube reports that this video is currently unavailable.";
}

function youtubeVideoId(rawUrl: string) {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  if (host === "youtu.be") {
    return url.pathname.split("/").filter(Boolean)[0] ?? null;
  }
  if (host.endsWith("youtube.com")) {
    const parts = url.pathname.split("/").filter(Boolean);
    return (
      url.searchParams.get("v") ||
      (["shorts", "live", "embed"].includes(parts[0]) ? parts[1] : null)
    );
  }
  return null;
}

function embedUrl(rawUrl: string, autoPlay: boolean) {
  const youtubeId = youtubeVideoId(rawUrl);
  if (youtubeId) {
    return `https://www.youtube.com/embed/${youtubeId}?autoplay=${autoPlay ? 1 : 0}&playsinline=1&rel=0&fs=0`;
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return null;
  }

  const host = url.hostname.replace(/^www\./, "");
  if (host.endsWith("facebook.com") || host === "fb.watch") {
    return `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(rawUrl)}&show_text=false&autoplay=${autoPlay}`;
  }
  if (host.endsWith("tiktok.com")) {
    const id = url.pathname.match(/\/video\/(\d+)/)?.[1];
    return id ? `https://www.tiktok.com/player/v1/${id}?autoplay=${autoPlay ? 1 : 0}` : null;
  }
  if (host.endsWith("instagram.com")) {
    const match = url.pathname.match(/^\/(reel|p|tv)\/([^/]+)/);
    return match ? `https://www.instagram.com/${match[1]}/${match[2]}/embed/` : null;
  }
  return null;
}

function isPortraitUrl(rawUrl: string) {
  try {
    const parsed = new URL(rawUrl);
    return (
      parsed.pathname.includes("/shorts/") ||
      parsed.pathname.includes("/reel/") ||
      parsed.hostname.includes("tiktok.com")
    );
  } catch {
    return false;
  }
}

export function EmbeddedVideo({
  url,
  title = "Video",
  className,
  autoPlay = false,
  orientation = "auto",
}: EmbeddedVideoProps) {
  const frameRef = useRef<HTMLDivElement>(null);
  const youtubeMountRef = useRef<HTMLDivElement>(null);
  const youtubeId = useMemo(() => (url ? youtubeVideoId(url) : null), [url]);
  const [activated, setActivated] = useState(autoPlay);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [directPortrait, setDirectPortrait] = useState(false);
  const [playbackError, setPlaybackError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);
  const embed = useMemo(
    () => (url ? embedUrl(url, autoPlay || activated) : null),
    [url, autoPlay, activated],
  );

  useEffect(() => setActivated(autoPlay), [url, autoPlay]);

  useEffect(() => {
    setPlaybackError(null);
    setRetryKey(0);
  }, [url]);

  useEffect(() => {
    if (!youtubeId || !activated || !youtubeMountRef.current) return;
    let disposed = false;
    let player: YoutubePlayer | null = null;

    void loadYoutubeApi()
      .then(() => {
        if (disposed || !youtubeMountRef.current) return;
        player = new window.YT.Player(youtubeMountRef.current, {
          width: "100%",
          height: "100%",
          videoId: youtubeId,
          playerVars: {
            autoplay: autoPlay || activated ? 1 : 0,
            playsinline: 1,
            rel: 0,
            fs: 0,
            origin: window.location.origin,
          },
          events: {
            onError: (event: YoutubePlayerEvent) => {
              if (!disposed) setPlaybackError(youtubeErrorMessage(event.data));
            },
          },
        });
      })
      .catch(() => {
        if (!disposed)
          setPlaybackError(
            "The YouTube player was blocked by the browser or network. Check privacy and ad-blocking settings, then retry.",
          );
      });

    return () => {
      disposed = true;
      player?.destroy();
    };
  }, [youtubeId, activated, autoPlay, retryKey]);

  useEffect(() => {
    const onFullscreenChange = () =>
      setIsFullscreen(document.fullscreenElement === frameRef.current);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", onFullscreenChange);
  }, []);

  const portrait =
    orientation === "portrait" ||
    (orientation === "auto" && (directPortrait || (url ? isPortraitUrl(url) : false)));

  async function toggleFullscreen() {
    if (!frameRef.current) return;
    if (document.fullscreenElement) {
      await document.exitFullscreen();
      return;
    }
    await frameRef.current.requestFullscreen();
    if (window.matchMedia("(max-width: 767px) and (orientation: portrait)").matches) {
      const screenOrientation = screen.orientation as ScreenOrientation & {
        lock?: (orientation: string) => Promise<void>;
      };
      void screenOrientation.lock?.("portrait").catch(() => undefined);
    }
  }

  const frameClass = cn(
    "site-video-player group/player relative mx-auto w-full overflow-hidden rounded-2xl bg-black",
    portrait ? "aspect-[9/16] max-h-[82dvh] max-w-md" : "aspect-video max-h-[82dvh]",
    className,
  );

  const fullscreenButton = (
    <button
      type="button"
      onClick={() => void toggleFullscreen()}
      aria-label={isFullscreen ? "Exit wide view" : "Open wide view"}
      className="absolute right-3 top-3 z-20 grid h-10 w-10 place-items-center rounded-full bg-black/70 text-white opacity-100 backdrop-blur transition hover:bg-black/90 sm:opacity-0 sm:group-hover/player:opacity-100 sm:group-focus-within/player:opacity-100"
    >
      {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
    </button>
  );

  if (!url) return null;

  if (youtubeId && !activated) {
    return (
      <div ref={frameRef} className={frameClass}>
        {fullscreenButton}
        <button
          type="button"
          onClick={() => setActivated(true)}
          aria-label={`Play ${title}`}
          className="group absolute inset-0 text-white"
        >
          <img
            src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
            alt=""
            loading="lazy"
            referrerPolicy="no-referrer"
            className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-[1.02]"
          />
          <span className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-black/15" />
          <span className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-gold text-primary-foreground shadow-gold transition group-hover:scale-110">
            <Play className="ml-1 h-6 w-6 fill-current" />
          </span>
          <span className="absolute inset-x-5 bottom-4 truncate text-left text-sm font-bold">
            {title}
          </span>
        </button>
      </div>
    );
  }

  if (youtubeId) {
    return (
      <div ref={frameRef} className={frameClass}>
        {fullscreenButton}
        {playbackError ? (
          <div className="absolute inset-0 grid place-items-center bg-neutral-950 px-6 text-center text-white">
            <div className="max-w-md">
              <AlertCircle className="mx-auto h-9 w-9 text-gold" />
              <h3 className="mt-3 font-black">Video unavailable</h3>
              <p className="mt-2 text-sm leading-6 text-white/70">{playbackError}</p>
              <p className="mt-2 text-xs text-white/50">
                The publisher can resolve this by replacing the link or uploading the video file
                directly.
              </p>
              <button
                type="button"
                onClick={() => {
                  setPlaybackError(null);
                  setRetryKey((value) => value + 1);
                }}
                className="mx-auto mt-4 flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-semibold transition hover:border-gold/60 hover:text-gold"
              >
                <RefreshCw className="h-4 w-4" /> Retry player
              </button>
            </div>
          </div>
        ) : (
          <div key={retryKey} ref={youtubeMountRef} className="absolute inset-0 h-full w-full" />
        )}
      </div>
    );
  }

  if (embed) {
    return (
      <div ref={frameRef} className={frameClass}>
        {fullscreenButton}
        <iframe
          src={embed}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          className="absolute inset-0 h-full w-full border-0"
        />
      </div>
    );
  }

  return (
    <div ref={frameRef} className={frameClass}>
      {fullscreenButton}
      <video
        src={mediaUrl(url) ?? undefined}
        title={title}
        controls
        playsInline
        preload="metadata"
        onLoadedMetadata={(event) => {
          const video = event.currentTarget;
          setDirectPortrait(video.videoHeight > video.videoWidth);
        }}
        className="absolute inset-0 h-full w-full bg-black object-contain"
      />
    </div>
  );
}

declare global {
  interface Window {
    onYouTubeIframeAPIReady?: () => void;
    YT: {
      Player: new (
        element: HTMLElement,
        options: {
          width: string;
          height: string;
          videoId: string;
          playerVars: Record<string, string | number>;
          events: { onError: (event: YoutubePlayerEvent) => void };
        },
      ) => YoutubePlayer;
    };
  }
}
