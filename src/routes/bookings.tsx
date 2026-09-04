import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  CalendarCheck,
  Camera,
  CheckCircle2,
  Clapperboard,
  Clock3,
  MapPin,
  Mic2,
  Music2,
  PartyPopper,
  Phone,
  Users,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { z } from "zod";
import studioImg from "@/assets/studio.jpg";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FeatureGrid, PageHero, Section, SectionHeading } from "@/components/site/Primitives";
import { FormsWidget } from "@/components/site/FormsWidget";
import { useSubmitBooking } from "@/lib/api/hooks";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/bookings")({
  head: () => ({
    meta: [
      { title: "Bookings — Studio, Production, Artists & Equipment" },
      {
        name: "description",
        content:
          "Book X'Touch studios, production crews, artists, dancers, events and equipment rental in a few clicks.",
      },
      { property: "og:title", content: "X'Touch Bookings" },
      {
        property: "og:description",
        content: "Studio, production, artist, dance, event and equipment bookings.",
      },
    ],
  }),
  component: BookingsPage,
});

type Service = {
  name: string;
  description: string;
  placeholder: string;
  icon: LucideIcon;
};

const SERVICES: Service[] = [
  {
    name: "Production Booking",
    description: "Video, broadcast, photography and complete production crews.",
    placeholder:
      "Tell us what you are producing, the intended platforms, deliverables, crew requirements and deadline.",
    icon: Clapperboard,
  },
  {
    name: "Studio Booking",
    description: "Recording, podcast, rehearsal and content studios.",
    placeholder:
      "Tell us what you are recording, the studio setup you need, number of guests and any engineer requirements.",
    icon: Mic2,
  },
  {
    name: "Dance Booking",
    description: "Dancers, choreography, rehearsals and performances.",
    placeholder:
      "Describe the performance, number of dancers, rehearsal schedule, music and wardrobe requirements.",
    icon: Users,
  },
  {
    name: "Artist Booking",
    description: "Performers, DJs, presenters and appearances.",
    placeholder:
      "Share the event format, preferred artist or style, performance length, audience and technical rider.",
    icon: Music2,
  },
  {
    name: "Event Booking",
    description: "Planning, staging, sound and event production.",
    placeholder:
      "Describe the event, expected attendance, venue, programme, staging and technical requirements.",
    icon: PartyPopper,
  },
  {
    name: "Equipment Rental",
    description: "Cameras, lighting, sound, staging and operators.",
    placeholder:
      "List the equipment, quantities, collection or delivery needs, rental period and whether operators are required.",
    icon: Camera,
  },
];

const bookingSchema = z
  .object({
    name: z.string().trim().min(2, "Please enter your full name").max(100),
    email: z.string().trim().email("Enter a valid email address").max(255),
    phone: z
      .string()
      .trim()
      .max(30, "Phone number is too long")
      .refine((value) => !value || /^[+0-9()\-\s]+$/.test(value), "Enter a valid phone number"),
    date: z.string().trim().min(1, "Choose your preferred date"),
    time: z.string().trim().optional().default(""),
    location: z.string().trim().max(255).optional().default(""),
    duration: z.string().trim().max(80).optional().default(""),
    budget: z.string().trim().max(100).optional().default(""),
    attendees: z
      .string()
      .trim()
      .refine(
        (value) => !value || (/^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 100000),
        "Enter a number between 1 and 100,000",
      )
      .optional()
      .default(""),
    contactMethod: z.enum(["email", "phone", "whatsapp"]),
    details: z
      .string()
      .trim()
      .min(20, "Please add at least 20 characters about your project")
      .max(2000),
  })
  .superRefine((data, context) => {
    if (["phone", "whatsapp"].includes(data.contactMethod) && !data.phone) {
      context.addIssue({
        code: "custom",
        path: ["phone"],
        message: `Add a phone number for ${data.contactMethod === "whatsapp" ? "WhatsApp" : "phone"} replies`,
      });
    }
  });

function localToday() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function BookingsPage() {
  const { user } = useAuth();
  const [serviceName, setServiceName] = useState("Studio Booking");
  const [bookingOpen, setBookingOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [reference, setReference] = useState<string | null>(null);
  const submitBooking = useSubmitBooking();
  const service = useMemo(
    () => SERVICES.find((item) => item.name === serviceName) ?? SERVICES[1],
    [serviceName],
  );
  const minDate = localToday();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrors({});
    const form = event.currentTarget;
    const parsed = bookingSchema.safeParse(Object.fromEntries(new FormData(form)));
    if (!parsed.success) {
      const fieldErrors: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const field = String(issue.path[0] ?? "form");
        if (!fieldErrors[field]) fieldErrors[field] = issue.message;
      });
      setErrors(fieldErrors);
      toast.error(parsed.error.issues[0].message);
      requestAnimationFrame(() => {
        form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus();
      });
      return;
    }

    if (parsed.data.date < minDate) {
      setErrors({ date: "Preferred date cannot be in the past" });
      toast.error("Preferred date cannot be in the past");
      return;
    }

    try {
      const result = await submitBooking.mutateAsync({
        service_type: service.name,
        client_name: parsed.data.name,
        client_email: parsed.data.email,
        client_phone: parsed.data.phone || undefined,
        preferred_date: parsed.data.date,
        preferred_time: parsed.data.time || undefined,
        location: parsed.data.location || undefined,
        duration: parsed.data.duration || undefined,
        budget: parsed.data.budget || undefined,
        attendees: parsed.data.attendees ? Number(parsed.data.attendees) : undefined,
        contact_method: parsed.data.contactMethod,
        project_details: parsed.data.details,
      });
      setReference(result.reference);
      form.reset();
      toast.success("Booking request sent. We’ll confirm it shortly.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send the booking request");
    }
  }

  return (
    <>
      <PageHero
        eyebrow="Bookings"
        title="Book the crew, the room or the roster"
        description="One reliable request for studios, production teams, artists, dancers, events and equipment."
        image={studioImg}
      />

      <Section>
        <SectionHeading eyebrow="Services" title="What can we book for you?" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {SERVICES.map((item) => {
            const selected = item.name === service.name;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  setServiceName(item.name);
                  setReference(null);
                  setErrors({});
                  setBookingOpen(true);
                }}
                aria-pressed={selected}
                className={`group grid min-h-28 grid-cols-[auto_minmax(0,1fr)] gap-3 rounded-2xl border p-4 text-left transition ${
                  selected
                    ? "border-gold/60 bg-gold/10 shadow-gold"
                    : "border-border bg-card/35 hover:border-gold/35 hover:bg-card/60"
                }`}
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-2xl ${
                    selected ? "bg-gradient-gold text-primary-foreground" : "bg-gold/10 text-gold"
                  }`}
                >
                  <item.icon className="h-5 w-5" />
                </span>
                <span className="min-w-0">
                  <span className="block font-bold">{item.name}</span>
                  <span className="mt-1 block text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="mt-10">
          <aside className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start">
            <FeatureGrid
              items={[
                {
                  title: "Hourly or project",
                  description: "Rates by the hour, the day or the complete production.",
                },
                {
                  title: "Crew included",
                  description:
                    "Engineers, operators and assistants can be included in every booking.",
                },
                {
                  title: "Fast confirmation",
                  description: "Most complete requests are reviewed within one working day.",
                },
              ]}
            />
            <FormsWidget />
          </aside>

          <Dialog open={bookingOpen} onOpenChange={setBookingOpen}>
            <DialogContent className="max-h-[calc(100dvh-1rem)] w-[calc(100%-1rem)] max-w-3xl overflow-y-auto border-border bg-card p-0 sm:w-[calc(100%-2rem)]">
              <DialogTitle className="sr-only">{service.name} request</DialogTitle>
              <div className="overflow-hidden">
                <div className="border-b border-border bg-gold/5 p-5 pr-14 sm:p-7 sm:pr-16">
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-gold text-primary-foreground shadow-gold">
                      <service.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-gold">
                        Booking request
                      </p>
                      <h2 className="mt-1 text-2xl font-black">{service.name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">{service.description}</p>
                    </div>
                  </div>
                </div>

                {reference ? (
                  <div className="grid min-h-[430px] place-items-center p-6 text-center sm:p-10">
                    <div className="max-w-md">
                      <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
                        <CheckCircle2 className="h-8 w-8" />
                      </span>
                      <h3 className="mt-5 text-2xl font-black">Request received</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        The booking team will review your {service.name.toLowerCase()} request and
                        reply through your selected contact method.
                      </p>
                      <div className="mx-auto mt-5 rounded-2xl border border-gold/30 bg-gold/5 px-5 py-4">
                        <span className="block text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          Booking reference
                        </span>
                        <strong className="mt-1 block text-xl tracking-wider text-gold">
                          {reference}
                        </strong>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
                        Keep this reference when contacting the team.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setReference(null)}
                        className="mt-6 rounded-full border-border"
                      >
                        Make another booking
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form
                    className="grid min-w-0 gap-6 p-4 sm:gap-7 sm:p-7"
                    noValidate
                    onSubmit={handleSubmit}
                  >
                    <FormSection
                      icon={Phone}
                      title="Your contact details"
                      description="We use these details only to confirm and coordinate this request."
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Full name" name="name" error={errors.name} required>
                          <Input
                            id="booking-name"
                            name="name"
                            defaultValue={user?.name ?? ""}
                            autoComplete="name"
                            maxLength={100}
                            aria-invalid={Boolean(errors.name)}
                            className="h-11 rounded-xl border-border bg-background/60"
                          />
                        </Field>
                        <Field label="Email" name="email" error={errors.email} required>
                          <Input
                            id="booking-email"
                            name="email"
                            type="email"
                            defaultValue={user?.email ?? ""}
                            autoComplete="email"
                            maxLength={255}
                            aria-invalid={Boolean(errors.email)}
                            className="h-11 rounded-xl border-border bg-background/60"
                          />
                        </Field>
                        <Field label="Phone or WhatsApp" name="phone" error={errors.phone}>
                          <Input
                            id="booking-phone"
                            name="phone"
                            type="tel"
                            autoComplete="tel"
                            inputMode="tel"
                            maxLength={30}
                            placeholder="+234 …"
                            aria-invalid={Boolean(errors.phone)}
                            className="h-11 rounded-xl border-border bg-background/60"
                          />
                        </Field>
                        <Field
                          label="Preferred reply method"
                          name="contactMethod"
                          error={errors.contactMethod}
                          required
                        >
                          <Select name="contactMethod" defaultValue="email">
                            <SelectTrigger
                              id="booking-contactMethod"
                              className="h-11 rounded-xl border-border bg-background/60"
                            >
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="email">Email</SelectItem>
                              <SelectItem value="phone">Phone call</SelectItem>
                              <SelectItem value="whatsapp">WhatsApp</SelectItem>
                            </SelectContent>
                          </Select>
                        </Field>
                      </div>
                    </FormSection>

                    <FormSection
                      icon={CalendarCheck}
                      title="Schedule and location"
                      description="A preferred date helps the team check availability immediately."
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        <Field label="Preferred date" name="date" error={errors.date} required>
                          <Input
                            id="booking-date"
                            name="date"
                            type="date"
                            min={minDate}
                            aria-invalid={Boolean(errors.date)}
                            className="h-11 rounded-xl border-border bg-background/60"
                          />
                        </Field>
                        <Field label="Preferred time" name="time" error={errors.time}>
                          <Input
                            id="booking-time"
                            name="time"
                            type="time"
                            aria-invalid={Boolean(errors.time)}
                            className="h-11 rounded-xl border-border bg-background/60"
                          />
                        </Field>
                        <div className="sm:col-span-2">
                          <Field label="Venue or location" name="location" error={errors.location}>
                            <div className="relative">
                              <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                              <Input
                                id="booking-location"
                                name="location"
                                maxLength={255}
                                placeholder="Venue, city, studio or online"
                                aria-invalid={Boolean(errors.location)}
                                className="h-11 rounded-xl border-border bg-background/60 pl-9"
                              />
                            </div>
                          </Field>
                        </div>
                      </div>
                    </FormSection>

                    <FormSection
                      icon={Clock3}
                      title="Project scope"
                      description="Optional estimates help us prepare the right quote and crew."
                    >
                      <div className="grid gap-4 sm:grid-cols-3">
                        <Field label="Duration" name="duration" error={errors.duration}>
                          <Input
                            id="booking-duration"
                            name="duration"
                            maxLength={80}
                            placeholder="e.g. 4 hours"
                            aria-invalid={Boolean(errors.duration)}
                            className="h-11 rounded-xl border-border bg-background/60"
                          />
                        </Field>
                        <Field label="Estimated budget" name="budget" error={errors.budget}>
                          <Input
                            id="booking-budget"
                            name="budget"
                            maxLength={100}
                            placeholder="Currency + amount"
                            aria-invalid={Boolean(errors.budget)}
                            className="h-11 rounded-xl border-border bg-background/60"
                          />
                        </Field>
                        <Field label="People / audience" name="attendees" error={errors.attendees}>
                          <Input
                            id="booking-attendees"
                            name="attendees"
                            type="number"
                            inputMode="numeric"
                            min={1}
                            max={100000}
                            placeholder="Optional"
                            aria-invalid={Boolean(errors.attendees)}
                            className="h-11 rounded-xl border-border bg-background/60"
                          />
                        </Field>
                      </div>
                      <Field label="Project details" name="details" error={errors.details} required>
                        <Textarea
                          id="booking-details"
                          name="details"
                          rows={7}
                          minLength={20}
                          maxLength={2000}
                          placeholder={service.placeholder}
                          aria-invalid={Boolean(errors.details)}
                          className="resize-y rounded-xl border-border bg-background/60"
                        />
                        <p className="text-right text-[11px] text-muted-foreground">
                          Maximum 2,000 characters
                        </p>
                      </Field>
                    </FormSection>

                    <div className="rounded-2xl border border-border bg-background/30 p-4 text-xs leading-relaxed text-muted-foreground">
                      Sending this request does not create a payment or final reservation. The
                      booking team will confirm availability, requirements and pricing with you
                      first.
                    </div>

                    <Button
                      disabled={submitBooking.isPending}
                      className="h-12 rounded-full bg-gradient-gold font-semibold text-primary-foreground shadow-gold hover:opacity-90"
                    >
                      {submitBooking.isPending ? "Sending request…" : "Send booking request"}
                    </Button>
                  </form>
                )}
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Section>
    </>
  );
}

function FormSection({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="grid gap-4">
      <legend className="w-full">
        <span className="flex items-start gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-gold/10 text-gold">
            <Icon className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-bold">{title}</span>
            <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
              {description}
            </span>
          </span>
        </span>
      </legend>
      {children}
    </fieldset>
  );
}

function Field({
  label,
  name,
  error,
  required,
  children,
}: {
  label: string;
  name: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={`booking-${name}`}>
        {label} {required ? <span className="text-gold">*</span> : null}
      </Label>
      {children}
      {error ? (
        <p id={`booking-${name}-error`} className="text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
