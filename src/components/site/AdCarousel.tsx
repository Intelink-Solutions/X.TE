import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { ADS } from "@/lib/ads-data";

export function AdCarousel({ className = "" }: { className?: string }) {
  const [api, setApi] = useState<CarouselApi>();

  useEffect(() => {
    if (!api) return;
    const id = window.setInterval(() => {
      api.scrollNext();
    }, 5000);
    return () => window.clearInterval(id);
  }, [api]);

  return (
    <div className={`mx-auto w-full max-w-7xl px-4 lg:px-8 ${className}`}>
      <div className="flex items-center justify-between px-1 pb-2">
        <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-muted-foreground">
          Sponsored
        </span>
      </div>
      <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
        <CarouselContent>
          {ADS.map((ad) => (
            <CarouselItem key={ad.title} className="basis-full sm:basis-1/2 lg:basis-1/3">
              <Link
                to={ad.to}
                className="glass card-hover flex h-full items-center gap-4 rounded-2xl border border-gold/20 p-4"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-gold text-primary-foreground">
                  <ad.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-bold">{ad.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{ad.copy}</span>
                  <span className="mt-1 inline-block text-xs font-semibold text-gold">
                    {ad.cta} →
                  </span>
                </span>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
