import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import { analyticsSessionId } from "@/lib/analytics";

// ── Types ──────────────────────────────────────────────────────────────────
export type Artist = {
  id: number;
  user_id?: number | null;
  name: string;
  slug: string;
  role: string;
  genre: string | null;
  monthly_listeners: string | null;
  bio: string | null;
  image_url: string | null;
  instagram_url: string | null;
  spotify_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  followers_count?: number;
};
export type Track = {
  id: number;
  artist_id: number;
  title: string;
  album: string | null;
  duration: string | null;
  plays: string | null;
  cover_url: string | null;
  audio_url: string | null;
  stream_url: string | null;
  download_url: string | null;
  likes_count: number;
  is_liked?: boolean;
  downloads?: number;
  is_featured: boolean;
  artist?: Artist;
};
export type Event = {
  id: number;
  name: string;
  slug: string;
  venue: string;
  starts_at: string;
  price: string | null;
  ticket_url?: string | null;
  image_url?: string | null;
  description?: string | null;
  status: string;
  is_active: boolean;
};
export type FeedPost = {
  id: number | string;
  user_id?: number | null;
  track_id?: number | null;
  author_type?: string | null;
  author: string;
  handle: string;
  verified: boolean;
  category: string;
  kind: string;
  text: string;
  hashtags: string[] | null;
  tags: string[] | null;
  location: string | null;
  image_key: string | null;
  image_url?: string | null;
  media_url?: string | null;
  title?: string | null;
  event_date?: string | null;
  venue?: string | null;
  ticket_price?: string | null;
  ticket_url?: string | null;
  poll_options: { option: string; percent: number; votes?: number }[] | null;
  likes: number;
  comments: number;
  shares: number;
  reposts: number;
  views: string;
  is_pinned: boolean;
  approval_status?: "pending" | "approved" | "rejected";
  created_at?: string | null;
};
export type CreateFeedPostInput = {
  author: string;
  handle: string;
  category: string;
  kind: string;
  text: string;
  hashtags: string[];
  tags?: string[];
  location?: string;
  image_url?: string;
  media_url?: string;
  title?: string;
  event_date?: string;
  venue?: string;
  ticket_price?: string;
  ticket_url?: string;
};
export type TvSchedule = {
  id: number;
  show_name: string;
  time: string;
  tag: string;
  is_live: boolean;
  stream_url?: string | null;
  stream_provider?: "youtube" | "facebook" | "tiktok" | "instagram" | "direct" | null;
  description?: string | null;
  starts_at?: string | null;
  ends_at?: string | null;
};
export type BlogPost = {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string;
  body?: string | null;
  author?: string | null;
  image_url?: string | null;
  tags?: string[] | null;
  read_time: string | null;
  published_at: string | null;
  is_featured: boolean;
};
export type PodcastEpisode = {
  id: number;
  title: string;
  slug: string;
  episode_number: number | null;
  guest: string | null;
  description: string | null;
  duration: string | null;
  cover_url: string | null;
  published_at: string | null;
  is_featured: boolean;
  audio_url?: string | null;
  video_url?: string | null;
  approval_status?: string;
};
export type GalleryItem = {
  id: number | string;
  title: string | null;
  category: string | null;
  image_url: string;
  video_url?: string | null;
  kind: "photo" | "video";
  caption?: string | null;
};
export type Career = {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  salary_range: string | null;
  closes_at: string | null;
};
export type Dancer = {
  id: number;
  name: string;
  slug: string;
  role: string | null;
  speciality: string | null;
  bio: string | null;
  image_url: string | null;
};
export type StoreProduct = {
  id: number;
  name: string;
  slug: string;
  category: string | null;
  description: string | null;
  price: string;
  currency: string;
  image_url: string | null;
  stock: number;
};

// Paginated wrapper
export type Paginated<T> = { data: T[]; current_page: number; last_page: number; total: number };

// ── Queries ────────────────────────────────────────────────────────────────
export const useArtists = () =>
  useQuery({ queryKey: ["artists"], queryFn: () => apiFetch<Artist[]>("/artists") });
export const useArtist = (id: number) =>
  useQuery({
    queryKey: ["artists", id],
    queryFn: () => apiFetch<Artist & { tracks: Track[] }>(`/artists/${id}`),
  });
export const useTracks = () =>
  useQuery({ queryKey: ["tracks"], queryFn: () => apiFetch<Track[]>("/tracks") });
export const useEvents = () =>
  useQuery({ queryKey: ["events"], queryFn: () => apiFetch<Event[]>("/events") });
export const useFeedPosts = (params?: string) =>
  useQuery({
    queryKey: ["feed-posts", params],
    queryFn: () => apiFetch<Paginated<FeedPost>>(`/feed-posts${params ? `?${params}` : ""}`),
  });
export const useTvSchedules = () =>
  useQuery({ queryKey: ["tv-schedules"], queryFn: () => apiFetch<TvSchedule[]>("/tv-schedules") });

export type LiveChatMessage = {
  id: number;
  tv_schedule_id: number | null;
  body: string;
  created_at: string;
  user: { id: number; name: string };
};

export const useLiveChatMessages = (tvScheduleId?: number | null) =>
  useQuery({
    queryKey: ["live-chat-messages", tvScheduleId ?? null],
    queryFn: () =>
      apiFetch<LiveChatMessage[]>(
        `/live-chat/messages${tvScheduleId ? `?tv_schedule_id=${tvScheduleId}` : ""}`,
      ),
    refetchInterval: 4_000,
  });

export const useSendLiveChatMessage = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: { tv_schedule_id?: number; body: string }) =>
      apiFetch<LiveChatMessage>("/live-chat/messages", {
        method: "POST",
        body: JSON.stringify(data),
      }),
    onSuccess: (message) =>
      client.invalidateQueries({
        queryKey: ["live-chat-messages", message.tv_schedule_id ?? null],
      }),
  });
};
export const useBlogPosts = (params?: string) =>
  useQuery({
    queryKey: ["blog-posts", params],
    queryFn: () => apiFetch<Paginated<BlogPost>>(`/blog-posts${params ? `?${params}` : ""}`),
  });
export const useBlogPost = (slug: string) =>
  useQuery({
    queryKey: ["blog-posts", slug],
    queryFn: () => apiFetch<BlogPost>(`/blog-posts/${slug}`),
    enabled: Boolean(slug),
  });
export const usePodcastEpisodes = () =>
  useQuery({
    queryKey: ["podcast-episodes"],
    queryFn: () => apiFetch<Paginated<PodcastEpisode>>("/podcast-episodes"),
  });
export const useGalleryItems = () =>
  useQuery({ queryKey: ["gallery"], queryFn: () => apiFetch<GalleryItem[]>("/gallery") });
export const useCareers = () =>
  useQuery({ queryKey: ["careers"], queryFn: () => apiFetch<Career[]>("/careers") });
export const useDancers = () =>
  useQuery({ queryKey: ["dancers"], queryFn: () => apiFetch<Dancer[]>("/dancers") });
export const useStoreProducts = (params?: string) =>
  useQuery({
    queryKey: ["store-products", params],
    queryFn: () =>
      apiFetch<Paginated<StoreProduct>>(`/store-products${params ? `?${params}` : ""}`),
  });
export const useTicketListings = () =>
  useQuery({
    queryKey: ["ticket-listings"],
    queryFn: () =>
      apiFetch<
        { id: number; seat_info: string; asking_price: string; contact: string; event?: Event }[]
      >("/ticket-listings"),
  });

export const useCreateFeedPost = () =>
  useMutation({
    mutationFn: (data: FormData) =>
      apiFetch<FeedPost>("/feed-posts", { method: "POST", body: data }),
  });

export const useBookmarks = (enabled = false) =>
  useQuery({
    queryKey: ["bookmarks"],
    queryFn: () => apiFetch<Paginated<{ id: number; feed_post: FeedPost }>>("/bookmarks"),
    enabled,
  });

export const useReportFeedPost = () =>
  useMutation({
    mutationFn: ({
      id,
      reason,
      details,
    }: {
      id: number | string;
      reason: string;
      details?: string;
    }) =>
      apiFetch(`/feed-posts/${id}/reports`, {
        method: "POST",
        body: JSON.stringify({ reason, details }),
      }),
  });

export const useSubmitTrack = () =>
  useMutation({
    mutationFn: (data: FormData) =>
      apiFetch<Track>("/track-submissions", { method: "POST", body: data }),
  });

export const useSubmitPodcast = () =>
  useMutation({
    mutationFn: (data: FormData) =>
      apiFetch<PodcastEpisode>("/podcast-submissions", { method: "POST", body: data }),
  });

export const useToggleTrackLike = () =>
  useMutation({
    mutationFn: (id: number) =>
      apiFetch<{ liked: boolean; likes_count: number }>(`/tracks/${id}/like`, { method: "POST" }),
  });

export const useToggleFeedPostLike = () =>
  useMutation({
    mutationFn: (id: number | string) =>
      apiFetch<{ liked: boolean; likes_count: number }>(`/feed-posts/${id}/like`, {
        method: "POST",
      }),
  });

export type FeedPostEngagement = {
  liked: boolean;
  saved: boolean;
  reposted: boolean;
  likes_count: number;
  comments_count: number;
  shares_count: number;
  reposts_count: number;
  views: string;
};

export const useFeedPostEngagement = (id: number | string, enabled = false) =>
  useQuery({
    queryKey: ["feed-post-engagement", id],
    queryFn: () => apiFetch<FeedPostEngagement>(`/feed-posts/${id}/engagement`),
    enabled,
  });

export const useToggleFeedPostBookmark = () =>
  useMutation({
    mutationFn: (id: number | string) =>
      apiFetch<{ saved: boolean; bookmarks_count: number }>(`/feed-posts/${id}/bookmark`, {
        method: "POST",
      }),
  });

export const useToggleFeedPostRepost = () =>
  useMutation({
    mutationFn: (id: number | string) =>
      apiFetch<{ reposted: boolean; reposts_count: number }>(`/feed-posts/${id}/repost`, {
        method: "POST",
      }),
  });

export const useShareFeedPost = () =>
  useMutation({
    mutationFn: (id: number | string) =>
      apiFetch<{ shares_count: number }>(`/feed-posts/${id}/share`, { method: "POST" }),
  });

export const useRecordFeedPostView = () =>
  useMutation({
    mutationFn: (id: number | string) =>
      apiFetch<{ views: string; recorded: boolean }>(`/feed-posts/${id}/view`, {
        method: "POST",
        body: JSON.stringify({ session_id: analyticsSessionId() }),
      }),
  });

export type FeedComment = {
  id: number;
  body: string;
  created_at: string;
  user: { id: number; name: string };
};
export const useFeedComments = (id: number | string, enabled = false) =>
  useQuery({
    queryKey: ["feed-comments", id],
    queryFn: () => apiFetch<FeedComment[]>(`/feed-posts/${id}/comments`),
    enabled,
  });
export const useCreateFeedComment = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number | string; body: string }) =>
      apiFetch<FeedComment>(`/feed-posts/${id}/comments`, {
        method: "POST",
        body: JSON.stringify({ body }),
      }),
    onSuccess: (_data, variables) =>
      client.invalidateQueries({ queryKey: ["feed-comments", variables.id] }),
  });
};

export const useVoteFeedPoll = () =>
  useMutation({
    mutationFn: ({ id, optionIndex }: { id: number | string; optionIndex: number }) =>
      apiFetch<{
        poll_options: { option: string; percent: number; votes: number }[];
        selected_option_index: number;
        total_votes: number;
      }>(`/feed-posts/${id}/poll-vote`, {
        method: "POST",
        body: JSON.stringify({ option_index: optionIndex }),
      }),
  });

export type FollowStatus = { following: boolean; followers_count: number };

export const useUserFollowStatus = (userId?: number | null, enabled = false) =>
  useQuery({
    queryKey: ["user-follow", userId],
    queryFn: () => apiFetch<FollowStatus>(`/users/${userId}/follow`),
    enabled: Boolean(userId) && enabled,
  });

export const useToggleUserFollow = () =>
  useMutation({
    mutationFn: (userId: number) =>
      apiFetch<FollowStatus>(`/users/${userId}/follow`, { method: "POST" }),
  });

export const useArtistFollowStatus = (artistId?: number | null, enabled = false) =>
  useQuery({
    queryKey: ["artist-follow", artistId],
    queryFn: () => apiFetch<FollowStatus>(`/artists/${artistId}/follow`),
    enabled: Boolean(artistId) && enabled,
  });

export const useToggleArtistFollow = () =>
  useMutation({
    mutationFn: (artistId: number) =>
      apiFetch<FollowStatus>(`/artists/${artistId}/follow`, { method: "POST" }),
  });

export type Playlist = { id: number; name: string; tracks: Track[] };

export type PublicUserProfile = {
  id: number;
  name: string;
  handle: string;
  bio: string | null;
  location: string | null;
  joined_at: string;
  profile_photo_url: string | null;
  role: string;
  is_followable: boolean;
  followers_count: number;
  profile_views: number;
  posts_count: number;
  posts: FeedPost[];
  playlists: Playlist[];
};

export const useUserProfile = (userId?: number | null) =>
  useQuery({
    queryKey: ["user-profile", userId],
    queryFn: () => apiFetch<PublicUserProfile>(`/users/${userId}`),
    enabled: Boolean(userId),
  });

export const useRecordUserProfileView = () =>
  useMutation({
    mutationFn: (userId: number) =>
      apiFetch<{ views: number; recorded: boolean }>(`/users/${userId}/view`, {
        method: "POST",
        body: JSON.stringify({ session_id: analyticsSessionId() }),
      }),
  });

export type SiteNotification = {
  id: string;
  type: string;
  data: {
    type: string;
    title: string;
    message: string;
    url?: string;
    entity_id?: number;
    image_url?: string | null;
    icon?: string;
  };
  read_at: string | null;
  created_at: string;
};

export type NotificationsResponse = Paginated<SiteNotification> & { unread_count: number };

export const useNotifications = (enabled = false) =>
  useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiFetch<NotificationsResponse>("/notifications"),
    enabled,
    refetchInterval: enabled ? 30_000 : false,
  });

export const useMarkNotificationRead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (notificationId: string) =>
      apiFetch<{ read: boolean }>(`/notifications/${notificationId}/read`, { method: "POST" }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: () => apiFetch<{ read: boolean }>("/notifications/read-all", { method: "POST" }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["notifications"] }),
  });
};

export const useUpdateMyProfile = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (data: { name: string; handle: string; bio?: string; location?: string }) =>
      apiFetch<PublicUserProfile>("/user/profile", {
        method: "PATCH",
        body: JSON.stringify(data),
      }),
    onSuccess: (profile) => {
      client.setQueryData(["user-profile", profile.id], profile);
    },
  });
};

export const usePlaylists = (enabled = false) =>
  useQuery({
    queryKey: ["playlists"],
    queryFn: () => apiFetch<Playlist[]>("/playlists"),
    enabled,
  });

export const useCreatePlaylist = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      apiFetch<Playlist>("/playlists", { method: "POST", body: JSON.stringify({ name }) }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["playlists"] }),
  });
};

export const useTogglePlaylistTrack = () => {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ playlistId, trackId }: { playlistId: number; trackId: number }) =>
      apiFetch<{ saved: boolean; playlist: Playlist }>(
        `/playlists/${playlistId}/tracks/${trackId}`,
        { method: "POST" },
      ),
    onSuccess: () => client.invalidateQueries({ queryKey: ["playlists"] }),
  });
};

export const useSubmitVerificationRequest = () =>
  useMutation({
    mutationFn: (data: {
      type: "approved_user" | "artist" | "podcaster" | "event_organizer";
      note?: string;
    }) => apiFetch("/verification-requests", { method: "POST", body: JSON.stringify(data) }),
  });

// ── Mutations ──────────────────────────────────────────────────────────────
export const useSubmitBooking = () =>
  useMutation({
    mutationFn: (data: {
      service_type: string;
      client_name: string;
      client_email: string;
      client_phone?: string;
      preferred_date: string;
      preferred_time?: string;
      location?: string;
      duration?: string;
      budget?: string;
      attendees?: number;
      contact_method: "email" | "phone" | "whatsapp";
      project_details: string;
    }) =>
      apiFetch<{
        message: string;
        reference: string;
        booking: { id: number; status: string };
      }>("/bookings", { method: "POST", body: JSON.stringify(data) }),
  });

export const useSubmitTicketOrder = () =>
  useMutation({
    mutationFn: (data: {
      event_id: number;
      buyer_name: string;
      buyer_email: string;
      quantity: number;
    }) => apiFetch("/ticket-orders", { method: "POST", body: JSON.stringify(data) }),
  });

export const useSubmitTicketListing = () =>
  useMutation({
    mutationFn: (data: {
      event_id: number;
      seat_info: string;
      asking_price: string;
      contact: string;
    }) => apiFetch("/ticket-listings", { method: "POST", body: JSON.stringify(data) }),
  });

export const useSubmitContact = () =>
  useMutation({
    mutationFn: (data: {
      name: string;
      email: string;
      phone?: string;
      subject?: string;
      message: string;
    }) => apiFetch("/contact-messages", { method: "POST", body: JSON.stringify(data) }),
  });
