import { useEffect, useState } from "react";
import {
  BadgeCheck,
  Bell,
  CalendarCheck,
  CheckCheck,
  MessageSquareText,
  Music2,
  Newspaper,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  type SiteNotification,
} from "@/lib/api/hooks";
import { mediaUrl } from "@/lib/api/client";

function NotificationIcon({ type, icon }: { type?: string; icon?: string }) {
  if (type?.endsWith("_approved") || icon === "check") return <BadgeCheck className="h-4 w-4" />;
  if (icon === "music") return <Music2 className="h-4 w-4" />;
  if (type === "booking") return <CalendarCheck className="h-4 w-4" />;
  if (type === "contact") return <MessageSquareText className="h-4 w-4" />;
  return <Newspaper className="h-4 w-4" />;
}

function NotificationVisual({ item }: { item: SiteNotification }) {
  const image = mediaUrl(item.data.image_url);
  const [failed, setFailed] = useState(false);

  useEffect(() => setFailed(false), [image]);

  if (image && !failed) {
    return (
      <img
        src={image}
        alt=""
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className="h-11 w-11 rounded-xl object-cover"
      />
    );
  }

  return (
    <span className="grid h-11 w-11 place-items-center rounded-xl bg-gold/10 text-gold">
      <NotificationIcon type={item.data.type} icon={item.data.icon} />
    </span>
  );
}

function NotificationItem({ item }: { item: SiteNotification }) {
  const markRead = useMarkNotificationRead();
  const destination = item.data.url ?? "/news-feed";

  return (
    <a
      href={destination}
      onClick={() => {
        if (!item.read_at) markRead.mutate(item.id);
      }}
      className={`grid grid-cols-[auto_minmax(0,1fr)] gap-3 border-b border-border/70 p-4 transition hover:bg-accent/70 ${
        item.read_at ? "opacity-70" : "bg-gold/5"
      }`}
    >
      <NotificationVisual item={item} />
      <span className="min-w-0">
        <span className="flex items-start gap-2">
          <span className="min-w-0 flex-1 truncate text-sm font-bold">{item.data.title}</span>
          {!item.read_at ? <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-gold" /> : null}
        </span>
        <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
          {item.data.message}
        </span>
        <span className="mt-2 block text-[11px] text-gold">
          {new Date(item.created_at).toLocaleString()}
        </span>
      </span>
    </a>
  );
}

export function NotificationCenter() {
  const { data, isLoading } = useNotifications(true);
  const markAll = useMarkAllNotificationsRead();
  const unread = data?.unread_count ?? 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={unread ? `${unread} unread notifications` : "Notifications"}
          title="Notifications"
          className="relative rounded-full"
        >
          <Bell className="h-4 w-4" />
          {unread ? (
            <span className="absolute -right-0.5 -top-0.5 grid min-h-4 min-w-4 place-items-center rounded-full bg-gold px-1 text-[9px] font-black text-primary-foreground">
              {unread > 99 ? "99+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={10}
        className="w-[min(24rem,calc(100vw-1rem))] overflow-hidden border-border bg-popover p-0 shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
          <span>
            <span className="block text-sm font-black">Notifications</span>
            <span className="block text-[11px] text-muted-foreground">
              {unread ? `${unread} unread` : "You're all caught up"}
            </span>
          </span>
          {unread ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={markAll.isPending}
              onClick={() => markAll.mutate()}
              className="h-8 rounded-full text-xs text-gold"
            >
              <CheckCheck className="mr-1.5 h-3.5 w-3.5" /> Mark all read
            </Button>
          ) : null}
        </div>
        <ScrollArea className="h-[min(28rem,70vh)]">
          {isLoading ? (
            <div className="space-y-3 p-4">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-16 animate-pulse rounded-xl bg-accent" />
              ))}
            </div>
          ) : data?.data.length ? (
            data.data.map((item) => <NotificationItem key={item.id} item={item} />)
          ) : (
            <div className="grid place-items-center px-6 py-12 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/50" />
              <p className="mt-3 text-sm font-semibold">No notifications yet</p>
              <p className="mt-1 text-xs text-muted-foreground">
                New feed updates and account activity will appear here.
              </p>
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
