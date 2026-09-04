import { Facebook, Link2, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type BlogShareButtonsProps = {
  title: string;
  path?: string;
  excerpt?: string | null;
  compact?: boolean;
  className?: string;
};

export function BlogShareButtons({
  title,
  path,
  excerpt,
  compact = false,
  className,
}: BlogShareButtonsProps) {
  function shareUrl() {
    if (typeof window === "undefined") return path ?? "";
    return path ? new URL(path, window.location.origin).toString() : window.location.href;
  }

  function open(url: string) {
    window.open(url, "_blank", "noopener,noreferrer,width=720,height=620");
  }

  async function share() {
    const url = shareUrl();
    try {
      if (navigator.share) {
        await navigator.share({ title, text: excerpt ?? undefined, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      toast.success("Article link copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") return;
      toast.error("Could not share this article");
    }
  }

  const iconClass = "h-4 w-4";
  return (
    <div className={cn("flex flex-wrap items-center gap-1.5", className)}>
      <Button
        type="button"
        size={compact ? "icon" : "sm"}
        variant="outline"
        className="rounded-full border-border"
        aria-label="Share on Facebook"
        title="Share on Facebook"
        onClick={() =>
          open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl())}`)
        }
      >
        <Facebook className={iconClass} />
        {!compact && <span className="ml-2">Facebook</span>}
      </Button>
      <Button
        type="button"
        size={compact ? "icon" : "sm"}
        variant="outline"
        className="rounded-full border-border"
        aria-label="Share on X"
        title="Share on X"
        onClick={() =>
          open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl())}`,
          )
        }
      >
        <span className="text-sm font-black" aria-hidden="true">
          X
        </span>
        {!compact && <span className="ml-2">Share</span>}
      </Button>
      <Button
        type="button"
        size={compact ? "icon" : "sm"}
        variant="outline"
        className="rounded-full border-border"
        aria-label="Share on WhatsApp"
        title="Share on WhatsApp"
        onClick={() => open(`https://wa.me/?text=${encodeURIComponent(`${title} ${shareUrl()}`)}`)}
      >
        <MessageCircle className={iconClass} />
        {!compact && <span className="ml-2">WhatsApp</span>}
      </Button>
      <Button
        type="button"
        size={compact ? "icon" : "sm"}
        variant="ghost"
        className="rounded-full"
        aria-label="More sharing options"
        title="More sharing options"
        onClick={() => void share()}
      >
        {navigatorShareAvailable() ? (
          <Share2 className={iconClass} />
        ) : (
          <Link2 className={iconClass} />
        )}
        {!compact && <span className="ml-2">More</span>}
      </Button>
    </div>
  );
}

function navigatorShareAvailable() {
  return typeof navigator !== "undefined" && Boolean(navigator.share);
}
