import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CMS_SESSION_DURATION_MS,
  CMS_SESSION_WARNING_BEFORE_EXPIRY_MS,
} from "./authConfig";
import { useAuth } from "./AuthProvider";

export default function SessionExpiryGuard() {
  const { session, sessionStartedAt, expireSession } = useAuth();
  const navigate = useNavigate();
  const warningTimerRef = useRef(null);
  const timeoutTimerRef = useRef(null);
  const [showWarning, setShowWarning] = useState(false);

  const clearTimers = useCallback(() => {
    window.clearTimeout(warningTimerRef.current);
    window.clearTimeout(timeoutTimerRef.current);
  }, []);

  const signOutForExpiry = useCallback(async () => {
    clearTimers();
    setShowWarning(false);
    await expireSession();
    navigate("/login?reason=expired", { replace: true });
  }, [clearTimers, expireSession, navigate]);

  const scheduleExpiry = useCallback(() => {
    if (!session || !sessionStartedAt) return;

    clearTimers();
    setShowWarning(false);

    const expiresAt = sessionStartedAt + CMS_SESSION_DURATION_MS;
    const timeUntilExpiry = expiresAt - Date.now();
    const timeUntilWarning = timeUntilExpiry - CMS_SESSION_WARNING_BEFORE_EXPIRY_MS;

    if (timeUntilExpiry <= 0) {
      void signOutForExpiry();
      return;
    }

    if (timeUntilWarning <= 0) {
      setShowWarning(true);
    } else {
      warningTimerRef.current = window.setTimeout(() => setShowWarning(true), timeUntilWarning);
    }
    timeoutTimerRef.current = window.setTimeout(signOutForExpiry, timeUntilExpiry);
  }, [clearTimers, session, sessionStartedAt, signOutForExpiry]);

  useEffect(() => {
    if (!session || !sessionStartedAt) {
      clearTimers();
      setShowWarning(false);
      return undefined;
    }

    scheduleExpiry();
    const checkExpiryAfterBackgrounding = () => scheduleExpiry();
    window.addEventListener("focus", checkExpiryAfterBackgrounding);
    document.addEventListener("visibilitychange", checkExpiryAfterBackgrounding);

    return () => {
      clearTimers();
      window.removeEventListener("focus", checkExpiryAfterBackgrounding);
      document.removeEventListener("visibilitychange", checkExpiryAfterBackgrounding);
    };
  }, [clearTimers, scheduleExpiry, session, sessionStartedAt]);

  if (!showWarning) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-5" role="presentation">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="idle-warning-title">
        <h2 id="idle-warning-title" className="text-xl font-semibold text-gray-900">Session expiring soon</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">Your 24-hour CMS session will end in less than five minutes. Save any changes before signing in again.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800" onClick={() => setShowWarning(false)}>Dismiss</button>
          <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white" onClick={signOutForExpiry}>Logout now</button>
        </div>
      </section>
    </div>
  );
}
