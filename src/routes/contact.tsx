import { createFileRoute } from "@tanstack/react-router";
import { Mail, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import heroImg from "@/assets/hero.jpg";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section, PageHero, GlassCard } from "@/components/site/Primitives";
import { useSubmitContact } from "@/lib/api/hooks";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact X'Touch Entertainment" },
      {
        name: "description",
        content:
          "Get in touch with X'Touch Entertainment for bookings, partnerships, press and general enquiries.",
      },
      { property: "og:title", content: "Contact X'Touch" },
      { property: "og:description", content: "Bookings, partnerships, press and enquiries." },
    ],
  }),
  component: ContactPage,
});

const schema = z.object({
  name: z.string().trim().min(2, "Please enter your name").max(100),
  email: z.string().trim().email("Enter a valid email").max(255),
  message: z.string().trim().min(10, "Tell us a little more").max(1000),
});

function ContactPage() {
  const submitContact = useSubmitContact();

  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Let's make something loud"
        description="Bookings, partnerships, press or a question — the team reads everything."
        image={heroImg}
      />
      <Section>
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <div className="space-y-5">
            {[
              { icon: Mail, label: "xtouchentertainments@gmail.com.", sub: "General & bookings" },
              { icon: Phone, label: "+233 24 720 2340", sub: "Mon–Fri, 08:00–18:00" },
              { icon: MapPin, label: "X'Touch Entertainments House,", sub: " Accra Ghana" },
            ].map((c) => (
              <GlassCard
                key={c.label}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4"
              >
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-gradient-gold text-primary-foreground">
                  <c.icon className="h-4 w-4" />
                </span>
                <span className="min-w-0">
                  <span className="block break-words font-semibold">{c.label}</span>
                  <span className="block text-sm text-muted-foreground">{c.sub}</span>
                </span>
              </GlassCard>
            ))}
          </div>
          <GlassCard>
            <form
              className="grid gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget as HTMLFormElement;
                const parsed = schema.safeParse(Object.fromEntries(new FormData(form)));
                if (!parsed.success) {
                  toast.error(parsed.error.issues[0].message);
                  return;
                }
                submitContact.mutate(parsed.data, {
                  onSuccess: () => {
                    toast.success("Message sent — we'll be in touch.");
                    form.reset();
                  },
                  onError: () => toast.error("Failed to send message. Please try again."),
                });
              }}
            >
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  name="name"
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
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={6}
                  maxLength={1000}
                  className="rounded-xl border-border bg-background/60"
                />
              </div>
              <Button
                disabled={submitContact.isPending}
                className="mt-2 rounded-full bg-gradient-gold font-semibold text-primary-foreground shadow-gold hover:opacity-90"
              >
                {submitContact.isPending ? "Sending…" : "Send message"}
              </Button>
            </form>
          </GlassCard>
        </div>
      </Section>
    </>
  );
}
