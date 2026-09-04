import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader } from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import tvImg from "@/assets/tv.jpg";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Section, SectionHeading, PageHero, GlassCard } from "@/components/site/Primitives";
import { useCareers, useSubmitContact } from "@/lib/api/hooks";

export const Route = createFileRoute("/careers")({
  head: () => ({
    meta: [
      { title: "Careers — Work at X'Touch Entertainment" },
      {
        name: "description",
        content:
          "Open roles at X'Touch Entertainment across production, broadcast, music, engineering and media.",
      },
      { property: "og:title", content: "Careers at X'Touch" },
      { property: "og:description", content: "Join the team building African entertainment." },
    ],
  }),
  component: CareersPage,
});

const applicationSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  email: z.string().trim().email("Enter a valid email address").max(255),
  phone: z.string().trim().max(40).optional(),
  portfolio: z.string().trim().max(255).optional(),
  message: z.string().trim().min(30, "Tell us a little more about your experience").max(1000),
});

type CareerRole = { title: string; team: string; type: string };

function CareersPage() {
  const { data: raw, isLoading } = useCareers();
  const submitApplication = useSubmitContact();
  const [selectedRole, setSelectedRole] = useState<CareerRole | null>(null);
  const ROLES: CareerRole[] = (raw ?? []).map((role) => ({
    title: role.title,
    team: role.department,
    type: `${role.type} · Accra, Ghana`,
  }));

  return (
    <>
      <PageHero
        eyebrow="Careers"
        title="Build the next chapter with us"
        description="We hire people who can make things — cameras, code, choreography, sound and stories."
        image={tvImg}
      />
      <Section>
        <SectionHeading eyebrow="Careers" title="Available rolles" />
        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-gold">
            <Loader className="mr-2 h-5 w-5 animate-spin" /> Checking available roles…
          </div>
        ) : ROLES.length === 0 ? (
          <GlassCard className="mx-auto max-w-2xl p-10 text-center">
            <h3 className="text-xl font-black">There are no available rolles at the moment</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Future opportunities will be based in Accra, Ghana and published on this page.
            </p>
          </GlassCard>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES.map((r) => (
              <GlassCard key={r.title}>
                <p className="text-xs uppercase tracking-[0.25em] text-gold">{r.team}</p>
                <h3 className="mt-2 text-lg font-bold">{r.title}</h3>
                <p className="text-sm text-muted-foreground">{r.type}</p>
                <Button
                  onClick={() => setSelectedRole(r)}
                  variant="outline"
                  size="sm"
                  className="mt-4 rounded-full border-border"
                >
                  Apply
                </Button>
              </GlassCard>
            ))}
          </div>
        )}
      </Section>
      <Dialog open={Boolean(selectedRole)} onOpenChange={(open) => !open && setSelectedRole(null)}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Apply for {selectedRole?.title}</DialogTitle>
            <DialogDescription>
              Send your details to the X&apos;Touch team. We will reply by email if your experience
              matches the role.
            </DialogDescription>
          </DialogHeader>
          <form
            className="grid gap-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!selectedRole) return;
              const form = event.currentTarget;
              const parsed = applicationSchema.safeParse(Object.fromEntries(new FormData(form)));
              if (!parsed.success) {
                toast.error(parsed.error.issues[0].message);
                return;
              }

              const { name, email, phone, portfolio, message } = parsed.data;
              submitApplication.mutate(
                {
                  name,
                  email,
                  phone: phone || undefined,
                  subject: `Career application — ${selectedRole.title}`,
                  message: [
                    `Role: ${selectedRole.title}`,
                    `Team: ${selectedRole.team}`,
                    `Work type: ${selectedRole.type}`,
                    portfolio ? `Portfolio: ${portfolio}` : null,
                    "",
                    message,
                  ]
                    .filter((line) => line !== null)
                    .join("\n"),
                },
                {
                  onSuccess: () => {
                    toast.success("Application sent. The team will contact you by email.");
                    form.reset();
                    setSelectedRole(null);
                  },
                  onError: () =>
                    toast.error("We could not send the application. Please try again."),
                },
              );
            }}
          >
            <div className="grid gap-2">
              <Label htmlFor="career-name">Full name</Label>
              <Input id="career-name" name="name" autoComplete="name" maxLength={100} required />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div className="grid gap-2">
                <Label htmlFor="career-email">Email</Label>
                <Input id="career-email" name="email" type="email" autoComplete="email" required />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="career-phone">Phone (optional)</Label>
                <Input
                  id="career-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={40}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="career-portfolio">Portfolio or profile URL (optional)</Label>
              <Input id="career-portfolio" name="portfolio" type="url" maxLength={255} />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="career-message">Experience and cover note</Label>
              <Textarea id="career-message" name="message" rows={6} maxLength={1000} required />
            </div>
            <Button
              type="submit"
              disabled={submitApplication.isPending}
              className="rounded-full bg-gradient-gold font-semibold text-primary-foreground"
            >
              {submitApplication.isPending && <Loader className="mr-2 h-4 w-4 animate-spin" />}
              {submitApplication.isPending ? "Sending…" : "Send application"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
