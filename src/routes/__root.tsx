import { QueryClientProvider } from "@tanstack/react-query";
import type { QueryClient as QueryClientType } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { SiteHeader } from "@/components/site/SiteHeader";
import { SiteFooter } from "@/components/site/SiteFooter";
import { BottomNav } from "@/components/site/BottomNav";
import { AdCarousel } from "@/components/site/AdCarousel";
import { Toaster } from "@/components/ui/sonner";
import { trackEvent } from "@/lib/analytics";
import { AuthProvider } from "@/lib/auth";
import { AudioPlayerProvider } from "@/components/music/GlobalAudioPlayer";
import { MobileSplash } from "@/components/site/MobileSplash";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ reset }: { error: Error; reset: () => void }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClientType }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "X'Touch Entertainment — TV, Music, Production & Live" },
      {
        name: "description",
        content:
          "The official home of X'Touch Entertainment: XTouch TV, music, production, dancers, live streaming, events and news.",
      },
      { name: "author", content: "X'Touch Entertainment" },
      { name: "theme-color", content: "#0d0710" },
      { property: "og:title", content: "X'Touch Entertainment" },
      {
        property: "og:description",
        content:
          "Television, music, production, live events and social media in one premium platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "icon", href: "/favicon.ico", sizes: "48x48" },
      { rel: "icon", href: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
      { rel: "icon", href: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const isNavigating = useRouterState({ select: (state) => state.isLoading });

  useEffect(() => {
    trackEvent("page_view", { path: pathname });
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <MobileSplash />
      <div
        aria-hidden="true"
        className={`pointer-events-none fixed inset-x-0 top-0 z-[110] h-0.5 overflow-hidden transition-opacity duration-150 ${
          isNavigating ? "opacity-100" : "opacity-0"
        }`}
      >
        <span className="route-loader-progress block h-full w-1/3 rounded-full bg-gradient-gold shadow-gold" />
      </div>
      <AuthProvider>
        <AudioPlayerProvider>
          <div className="flex min-h-screen min-w-0 flex-col overflow-x-clip bg-background">
            <SiteHeader />
            <main className="min-w-0 flex-1">
              {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
              <Outlet />
            </main>
            <AdCarousel className="pb-6" />
            <SiteFooter />
            <BottomNav />
          </div>
        </AudioPlayerProvider>
      </AuthProvider>
      <Toaster />
    </QueryClientProvider>
  );
}
