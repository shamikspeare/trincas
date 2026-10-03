import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { getAuthErrorMessage, isAllowedAdminEmail } from "./authConfig";
import { useAuth } from "./AuthProvider";

export default function LoginPage() {
  const location = useLocation();
  const { beginPasswordVerification, finishPasswordVerification } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [linkSent, setLinkSent] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const idleNotice = new URLSearchParams(location.search).get("reason") === "idle";

  useEffect(() => {
    if (secondsRemaining <= 0) return undefined;
    const timer = window.setInterval(() => setSecondsRemaining((seconds) => Math.max(0, seconds - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [secondsRemaining]);

  async function handleSubmit(event) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();

    if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!isAllowedAdminEmail(normalizedEmail)) {
      setError("Unauthorized account.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }

    setError("");
    setSubmitting(true);
    beginPasswordVerification();

    try {
      const { error: passwordError } = await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });
      setPassword("");

      if (passwordError) {
        finishPasswordVerification();
        setError(getAuthErrorMessage(passwordError, "Invalid email or password."));
        return;
      }

      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        // Keep the gate closed if the temporary session could not be destroyed.
        setError("We could not complete secure sign-in. Please try again.");
        return;
      }

      finishPasswordVerification();
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: false,
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (otpError) {
        if (otpError.status === 429) setSecondsRemaining(60);
        setError(getAuthErrorMessage(otpError, "We could not send a sign-in link. Please try again."));
        return;
      }

      setSecondsRemaining(60);
      setLinkSent(true);
    } catch (unexpectedError) {
      setPassword("");
      finishPasswordVerification();
      setError(getAuthErrorMessage(unexpectedError, "We could not complete sign-in. Please try again."));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthShell title="CMS sign in" subtitle="Enter your credentials to receive a secure sign-in link.">
      {idleNotice && <Notice>You were logged out due to inactivity.</Notice>}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <form className="space-y-5" onSubmit={handleSubmit}>
        <Label label="Email">
          <input className="auth-input" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} disabled={submitting} />
        </Label>
        <Label label="Password">
          <input className="auth-input" type="password" autoComplete="current-password" value={password} onChange={(event) => setPassword(event.target.value)} disabled={submitting} />
        </Label>
        <button className="auth-button" type="submit" disabled={submitting || secondsRemaining > 0}>
          {submitting ? "Checking credentials…" : secondsRemaining > 0 ? `Try again in ${secondsRemaining}s` : "Send sign-in link"}
        </button>
      </form>
      {linkSent && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-5" role="presentation">
          <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="magic-link-title">
            <h2 id="magic-link-title" className="text-xl font-semibold text-gray-900">Check your email</h2>
            <p className="mt-2 text-sm leading-6 text-gray-600">We sent a one-time sign-in link to {email.trim().toLowerCase()}. Open the link to finish signing in securely.</p>
            <p className="mt-3 text-sm leading-6 text-gray-600">For your protection, do not forward the link to anyone else.</p>
            <button className="mt-6 w-full rounded-lg bg-black px-4 py-2 text-sm font-medium text-white" type="button" onClick={() => setLinkSent(false)}>
              Close
            </button>
          </section>
        </div>
      )}
    </AuthShell>
  );
}

export function AuthShell({ title, subtitle, children }) {
  return <main className="auth-page"><section className="auth-card"><h1>{title}</h1><p>{subtitle}</p>{children}</section></main>;
}

export function Label({ label, children }) {
  return <label className="block text-sm font-medium text-gray-700"><span className="mb-1.5 block">{label}</span>{children}</label>;
}

export function ErrorMessage({ children }) {
  return <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">{children}</div>;
}

export function Notice({ children }) {
  return <div className="mb-5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800" role="status">{children}</div>;
}
