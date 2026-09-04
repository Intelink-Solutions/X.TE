// Production builds must set VITE_API_URL when the Laravel API is hosted on a
// different origin. Falling back to the current origin is safe for reverse-
// proxy deployments and avoids ever shipping a localhost API URL.
export const API_BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/$/, "");
export const API_ORIGIN = API_BASE.replace(/\/api\/?$/, "");

function browserApiBase() {
  if (typeof window === "undefined") return API_BASE;

  try {
    const url = new URL(API_BASE, window.location.origin);
    const apiIsLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    const siteIsLocal =
      window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

    // When the Vite site is opened from another device on the LAN, `localhost`
    // points at that device. Keep the configured API port/path but use the
    // hostname that served the frontend.
    if (apiIsLocal && !siteIsLocal) url.hostname = window.location.hostname;

    return url.toString().replace(/\/$/, "");
  } catch {
    return API_BASE;
  }
}

export function mediaUrl(path?: string | null) {
  if (!path) return null;
  const apiOrigin = browserApiBase().replace(/\/api\/?$/, "");

  const throughMediaApi = (pathname: string) => {
    const storagePath = pathname.replace(/^\/?storage\//i, "");
    return `${apiOrigin}/api/media/${storagePath}`;
  };

  if (/^https?:\/\//i.test(path)) {
    try {
      const url = new URL(path);
      const mediaIsLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
      const apiUrl = new URL(apiOrigin);
      if (mediaIsLocal && !["localhost", "127.0.0.1"].includes(apiUrl.hostname)) {
        url.hostname = apiUrl.hostname;
        url.port = apiUrl.port;
      }

      // cPanel may intercept Laravel's conventional /storage symlink. Serve
      // first-party uploads through the authenticated application's media route.
      const firstParty =
        url.origin === apiUrl.origin ||
        (typeof window !== "undefined" && url.origin === window.location.origin);
      if (firstParty && /^\/storage\//i.test(url.pathname)) {
        return throughMediaApi(url.pathname);
      }

      return url.toString();
    } catch {
      return path;
    }
  }

  if (/^\/?storage\//i.test(path)) return throughMediaApi(path);
  return `${apiOrigin}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getAuthToken() {
  return typeof window === "undefined" ? null : window.localStorage.getItem("xtouch:auth-token");
}

export async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const isFormData = typeof FormData !== "undefined" && options?.body instanceof FormData;
  const token = getAuthToken();
  let res: Response;
  try {
    res = await fetch(`${browserApiBase()}${path}`, {
      credentials: "include",
      ...options,
      headers: {
        Accept: "application/json",
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options?.headers,
      },
    });
  } catch {
    throw new Error("Unable to connect to the X'Touch server. Please try again shortly.");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    const firstValidationError = err.errors ? Object.values(err.errors).flat()[0] : undefined;
    throw new Error(String(firstValidationError ?? err.message ?? "API error"));
  }
  return res.json() as Promise<T>;
}
