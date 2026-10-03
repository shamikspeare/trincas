import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { SESSION_TIMEOUT_MS, SESSION_WARNING_MS } from "./authConfig";
import { useAuth } from "./AuthProvider";

const ACTIVITY_EVENTS = ["pointerdown", "mousemove", "keydown", "scroll", "touchstart"];

export default function IdleSessionGuard() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const warningTimerRef = useRef(null);
  const timeoutTimerRef = useRef(null);
  const [showWarning, setShowWarning] = useState(false);

  const clearTimers = useCallback(() => {
    window.clearTimeout(warningTimerRef.current);
    window.clearTimeout(timeoutTimerRef.current);
  }, []);

  const signOutForInactivity = useCallback(async () => {
    clearTimers();
    setShowWarning(false);
    await logout();
    navigate("/login?reason=idle", { replace: true });
  }, [clearTimers, logout, navigate]);

  const resetTimer = useCallback(() => {
    if (!session) return;
    clearTimers();
    setShowWarning(false);
    warningTimerRef.current = window.setTimeout(() => setShowWarning(true), SESSION_WARNING_MS);
    timeoutTimerRef.current = window.setTimeout(signOutForInactivity, SESSION_TIMEOUT_MS);
  }, [clearTimers, session, signOutForInactivity]);

  useEffect(() => {
    if (!session) {
      clearTimers();
      setShowWarning(false);
      return undefined;
    }
    resetTimer();
    const onActivity = () => resetTimer();
    ACTIVITY_EVENTS.forEach((eventName) => window.addEventListener(eventName, onActivity, { passive: true }));
    return () => {
      clearTimers();
      ACTIVITY_EVENTS.forEach((eventName) => window.removeEventListener(eventName, onActivity));
    };
  }, [clearTimers, resetTimer, session]);

  if (!showWarning) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-5" role="presentation">
      <section className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl" role="dialog" aria-modal="true" aria-labelledby="idle-warning-title">
        <h2 id="idle-warning-title" className="text-xl font-semibold text-gray-900">Still working?</h2>
        <p className="mt-2 text-sm leading-6 text-gray-600">Your session will end soon because there has been no activity.</p>
        <div className="mt-6 flex justify-end gap-3">
          <button className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800" onClick={signOutForInactivity}>Logout now</button>
          <button className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white" onClick={resetTimer}>Stay logged in</button>
        </div>
      </section>
    </div>
  );
}
