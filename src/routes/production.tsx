import { createFileRoute, Link } from "@tanstack/react-router";
import studioImg from "@/assets/studio.jpg";
import heroImg from "@/assets/hero.jpg";
import tvImg from "@/assets/tv.jpg";
import dancersImg from "@/assets/dancers.jpg";
import { Button } from "@/components/ui/button";
import {
  Section,
  SectionHeading,
  PageHero,
  FeatureGrid,
  GlassCard,
} from "@/components/site/Primitives";

export const Route = createFileRoute("/production")({
  head: () => ({
    meta: [
      { title: "XTouch Production — Film, Video, Photography & Drone" },
      {
        name: "description",
        content:
          "Film production, music videos, corporate video, photography, drone services and book production from XTouch Production.",
      },
      { property: "og:title", content: "XTouch Production" },
      {
        property: "og:description",
        content: "A full-service production house for film, video and photography.",
      },
    ],
  }),
  component: ProductionPage,
});

const PORTFOLIO = [
  { title: "Golden Hour", type: "Music video", img: heroImg },
  { title: "Copper Nation", type: "Documentary film", img: tvImg },
  { title: "Rise Campaign", type: "Corporate video", img: studioImg },
  { title: "Arena Tour", type: "Live multi-cam", img: dancersImg },
];

function ProductionPage() {
  return (
    <>
      <PageHero
        eyebrow="XTouch Production"
        title="Cinema-grade production, end to end"
        description="Concept, crew, cameras, colour and delivery — one team from the first treatment to the final master."
        image={studioImg}
      />
      <Section>
        <SectionHeading eyebrow="Portfolio" title="Selected projects" />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PORTFOLIO.map((p) => (
            <GlassCard key={p.title} className="group overflow-hidden p-0">
              <img
                src={p.img}
                alt={p.title}
                loading="lazy"
                width={1024}
                height={768}
                className="h-52 w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="p-5">
                <h3 className="font-bold">{p.title}</h3>
                <p className="text-sm text-muted-foreground">{p.type}</p>
              </div>
            </GlassCard>
          ))}
        </div>
      </Section>
      <Section>
        <SectionHeading eyebrow="Services" title="What we produce" />
        <FeatureGrid
          items={[
            {
              title: "Film production",
              description: "Shorts, features and documentaries with full crew and post.",
            },
            {
              title: "Music videos",
              description: "Concept to colour grade, shot on cinema glass.",
            },
            {
              title: "Corporate video",
              description: "Brand films, explainers, internal comms and event coverage.",
            },
            {
              title: "Photography",
              description: "Editorial, campaign, product and live event stills.",
            },
            {
              title: "Drone services",
              description: "Licensed pilots, aerial cinematography and survey work.",
            },
            {
              title: "Book production",
              description: "Editing, layout, cover design, print and distribution.",
            },
          ]}
        />
        <Button
          asChild
          className="mt-8 rounded-full bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90"
        >
          <Link to="/bookings">Request a production quote</Link>
        </Button>
      </Section>
    </>
  );
}
