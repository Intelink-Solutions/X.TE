import { Link } from "@tanstack/react-router";
import { Newspaper, Tv, Radio, Music, Menu } from "lucide-react";
import { useState } from "react";
import { NAV_LINKS } from "@/lib/site-data";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const BOTTOM_NAV_ITEMS = [
  { to: "/news-feed", label: "Feed", icon: Newspaper },
  { to: "/tv", label: "TV", icon: Tv },
  { to: "/live", label: "Live", icon: Radio },
  { to: "/music", label: "Music", icon: Music },
] as const;

export function BottomNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 overflow-x-clip border-t border-border/60 bg-background/90 backdrop-blur-xl xl:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid max-w-7xl grid-cols-5">
        {BOTTOM_NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-gold" }}
              activeOptions={{ exact: true }}
              className="flex min-w-0 flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground min-[380px]:py-2.5 min-[380px]:text-[11px]"
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <button
              type="button"
              className="flex min-w-0 flex-col items-center gap-1 px-1 py-2 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground min-[380px]:py-2.5 min-[380px]:text-[11px]"
            >
              <Menu className="h-5 w-5 shrink-0" />
              <span className="truncate">More</span>
            </button>
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-[min(20rem,calc(100vw-0.75rem))] overflow-y-auto border-border bg-background"
          >
            <SheetTitle className="px-1 text-xs uppercase tracking-[0.3em] text-muted-foreground">
              Navigate
            </SheetTitle>
            <nav className="mt-4 grid gap-1">
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
    </nav>
  );
}
