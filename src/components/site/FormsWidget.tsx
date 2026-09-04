import { Link } from "@tanstack/react-router";
import {
  ChevronRight,
  Ticket,
  CalendarCheck,
  UploadCloud,
  Mail,
  type LucideIcon,
} from "lucide-react";
import { GlassCard } from "@/components/site/Primitives";

type QuickForm = {
  icon: LucideIcon;
  label: string;
  description: string;
  to: string;
};

const QUICK_FORMS: QuickForm[] = [
  {
    icon: Ticket,
    label: "Buy or sell a ticket",
    description: "Get a seat or list yours",
    to: "/events",
  },
  {
    icon: CalendarCheck,
    label: "Book a service",
    description: "Studio, crew, artists",
    to: "/bookings",
  },
  { icon: UploadCloud, label: "Upload your music", description: "Submit for review", to: "/music" },
  { icon: Mail, label: "Contact the team", description: "Bookings & press", to: "/contact" },
];

export function FormsWidget({ className = "" }: { className?: string }) {
  return (
    <GlassCard className={className}>
      <p className="text-xs uppercase tracking-[0.3em] text-gold">Quick actions</p>
      <ul className="mt-4 space-y-1">
        {QUICK_FORMS.map((f) => (
          <li key={f.label}>
            <Link
              to={f.to}
              className="flex items-center gap-3 rounded-2xl px-2 py-2.5 transition-colors hover:bg-accent"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-gold/10 text-gold">
                <f.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold">{f.label}</span>
                <span className="block truncate text-xs text-muted-foreground">
                  {f.description}
                </span>
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </GlassCard>
  );
}
