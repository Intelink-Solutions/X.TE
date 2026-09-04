import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ADS } from "@/lib/ads-data";

export function AdPostCard({ className = "" }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    setIndex(Math.floor(Math.random() * ADS.length));
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % ADS.length);
    }, 7000);
    return () => window.clearInterval(id);
  }, []);

  const ad = ADS[index];

  return (
    <article className={`glass card-hover overflow-hidden rounded-3xl ${className}`}>
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 p-5">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-gold text-primary-foreground">
          <ad.icon className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold">X&apos;Touch Partners</span>
          <span className="block truncate text-xs text-muted-foreground">Sponsored</span>
        </span>
        <Badge
          variant="outline"
          className="shrink-0 rounded-full border-border text-xs text-muted-foreground"
        >
          Ad
        </Badge>
      </div>

      <div className="px-5 pb-5">
        <h3 className="text-base font-bold">{ad.title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{ad.copy}</p>
        <Button
          asChild
          size="sm"
          className="mt-4 rounded-full bg-gradient-gold font-semibold text-primary-foreground shadow-gold hover:opacity-90"
        >
          <Link to={ad.to}>{ad.cta}</Link>
        </Button>
      </div>
    </article>
  );
}
