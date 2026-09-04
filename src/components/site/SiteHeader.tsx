import { Link } from "@tanstack/react-router";
import {
  Menu,
  Search,
  Radio,
  Mic,
  CalendarCheck,
  CircleUserRound,
  LogIn,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { NAV_LINKS } from "@/lib/site-data";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { NotificationCenter } from "@/components/site/NotificationCenter";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/70 backdrop-blur-xl">
      <div className="mx-auto grid max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 py-2.5 sm:px-4 sm:py-3 lg:px-8">
        <div className="flex min-w-0 items-center">
          <Link to="/news-feed" className="flex shrink-0 items-center gap-2">
            <img
              src="/logo-icon.png"
              alt="X'Touch Entertainment"
              className="h-9 w-9 shrink-0 rounded-xl object-cover shadow-gold"
            />
            <span className="text-xs font-black uppercase tracking-[0.14em] text-gradient-gold sm:text-sm sm:tracking-[0.24em]">
              X&apos;Touch
            </span>
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Podcast"
            title="Podcast"
            className="hidden rounded-full md:inline-flex"
          >
            <Link to="/podcast">
              <Mic className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="ghost"
            size="icon"
            aria-label="Bookings"
            title="Bookings"
            className="hidden rounded-full md:inline-flex"
          >
            <Link to="/bookings">
              <CalendarCheck className="h-4 w-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Search"
            className="hidden rounded-full md:inline-flex"
          >
            <Search className="h-4 w-4" />
          </Button>
          {user ? (
            <>
              <Button
                asChild
                variant="ghost"
                size="icon"
                aria-label="Your profile"
                title="Your profile"
                className="rounded-full lg:hidden"
              >
                <Link to="/profile">
                  <CircleUserRound className="h-5 w-5" />
                </Link>
              </Button>
              <NotificationCenter />
              <Button
                asChild
                variant="ghost"
                aria-label="Your profile"
                title="Your profile"
                className="hidden rounded-full px-3 lg:inline-flex"
              >
                <Link to="/profile">
                  <CircleUserRound className="mr-2 h-4 w-4" />
                  <span className="max-w-24 truncate">{user.name}</span>
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Sign out"
                title="Sign out"
                className="hidden rounded-full md:inline-flex"
                onClick={() => void logout()}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <Button
              asChild
              variant="outline"
              className="h-9 w-9 rounded-full border-gold/30 p-0 sm:h-10 sm:w-auto sm:px-4"
            >
              <Link to="/login">
                <LogIn className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Sign in</span>
              </Link>
            </Button>
          )}
          <Button
            asChild
            aria-label="Watch Live"
            title="Watch Live"
            className="h-9 rounded-full bg-gradient-gold px-2.5 text-xs font-semibold text-primary-foreground shadow-gold hover:opacity-90 sm:h-10 sm:px-4 sm:text-sm"
          >
            <Link to="/live">
              <Radio className="mr-1 h-4 w-4" />
              <span className="sm:hidden">Live</span>
              <span className="hidden sm:inline">Watch Live</span>
            </Link>
          </Button>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-label="Open menu"
                className="rounded-full border-border"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-[min(20rem,calc(100vw-0.75rem))] overflow-y-auto border-border bg-background"
            >
              <SheetTitle className="px-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
                Navigate
              </SheetTitle>
              <nav className="mt-4 grid gap-1">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setOpen(false)}
                      className="rounded-xl bg-gold/10 px-3 py-2.5 text-sm font-semibold text-gold"
                    >
                      Your profile
                    </Link>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        void logout();
                      }}
                      className="rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                    >
                      Sign out
                    </button>
                  </>
                ) : null}
                {!user ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-3 py-2.5 text-sm font-semibold text-gold"
                    >
                      Sign in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setOpen(false)}
                      className="rounded-xl px-3 py-2.5 text-sm font-semibold text-gold"
                    >
                      Create account
                    </Link>
                  </>
                ) : null}
                <div className="my-2 border-t border-border" />
                <Link
                  to="/live"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm font-semibold text-gold"
                >
                  Watch Live
                </Link>
                <Link
                  to="/bookings"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Bookings
                </Link>
                <Link
                  to="/podcast"
                  onClick={() => setOpen(false)}
                  className="rounded-xl px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                >
                  Podcast
                </Link>
                {NAV_LINKS.map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setOpen(false)}
                    activeProps={{ className: "bg-accent text-gold" }}
                    className="rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
