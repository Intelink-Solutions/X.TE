import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section
      className={`mx-auto min-w-0 w-full max-w-7xl px-3 py-9 min-[380px]:px-4 sm:py-12 lg:px-8 lg:py-14 ${className}`}
    >
      {children}
    </section>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  action,
  actionTo,
  className = "",
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  actionTo?: string;
  className?: string;
}) {
  return (
    <div
      className={`mb-6 flex min-w-0 flex-col items-start gap-3 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:gap-4 ${className}`}
    >
      <div className="min-w-0">
        {eyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold">{eyebrow}</p>
        ) : null}
        <h2 className="mt-2 break-words text-2xl font-black sm:text-3xl md:text-4xl">{title}</h2>
      </div>
      {action && actionTo ? (
        <Button asChild variant="ghost" className="shrink-0 rounded-full text-gold hover:text-gold">
          <Link to={actionTo}>{action}</Link>
        </Button>
      ) : null}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  description,
  image,
}: {
  eyebrow: string;
  title: string;
  description: string;
  image?: string;
}) {
  return (
    <div className="relative overflow-hidden border-b border-border/60">
      {image ? (
        <img
          src={image}
          alt=""
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
      ) : null}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,oklch(0.85_0.16_88/0.18),transparent_60%)]" />
      <div className="relative mx-auto min-w-0 max-w-7xl px-3 py-12 min-[380px]:px-4 sm:py-20 lg:px-8 lg:py-24">
        <p className="text-xs font-semibold uppercase tracking-[0.35em] text-gold">{eyebrow}</p>
        <h1 className="mt-4 max-w-3xl break-words text-3xl font-black leading-[1.05] min-[380px]:text-4xl sm:text-5xl md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-base text-muted-foreground sm:text-lg">{description}</p>
      </div>
    </div>
  );
}

export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`glass card-hover min-w-0 overflow-hidden rounded-2xl p-4 sm:rounded-3xl sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function FeatureGrid({ items }: { items: { title: string; description: string }[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <GlassCard key={item.title}>
          <h3 className="text-lg font-bold">{item.title}</h3>
          <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
        </GlassCard>
      ))}
    </div>
  );
}
