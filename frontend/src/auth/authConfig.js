export const ADMIN_EMAILS = new Set([
  "trincasrestaurant@gmail.com",
  "gshamik14@gmail.com",
]);

export const SESSION_TIMEOUT_MS = 15 * 60 * 1000;
export const SESSION_WARNING_MS = 14 * 60 * 1000;

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
