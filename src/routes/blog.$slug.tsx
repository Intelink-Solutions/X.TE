import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, CalendarDays, Clock3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Section, GlassCard } from "@/components/site/Primitives";
import { useBlogPost } from "@/lib/api/hooks";
import { mediaUrl } from "@/lib/api/client";
import { BlogShareButtons } from "@/components/site/BlogShareButtons";

export const Route = createFileRoute("/blog/$slug")({
  component: BlogArticlePage,
});

function BlogArticlePage() {
  const { slug } = Route.useParams();
  const { data: post, isLoading, isError } = useBlogPost(slug);

  if (isLoading) return <Section className="py-20 text-center text-gold">Loading article…</Section>;
  if (isError || !post)
    return (
      <Section className="py-20 text-center">
        <h1 className="text-3xl font-black">Article not found</h1>
        <Button asChild variant="link">
          <Link to="/blog">Back to the blog</Link>
        </Button>
      </Section>
    );

  return (
    <Section className="pt-8 sm:pt-12">
      <article className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between gap-4">
          <Button asChild variant="ghost" className="rounded-full">
            <Link to="/blog">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Blog
            </Link>
          </Button>
          <BlogShareButtons title={post.title} excerpt={post.excerpt} compact />
        </div>
        <div className="mt-8 text-center">
          <Badge variant="outline" className="rounded-full border-gold/40 text-gold">
            {post.category}
          </Badge>
          <h1 className="mx-auto mt-5 max-w-3xl text-3xl font-black leading-tight sm:text-5xl">
            {post.title}
          </h1>
          <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <span>{post.author ?? "X'Touch Editorial"}</span>
            {post.published_at ? (
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4" />
                {new Date(post.published_at).toLocaleDateString()}
              </span>
            ) : null}
            {post.read_time ? (
              <span className="flex items-center gap-1.5">
                <Clock3 className="h-4 w-4" />
                {post.read_time}
              </span>
            ) : null}
          </div>
        </div>
        {post.image_url ? (
          <img
            src={mediaUrl(post.image_url)!}
            alt={post.title}
            className="mt-8 aspect-video w-full rounded-3xl object-cover"
          />
        ) : null}
        <GlassCard className="mt-8 overflow-hidden p-5 sm:p-10">
          <p className="text-lg font-medium leading-relaxed text-muted-foreground">
            {post.excerpt}
          </p>
          <div className="mt-7 break-words whitespace-pre-wrap text-base leading-8 text-foreground/90 sm:text-lg sm:leading-9">
            {post.body || post.excerpt}
          </div>
          {post.tags?.length ? (
            <div className="mt-8 flex flex-wrap gap-2 border-t border-border pt-6">
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="rounded-full">
                  #{tag}
                </Badge>
              ))}
            </div>
          ) : null}
          <div className="mt-8 border-t border-border pt-6">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.24em] text-gold">
              Share this article
            </p>
            <BlogShareButtons title={post.title} excerpt={post.excerpt} />
          </div>
        </GlassCard>
      </article>
    </Section>
  );
}
