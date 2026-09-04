import { apiFetch } from "./api/client";

const SESSION_KEY = "xtouch:analytics-session";

export function analyticsSessionId() {
  if (typeof window === "undefined") return undefined;
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    id = crypto.randomUUID();
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

export function trackEvent(
  eventType: string,
  details: { path?: string; entity_type?: string; entity_id?: number; metadata?: object } = {},
) {
  void apiFetch("/analytics-events", {
    method: "POST",
    body: JSON.stringify({ session_id: analyticsSessionId(), event_type: eventType, ...details }),
  }).catch(() => undefined);
}
