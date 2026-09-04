import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader } from "lucide-react";
import tvImg from "@/assets/tv.jpg";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Section, SectionHeading, PageHero, GlassCard } from "@/components/site/Primitives";
import { FormsWidget } from "@/components/site/FormsWidget";
import { AdPostCard } from "@/components/site/AdPostCard";
import { BlogShareButtons } from "@/components/site/BlogShareButtons";
import { useBlogPosts } from "@/lib/api/hooks";
import { mediaUrl } from "@/lib/api/client";

export const Route = createFileRoute("/blog")({
  head: () => ({
    meta: [
      { title: "Blog — Stories from X'Touch Entertainment" },
      {
        name: "description",
        content:
          "Industry essays, craft breakdowns and culture writing from the X'Touch newsroom, with categories, tags and archives.",
      },
      { property: "og:title", content: "The X'Touch Blog" },
      { property: "og:description", content: "Essays and breakdowns from inside the studio." },
    ],
  }),
  component: BlogPage,
});

const CATEGORIES = ["All", "Industry", "Craft", "Technology", "Culture"];

function BlogPage() {
  const [cat, setCat] = useState("All");
  const [query, setQuery] = useState("");
  const { data: blogData, isLoading } = useBlogPosts();
  const allPosts = (blogData?.data ?? []).map((b) => ({
    slug: b.slug ?? String(b.id),
    title: b.title,
    excerpt: b.excerpt ?? b.body ?? "",
    category: b.category ?? "General",
    date: b.published_at
      ? new Date(b.published_at).toLocaleDateString("en-ZM", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "Recently",
    read: b.read_time ?? "3 min read",
    author: b.author ?? "Editorial",
    image_url: mediaUrl(b.image_url) ?? tvImg,
  }));

  const posts = allPosts.filter(
    (p) =>
      (cat === "All" || p.category === cat) &&
      (p.title + p.excerpt).toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <>
      <PageHero
        eyebrow="Blog"
        title="Stories from inside the studio"
        description="How the work actually gets made — the industry, the craft, the technology and the culture around it."
        image={tvImg}
      />
      <Section>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0">
            <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`shrink-0 rounded-full border px-4 py-2 text-sm transition-colors ${
                    cat === c
                      ? "border-gold/50 bg-gold/10 text-gold"
                      : "border-border text-muted-foreground"
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center py-12 text-gold">
                <Loader className="mr-2 h-5 w-5 animate-spin" /> Loading articles...
              </div>
            ) : posts.length === 0 ? (
              <p className="glass rounded-3xl p-10 text-center text-sm text-muted-foreground">
                No articles match that search.
              </p>
            ) : (
              <div className="grid gap-5">
                {posts.map((p) => (
                  <GlassCard key={p.slug} className="group overflow-hidden p-0">
                    <Link to="/blog/$slug" params={{ slug: p.slug }}>
                      <img
                        src={p.image_url}
                        alt={p.title}
                        loading="lazy"
                        width={1024}
                        height={768}
                        className="h-52 w-full object-cover"
                      />
                    </Link>
                    <div className="p-6">
                      <p className="text-xs uppercase tracking-[0.25em] text-gold">
                        {p.category} · {p.date} · {p.read} read
                      </p>
                      <h2 className="mt-3 text-2xl font-black transition group-hover:text-gold">
                        <Link to="/blog/$slug" params={{ slug: p.slug }}>
                          {p.title}
                        </Link>
                      </h2>
                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {p.excerpt}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <Button asChild variant="link" className="h-auto p-0 text-gold">
                          <Link to="/blog/$slug" params={{ slug: p.slug }}>
                            Read full article
                          </Link>
                        </Button>
                        <BlogShareButtons
                          title={p.title}
                          excerpt={p.excerpt}
                          path={`/blog/${p.slug}`}
                          compact
                        />
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            )}
          </div>

          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search articles"
              aria-label="Search articles"
              className="h-11 rounded-full border-border bg-card/50"
            />
            <FormsWidget />
            <GlassCard>
              <p className="text-xs uppercase tracking-[0.3em] text-gold">Popular</p>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                {allPosts.slice(0, 6).map((p) => (
                  <li key={p.slug}>
                    <Link
                      to="/blog/$slug"
                      params={{ slug: p.slug }}
                      className="line-clamp-2 transition hover:text-gold"
                    >
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </GlassCard>
            <GlassCard>
              <p className="text-xs uppercase tracking-[0.3em] text-gold">Archives</p>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                {["July 2026", "June 2026", "May 2026", "April 2026"].map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </GlassCard>
          </aside>
        </div>
      </Section>
      <Section>
        <SectionHeading eyebrow="Tags" title="Browse by tag" />
        <div className="flex flex-wrap gap-2">
          {[
            "#production",
            "#streaming",
            "#afrobeats",
            "#dance",
            "#television",
            "#business",
            "#studio",
          ].map((t) => (
            <span
              key={t}
              className="rounded-full border border-border px-4 py-2 text-sm text-muted-foreground"
            >
              {t}
            </span>
          ))}
        </div>
      </Section>
    </>
  );
}
