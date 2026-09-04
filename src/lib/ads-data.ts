import { Megaphone, Ticket, Radio, ShoppingBag, Mic2, type LucideIcon } from "lucide-react";

export type Ad = {
  icon: LucideIcon;
  title: string;
  copy: string;
  cta: string;
  to: string;
};

export const ADS: Ad[] = [
  {
    icon: Megaphone,
    title: "Advertise with X'Touch",
    copy: "Put your brand in front of millions across TV, live streams and the app.",
    cta: "Get ad space",
    to: "/contact",
  },
  {
    icon: Ticket,
    title: "Gold Night — tickets moving fast",
    copy: "Arena show, 12 Sep. Secure your seat before prices go up.",
    cta: "Buy tickets",
    to: "/events",
  },
  {
    icon: Radio,
    title: "XTouch TV — watch anywhere",
    copy: "Live channel, 24/7 replays and pay-per-view specials.",
    cta: "Watch live",
    to: "/live",
  },
  {
    icon: ShoppingBag,
    title: "New drop: Gold Standard merch",
    copy: "Hoodies, snapbacks and tees — limited run, ships worldwide.",
    cta: "Shop now",
    to: "/store",
  },
  {
    icon: Mic2,
    title: "Got a track? Get heard.",
    copy: "Upload your music and reach the X'Touch audience.",
    cta: "Upload music",
    to: "/music",
  },
];
