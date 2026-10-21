export const ADMIN_EMAILS = new Set([
  "trincasrestaurant@gmail.com",
  "gshamik14@gmail.com",
]);

export const CMS_SESSION_DURATION_MS = 24 * 60 * 60 * 1000;
export const CMS_SESSION_WARNING_BEFORE_EXPIRY_MS = 5 * 60 * 1000;

const CMS_SESSION_STARTED_AT_PREFIX = "trincas:cms-session-started-at:";

function getSessionStartedAtStorageKey(sessionId) {
  return `${CMS_SESSION_STARTED_AT_PREFIX}${sessionId}`;
}

export function getOrCreateCmsSessionStartedAt(sessionId, fallbackStartedAt, now = Date.now()) {
  if (typeof window === "undefined") return fallbackStartedAt ?? now;

  const storageKey = getSessionStartedAtStorageKey(sessionId);

  try {
    const storedStartedAt = Number(window.localStorage.getItem(storageKey));
    if (Number.isFinite(storedStartedAt) && storedStartedAt > 0 && storedStartedAt <= now) {
      return storedStartedAt;
    }

    const startedAt = Number.isFinite(fallbackStartedAt) && fallbackStartedAt > 0
      ? Math.min(fallbackStartedAt, now)
      : now;
    window.localStorage.setItem(storageKey, String(startedAt));
    return startedAt;
  } catch {
    return fallbackStartedAt ?? now;
  }
}

export function clearCmsSessionStartedAt(sessionId) {
  if (!sessionId || typeof window === "undefined") return;

  try {
    window.localStorage.removeItem(getSessionStartedAtStorageKey(sessionId));
  } catch {
    // Supabase will still clear its own persisted session during sign-out.
  }
}

const DEFAULT_AUTH_REDIRECT_URL = "https://trincas.vercel.app/dashboard";

export function getAuthRedirectUrl() {
  const configuredRedirectUrl = import.meta.env.VITE_AUTH_REDIRECT_URL?.trim();
  const redirectUrl = configuredRedirectUrl || DEFAULT_AUTH_REDIRECT_URL;

  try {
    const parsedUrl = new URL(redirectUrl);
    const isLocalDevelopment = ["localhost", "127.0.0.1"].includes(parsedUrl.hostname);

    if (parsedUrl.protocol !== "https:" && !isLocalDevelopment) {
      return DEFAULT_AUTH_REDIRECT_URL;
    }

    return parsedUrl.toString();
  } catch {
    return DEFAULT_AUTH_REDIRECT_URL;
  }
}

export function isAllowedAdminEmail(email) {
  return ADMIN_EMAILS.has(email.trim().toLowerCase());
}

export function isVerifiedAdminClaims(claims) {
  const email = typeof claims?.email === "string" ? claims.email : "";
  return isAllowedAdminEmail(email) && ["otp", "magiclink"].includes(claims?.amr?.[0]?.method);
}

export function getAuthErrorMessage(error, fallback) {
  const message = error?.message?.toLowerCase() ?? "";

  if (error?.status === 429 || message.includes("rate limit") || message.includes("too many") || message.includes("security purposes")) {
    return "A sign-in link was recently sent. Please wait 60 seconds before requesting another one.";
  }

  if (message.includes("network") || message.includes("fetch")) {
    return "We could not reach the sign-in service. Check your connection and try again.";
  }

  return fallback;
}
