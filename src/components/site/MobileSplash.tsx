import { useEffect, useState } from "react";

const SPLASH_KEY = "xtouch:mobile-splash-seen";

export function MobileSplash() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const alreadySeen = window.sessionStorage.getItem(SPLASH_KEY) === "1";

    if (!mobile || alreadySeen) {
      setVisible(false);
      return;
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(
      () => {
        window.sessionStorage.setItem(SPLASH_KEY, "1");
        setVisible(false);
      },
      reducedMotion ? 120 : 420,
    );

    return () => window.clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-label="Loading X'Touch Entertainment"
      className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-background md:hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_42%,oklch(0.55_0.18_330/0.2),transparent_48%)]" />
      <div className="relative flex flex-col items-center px-6 text-center">
        <span className="mobile-splash-logo grid h-20 w-20 place-items-center rounded-3xl border border-gold/30 bg-card shadow-gold">
          <img
            src="/logo-icon.png"
            alt=""
            width={80}
            height={80}
            className="h-full w-full rounded-3xl object-cover"
          />
        </span>
        <p className="mt-5 text-lg font-black uppercase tracking-[0.28em] text-gradient-gold">
          X&apos;Touch
        </p>
        <span className="mobile-splash-loader mt-6 h-1 w-28 overflow-hidden rounded-full bg-white/10">
          <span className="block h-full w-1/2 rounded-full bg-gradient-gold" />
        </span>
        <span className="sr-only">Loading…</span>
      </div>
    </div>
  );
}
