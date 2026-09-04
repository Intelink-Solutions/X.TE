import type { FeedPost } from "./site-data";

export type AccountRole =
  "guest" | "member" | "approved_user" | "artist" | "podcaster" | "event_organizer";
export type ApprovalStatus = "unverified" | "pending" | "approved" | "rejected";

export type MusicUpload = {
  id: string;
  title: string;
  artist: string;
  genre: string;
  fileName: string;
  uploadedAt: string;
};

export type TicketListing = {
  id: string;
  event: string;
  seat: string;
  price: string;
  contact: string;
  createdAt: string;
};

export type TicketOrder = {
  id: string;
  event: string;
  buyer: string;
  email: string;
  quantity: number;
  createdAt: string;
};

export type StoreCartItem = {
  id: number;
  name: string;
  price: number;
  currency: string;
  imageUrl: string;
  quantity: number;
  stock: number | null;
};

export type Profile = {
  name: string;
  handle: string;
  bio: string;
  location: string;
  joined: string;
  accountRole: AccountRole;
  approvalStatus: ApprovalStatus;
};

const DEFAULT_PROFILE: Profile = {
  name: "Guest Fan",
  handle: "@guest",
  bio: "New here — tell the X'Touch community a bit about yourself.",
  location: "Accra, Ghana.",
  joined: "2026",
  accountRole: "guest",
  approvalStatus: "unverified",
};

const KEYS = {
  uploads: "xtouch:music-uploads",
  listings: "xtouch:ticket-listings",
  orders: "xtouch:ticket-orders",
  profile: "xtouch:profile",
  feedPosts: "xtouch:feed-posts",
  storeCart: "xtouch:store-cart",
  storeWishlist: "xtouch:store-wishlist",
} as const;

function read<T>(key: string): T[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}

function write<T>(key: string, items: T[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(items));
}

export function getUploads(): MusicUpload[] {
  return read<MusicUpload>(KEYS.uploads);
}

export function addUpload(upload: MusicUpload): MusicUpload[] {
  const items = [upload, ...getUploads()].slice(0, 50);
  write(KEYS.uploads, items);
  return items;
}

export function getListings(): TicketListing[] {
  return read<TicketListing>(KEYS.listings);
}

export function addListing(listing: TicketListing): TicketListing[] {
  const items = [listing, ...getListings()].slice(0, 50);
  write(KEYS.listings, items);
  return items;
}

export function getOrders(): TicketOrder[] {
  return read<TicketOrder>(KEYS.orders);
}

export function addOrder(order: TicketOrder): TicketOrder[] {
  const items = [order, ...getOrders()].slice(0, 50);
  write(KEYS.orders, items);
  return items;
}

export function getProfile(): Profile {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  try {
    const raw = window.localStorage.getItem(KEYS.profile);
    return raw ? { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<Profile>) } : DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

export function saveProfile(profile: Profile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEYS.profile, JSON.stringify(profile));
}

export function canPublishToFeed(profile: Profile): boolean {
  return (
    profile.approvalStatus === "approved" &&
    ["approved_user", "artist", "podcaster", "event_organizer"].includes(profile.accountRole)
  );
}

export function getLocalFeedPosts(): FeedPost[] {
  return read<FeedPost>(KEYS.feedPosts);
}

export function addLocalFeedPost(post: FeedPost): FeedPost[] {
  const items = [post, ...getLocalFeedPosts()].slice(0, 100);
  write(KEYS.feedPosts, items);
  return items;
}

export function getStoreCart(): StoreCartItem[] {
  return read<StoreCartItem>(KEYS.storeCart);
}

export function saveStoreCart(items: StoreCartItem[]) {
  write(KEYS.storeCart, items.slice(0, 100));
}

export function getStoreWishlist(): number[] {
  return read<number>(KEYS.storeWishlist);
}

export function saveStoreWishlist(ids: number[]) {
  write(KEYS.storeWishlist, Array.from(new Set(ids)).slice(0, 100));
}

export function triggerDownload(url: string, filename: string) {
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}
