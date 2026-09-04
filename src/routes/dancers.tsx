import { createFileRoute, Link } from "@tanstack/react-router";
import { Award, Loader, Play } from "lucide-react";
import dancersImg from "@/assets/dancers.jpg";
import { Button } from "@/components/ui/button";
import {
  Section,
  SectionHeading,
  PageHero,
  GlassCard,
  FeatureGrid,
} from "@/components/site/Primitives";
import { useDancers } from "@/lib/api/hooks";
import { mediaUrl } from "@/lib/api/client";

export const Route = createFileRoute("/dancers")({
  head: () => ({
    meta: [
      { title: "XTouch Dancers — Crew, Videos, Academy & Bookings" },
      {
        name: "description",
        content:
          "The award-winning XTouch Dancers: team profiles, performance videos, gallery, training and the Dance Academy.",
      },
      { property: "og:title", content: "XTouch Dancers" },
      { property: "og:description", content: "Performance crew, academy and bookings." },
    ],
  }),
  component: DancersPage,
});

function DancersPage() {
  const { data: raw, isLoading } = useDancers();
  const TEAM = (raw ?? []).map((d) => ({
    id: d.id,
    name: d.name,
    role: d.role ?? d.speciality ?? "Performer · Choreographer",
    image_url: mediaUrl(d.image_url) ?? dancersImg,
  }));

  return (
    <>
      <PageHero
        eyebrow="XTouch Dancers"
        title="The crew that owns the stage"
        description="Eight dancers, a decade of choreography and a training academy turning auditions into contracts."
        image={dancersImg}
      />
      <Section>
        <SectionHeading eyebrow="Team" title="Meet the crew" />
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gold">
            <Loader className="mr-2 h-5 w-5 animate-spin" /> Loading dancers...
          </div>
        ) : TEAM.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
            No dancer profiles are available right now.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            {TEAM.map((d) => (
              <GlassCard key={d.id} className="overflow-hidden p-0">
                <img
                  src={d.image_url}
                  alt={d.name}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-40 w-full object-cover"
                />
                <div className="p-4">
                  <h3 className="font-bold">{d.name}</h3>
                  <p className="text-xs text-muted-foreground">{d.role}</p>
                </div>
              </GlassCard>
            ))}
          </div>
        )}
      </Section>
      <Section>
        <SectionHeading eyebrow="Videos" title="Recent performances" />
        <div className="grid gap-5 sm:grid-cols-3">
          {["Arena Set", "Gold Night Opening", "Academy Showcase"].map((v) => (
            <GlassCard key={v} className="group overflow-hidden p-0">
              <div className="relative">
                <img
                  src={dancersImg}
                  alt={v}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="h-48 w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gradient-gold text-primary-foreground shadow-gold">
                  <Play className="h-5 w-5 fill-current" />
                </span>
              </div>
              <div className="p-5 font-bold">{v}</div>
            </GlassCard>
          ))}
        </div>
      </Section>
      <Section>
        <SectionHeading eyebrow="Academy" title="Training & awards" />
        <FeatureGrid
          items={[
            {
              title: "Dance Academy",
              description: "12-week intakes in Afro-fusion, contemporary and commercial styles.",
            },
            {
              title: "Private training",
              description: "One-on-one coaching for artists preparing tours and videos.",
            },
            {
              title: "Corporate workshops",
              description: "Team sessions, brand activations and flash performances.",
            },
          ]}
        />
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <span className="flex items-center gap-2 text-sm text-gold">
            <Award className="h-4 w-4" /> 7 national choreography awards
          </span>
          <Button
            asChild
            className="rounded-full bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90"
          >
            <Link to="/bookings">Book the dancers</Link>
          </Button>
        </div>
      </Section>
    </>
  );
}
