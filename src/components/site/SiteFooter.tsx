import { Link } from "@tanstack/react-router";
import { Facebook, Instagram, Youtube, Music2 } from "lucide-react";
import { NAV_LINKS } from "@/lib/site-data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-card/30 pb-16 xl:pb-0">
      <div className="mx-auto max-w-7xl px-4 py-14 lg:px-8">
        <div className="glass rounded-3xl p-6 sm:p-10">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="min-w-0">
              <h2 className="text-2xl font-black sm:text-3xl">
                Join the <span className="text-gradient-gold">X&apos;Touch</span> inner circle
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Premieres, ticket drops and studio sessions — straight to your inbox.
              </p>
            </div>
            <form
              className="flex w-full min-w-0 flex-col gap-2 min-[420px]:flex-row lg:w-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                required
                placeholder="you@email.com"
                aria-label="Email address"
                className="h-11 min-w-0 rounded-full border-border bg-background/60 lg:w-72"
              />
              <Button className="h-11 w-full shrink-0 rounded-full bg-gradient-gold font-semibold text-primary-foreground shadow-gold hover:opacity-90 min-[420px]:w-auto">
                Subscribe
              </Button>
            </form>
          </div>
        </div>

        <div className="mt-12 grid gap-10 md:grid-cols-[1.2fr_2fr]">
          <div>
            <div className="flex items-center gap-2">
              <img
                src="/logo-icon.png"
                alt="X'Touch Entertainment"
                className="h-9 w-9 shrink-0 rounded-xl object-cover shadow-gold"
              />
              <span className="text-sm font-black uppercase tracking-[0.24em] text-gradient-gold">
                X&apos;Touch Entertainment
              </span>
            </div>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              Television, music, production, live events and social media — one home for the future
              of African entertainment.
            </p>
            <div className="mt-5 flex gap-2">
              {[Facebook, Instagram, Youtube, Music2].map((Icon, i) => (
                <span
                  key={i}
                  className="grid h-10 w-10 place-items-center rounded-full border border-border text-muted-foreground transition-colors hover:border-gold/50 hover:text-gold"
                >
                  <Icon className="h-4 w-4" />
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="text-muted-foreground transition-colors hover:text-gold"
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <p className="mt-12 border-t border-border/60 pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} X&apos;Touch Entertainment. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
