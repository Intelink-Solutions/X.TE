import { createFileRoute } from "@tanstack/react-router";
import heroImg from "@/assets/hero.jpg";
import {
  Section,
  SectionHeading,
  PageHero,
  FeatureGrid,
  GlassCard,
} from "@/components/site/Primitives";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About X'Touch Entertainment — Our Story & Divisions" },
      {
        name: "description",
        content:
          "X'Touch Entertainment is a television, music, production and live events group building the future of African entertainment.",
      },
      { property: "og:title", content: "About X'Touch Entertainment" },
      {
        property: "og:description",
        content: "One group: TV, music, production, dancers, events and media.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="One group. Every stage of the story."
        description="From the writers' room to the arena floor, X'Touch owns the full pipeline — production, distribution and the audience that shows up."
        image={heroImg}
      />
      <Section>
        <SectionHeading eyebrow="Divisions" title="What we run" />
        <FeatureGrid
          items={[
            {
              title: "XTouch TV",
              description: "A 24/7 channel with live news, music and culture programming.",
            },
            {
              title: "XTouch Music",
              description: "A label and streaming catalogue for the continent's boldest sound.",
            },
            {
              title: "XTouch Production",
              description: "Film, commercials, music videos, photography and drone.",
            },
            {
              title: "XTouch Dancers",
              description: "An award-winning crew and a training academy behind it.",
            },
            {
              title: "XTouch Live",
              description: "Multi-camera streaming, pay-per-view and event broadcast.",
            },
            {
              title: "XTouch Media",
              description: "Newsroom, blog, podcast and the social feed that ties it together.",
            },
          ]}
        />
      </Section>
      <Section>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            ["2014", "Founded as a two-camera production crew."],
            ["2019", "First national broadcast partnership and label launch."],
            ["2026", "Full digital HQ: TV, music, feed, store and bookings."],
          ].map(([year, text]) => (
            <GlassCard key={year}>
              <p className="text-3xl font-black text-gradient-gold">{year}</p>
              <p className="mt-3 text-sm text-muted-foreground">{text}</p>
            </GlassCard>
          ))}
        </div>
      </Section>
    </>
  );
}
