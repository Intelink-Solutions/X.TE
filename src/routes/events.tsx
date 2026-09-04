import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { QrCode, Ticket, CalendarDays, Tag, ExternalLink } from "lucide-react";
import heroImg from "@/assets/hero.jpg";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Section,
  SectionHeading,
  PageHero,
  GlassCard,
  FeatureGrid,
} from "@/components/site/Primitives";
import { AdPostCard } from "@/components/site/AdPostCard";
import { FormsWidget } from "@/components/site/FormsWidget";
import { addOrder, addListing, getListings, type TicketListing } from "@/lib/local-store";
import { useEvents, useSubmitTicketOrder, type Event } from "@/lib/api/hooks";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events & Tickets — X'Touch Entertainment" },
      {
        name: "description",
        content:
          "Upcoming X'Touch events, calendar, seat selection and QR ticket booking for concerts, showcases and afterparties.",
      },
      { property: "og:title", content: "X'Touch Events" },
      { property: "og:description", content: "Upcoming shows, tickets and seat selection." },
    ],
  }),
  component: EventsPage,
});

const orderSchema = z.object({
  buyer: z.string().trim().min(2, "Enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  quantity: z.coerce.number().int().min(1, "At least 1 ticket").max(10, "Max 10 per order"),
});

const listingSchema = z.object({
  event: z.string().trim().min(1, "Pick an event"),
  seat: z.string().trim().min(1, "Add seat / section info").max(120),
  price: z.string().trim().min(1, "Set a price").max(30),
  contact: z.string().trim().min(3, "Add a contact (email or phone)").max(120),
});

function BuyTicketDialog({ event }: { event: Event }) {
  const [open, setOpen] = useState(false);
  const submitOrder = useSubmitTicketOrder();

  async function handleBuy(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = orderSchema.safeParse(Object.fromEntries(fd));
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    try {
      await submitOrder.mutateAsync({
        event_id: event.id,
        buyer_name: parsed.data.buyer,
        buyer_email: parsed.data.email,
        quantity: parsed.data.quantity,
      });
      addOrder({
        id: crypto.randomUUID(),
        event: event.name,
        buyer: parsed.data.buyer,
        email: parsed.data.email,
        quantity: parsed.data.quantity,
        createdAt: new Date().toISOString(),
      });
      toast.success(
        `${parsed.data.quantity} ticket(s) for ${event.name} reserved — check your inbox`,
      );
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ticket order could not be completed");
    }
  }

  if (event.ticket_url) {
    return (
      <Button
        asChild
        className="col-span-2 shrink-0 rounded-full bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90 sm:col-span-1"
      >
        <a href={event.ticket_url} target="_blank" rel="noreferrer">
          <Ticket className="mr-2 h-4 w-4" /> Buy ticket{" "}
          <ExternalLink className="ml-2 h-3.5 w-3.5" />
        </a>
      </Button>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="col-span-2 shrink-0 rounded-full bg-gradient-gold text-primary-foreground shadow-gold hover:opacity-90 sm:col-span-1">
          <Ticket className="mr-2 h-4 w-4" /> Get tickets
        </Button>
      </DialogTrigger>
      <DialogContent className="border-border bg-background sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Buy tickets — {event.name}</DialogTitle>
        </DialogHeader>
        <form className="grid gap-4" onSubmit={handleBuy}>
          <div className="grid gap-2">
            <Label htmlFor="buyer">Full name</Label>
            <Input
              id="buyer"
              name="buyer"
              maxLength={100}
              className="rounded-xl border-border bg-background/60"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              maxLength={255}
              className="rounded-xl border-border bg-background/60"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="quantity">Number of tickets</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              min={1}
              max={10}
              defaultValue={1}
              className="rounded-xl border-border bg-background/60"
            />
          </div>
          <Button
            disabled={submitOrder.isPending}
            className="mt-2 rounded-full bg-gradient-gold font-semibold text-primary-foreground shadow-gold hover:opacity-90"
          >
            {submitOrder.isPending ? "Processing…" : "Confirm purchase"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function SellTicketForm({
  listings,
  onListed,
  events,
}: {
  listings: TicketListing[];
  onListed: (l: TicketListing[]) => void;
  events: { name: string }[];
}) {
  const [event, setEvent] = useState("");

  function handleSell(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const parsed = listingSchema.safeParse({
      event,
      seat: fd.get("seat"),
      price: fd.get("price"),
      contact: fd.get("contact"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    const listing: TicketListing = {
      id: crypto.randomUUID(),
      ...parsed.data,
      createdAt: new Date().toISOString(),
    };
    onListed(addListing(listing));
    toast.success("Your ticket is listed on the resale marketplace");
    form.reset();
    setEvent("");
  }

  return (
    <GlassCard>
      <h3 className="text-xl font-bold">List a ticket for resale</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Can&apos;t make it? Sell your ticket safely to another fan.
      </p>
      <form className="mt-6 grid gap-4" onSubmit={handleSell}>
        <div className="grid gap-2">
          <Label htmlFor="event">Event</Label>
          <Select value={event} onValueChange={setEvent}>
            <SelectTrigger id="event" className="rounded-xl border-border bg-background/60">
              <SelectValue placeholder="Choose an event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((e) => (
                <SelectItem key={e.name} value={e.name}>
                  {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="seat">Seat / section</Label>
          <Input
            id="seat"
            name="seat"
            maxLength={120}
            placeholder="e.g. VIP, Row C"
            className="rounded-xl border-border bg-background/60"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="price">Asking price</Label>
          <Input
            id="price"
            name="price"
            maxLength={30}
            placeholder="e.g. K300"
            className="rounded-xl border-border bg-background/60"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="contact">Contact (email or phone)</Label>
          <Input
            id="contact"
            name="contact"
            maxLength={120}
            className="rounded-xl border-border bg-background/60"
          />
        </div>
        <Button className="mt-2 rounded-full bg-gradient-gold font-semibold text-primary-foreground shadow-gold hover:opacity-90">
          List my ticket
        </Button>
      </form>

      {listings.length > 0 ? (
        <div className="mt-8 border-t border-border pt-6">
          <p className="text-xs uppercase tracking-[0.3em] text-gold">Resale marketplace</p>
          <ul className="mt-4 space-y-3">
            {listings.slice(0, 5).map((l) => (
              <li
                key={l.id}
                className="flex items-center gap-3 rounded-xl border border-border/60 p-3"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
                  <Tag className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-semibold">{l.event}</span>
                  <span className="block truncate text-xs text-muted-foreground">{l.seat}</span>
                </span>
                <span className="shrink-0 text-sm font-black text-gold">{l.price}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </GlassCard>
  );
}

function EventsPage() {
  const [listings, setListings] = useState<TicketListing[]>([]);
  const { data: rawEvents, isLoading: eventsLoading } = useEvents();
  const EVENTS = rawEvents ?? [];

  useEffect(() => {
    setListings(getListings());
  }, []);

  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Nights worth leaving the house for"
        description="Arena shows, studio sessions and academy showcases — with QR tickets and seat selection built in."
        image={heroImg}
      />
      <Section>
        <SectionHeading eyebrow="Calendar" title="Upcoming events" />
        {eventsLoading ? (
          <div className="flex items-center justify-center py-12 text-gold">
            <span className="mr-2 inline-block h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />{" "}
            Loading events...
          </div>
        ) : EVENTS.length === 0 ? (
          <div className="rounded-3xl border border-border bg-card/40 p-10 text-center text-sm text-muted-foreground">
            No upcoming events are scheduled yet.
          </div>
        ) : (
          <div className="grid gap-5">
            {EVENTS.map((e) => (
              <GlassCard
                key={e.name + e.venue}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
              >
                <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-gradient-gold text-center text-primary-foreground">
                  <span className="text-lg font-black leading-tight">
                    {new Date(e.starts_at).toLocaleDateString("en-ZM", {
                      day: "numeric",
                      month: "short",
                    })}
                  </span>
                </div>
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold">{e.name}</h3>
                  <p className="truncate text-sm text-muted-foreground">
                    {e.venue} · {e.price ? `from ${e.price}` : "Free / details TBC"}
                  </p>
                  <Badge
                    variant="outline"
                    className="mt-2 rounded-full border-gold/40 text-xs text-gold"
                  >
                    {e.status}
                  </Badge>
                </div>
                {e.price || e.ticket_url ? <BuyTicketDialog event={e} /> : null}
              </GlassCard>
            ))}
            <AdPostCard />
          </div>
        )}
      </Section>

      <Section>
        <SectionHeading eyebrow="Resale" title="Buy or sell a ticket" />
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <SellTicketForm listings={listings} onListed={setListings} events={EVENTS} />
          <div className="lg:sticky lg:top-24 lg:self-start">
            <FormsWidget />
          </div>
        </div>
      </Section>

      <Section>
        <SectionHeading eyebrow="Ticketing" title="How booking works" />
        <FeatureGrid
          items={[
            {
              title: "Seat selection",
              description: "Pick your exact seat or table from an interactive venue map.",
            },
            {
              title: "QR tickets",
              description: "Scannable tickets delivered instantly to your dashboard and inbox.",
            },
            {
              title: "Countdown & reminders",
              description: "Live countdowns and push reminders before doors open.",
            },
          ]}
        />
        <div className="mt-8 flex flex-wrap gap-6 text-sm text-muted-foreground">
          <span className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-gold" /> Full year calendar
          </span>
          <span className="flex items-center gap-2">
            <QrCode className="h-4 w-4 text-gold" /> Contactless entry
          </span>
        </div>
      </Section>
    </>
  );
}
