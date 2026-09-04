import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Maximize2 } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import tvImg from "@/assets/tv.jpg";
import dancersImg from "@/assets/dancers.jpg";
import studioImg from "@/assets/studio.jpg";
import { Input } from "@/components/ui/input";
import { Section, PageHero } from "@/components/site/Primitives";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useGalleryItems } from "@/lib/api/hooks";
import { mediaUrl } from "@/lib/api/client";
import { EmbeddedVideo } from "@/components/site/EmbeddedVideo";

export const Route = createFileRoute("/gallery")({
  head: () => ({
    meta: [
      { title: "Media Gallery — X'Touch Photos & Videos" },
      {
        name: "description",
        content:
          "Browse X'Touch photo albums and video galleries from shows, shoots, studios and events.",
      },
      { property: "og:title", content: "X'Touch Media Gallery" },
      { property: "og:description", content: "Photos, videos and albums from across X'Touch." },
    ],
  }),
  component: GalleryPage,
});

const ITEMS = [
  { src: heroImg, title: "Gold Night arena", type: "Photos" },
  { src: tvImg, title: "Studio A build", type: "Photos" },
  { src: dancersImg, title: "Crew rehearsal", type: "Videos" },
  { src: studioImg, title: "Mix session", type: "Photos" },
  { src: dancersImg, title: "Academy showcase", type: "Videos" },
  { src: heroImg, title: "Crowd wide", type: "Photos" },
  { src: tvImg, title: "Newsroom set", type: "Albums" },
  { src: studioImg, title: "Podcast taping", type: "Albums" },
];

const FILTERS = ["All", "Photos", "Videos", "Albums"];

function GalleryPage() {
  const [filter, setFilter] = useState("All");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<{
    src: string;
    title: string;
    videoUrl?: string | null;
  } | null>(null);
  const { data: galleryItems } = useGalleryItems();

  const feedImages = (galleryItems ?? []).map((item) => ({
    src: mediaUrl(item.image_url)!,
    title: item.title || item.caption?.slice(0, 80) || "X'Touch gallery image",
    type: item.kind === "video" ? "Videos" : "Photos",
    category: item.category || "Photos",
    videoUrl: mediaUrl(item.video_url),
  }));

  const items = [
    ...feedImages,
    ...ITEMS.map((item) => ({ ...item, category: item.type, videoUrl: null })),
  ].filter(
    (i) =>
      (filter === "All" || i.type === filter) &&
      i.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="Every frame we keep"
        description="Photo albums and video galleries from shows, shoots, studios and the road."
        image={dancersImg}
      />
      <Section>
        <div className="mb-8 grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the gallery"
            aria-label="Search the gallery"
            className="h-11 rounded-full border-border bg-card/50"
          />
          <div className="flex gap-2 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
                  filter === f
                    ? "border-gold/50 bg-gold/10 text-gold"
                    : "border-border text-muted-foreground"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3 [&>*]:mb-5">
          {items.map((i, idx) => (
            <figure
              key={`${i.src}-${idx}`}
              className="glass card-hover group overflow-hidden rounded-3xl break-inside-avoid"
            >
              <button
                type="button"
                onClick={() => setSelected(i)}
                className="relative block w-full text-left"
              >
                <img
                  src={i.src}
                  alt={i.title}
                  loading="lazy"
                  width={1024}
                  height={768}
                  className="w-full object-cover"
                />
                <span className="absolute bottom-3 right-3 grid h-9 w-9 place-items-center rounded-full bg-black/70 text-white opacity-0 transition group-hover:opacity-100">
                  <Maximize2 className="h-4 w-4" />
                </span>
              </button>
              <figcaption className="flex items-center justify-between p-4 text-sm">
                <span className="truncate">{i.title}</span>
                <span className="shrink-0 text-xs uppercase tracking-widest text-gold">
                  {i.category}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
        <Dialog open={Boolean(selected)} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="max-w-6xl border-border bg-black/95 p-3">
            <DialogTitle className="sr-only">{selected?.title}</DialogTitle>
            {selected?.videoUrl ? (
              <EmbeddedVideo url={selected.videoUrl} title={selected.title} />
            ) : selected ? (
              <img
                src={selected.src}
                alt={selected.title}
                className="max-h-[85vh] w-full object-contain"
              />
            ) : null}
          </DialogContent>
        </Dialog>
      </Section>
    </>
  );
}
