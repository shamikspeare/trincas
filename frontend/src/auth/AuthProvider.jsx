import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  clearCmsSessionStartedAt,
  CMS_SESSION_DURATION_MS,
  getOrCreateCmsSessionStartedAt,
  isVerifiedAdminClaims,
} from "./authConfig";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const suppressTemporarySessionRef = useRef(false);
  const sessionCheckIdRef = useRef(0);
  const [session, setSession] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [sessionStartedAt, setSessionStartedAt] = useState(null);
  const [sessionEndReason, setSessionEndReason] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback(async (nextSession) => {
    const checkId = ++sessionCheckIdRef.current;
    if (suppressTemporarySessionRef.current) {
      setSession(null);
      setSessionId(null);
      setSessionStartedAt(null);
      setUser(null);
      setLoading(false);
      return;
    }

    if (!nextSession) {
      setSession(null);
      setSessionId(null);
      setSessionStartedAt(null);
      setUser(null);
      setLoading(false);
      return;
    }

    let claimsResult;
    try {
      claimsResult = await supabase.auth.getClaims(nextSession.access_token);
    } catch {
      claimsResult = { data: null, error: new Error("Unable to validate the session.") };
    }
    if (checkId !== sessionCheckIdRef.current) return;

    const claims = claimsResult.data?.claims;
    const nextSessionId = claims?.session_id;

    if (claimsResult.error || !isVerifiedAdminClaims(claims) || typeof nextSessionId !== "string") {
      setSession(null);
      setSessionId(null);
      setSessionStartedAt(null);
      setUser(null);
    } else {
      const lastSignInAt = Date.parse(nextSession.user?.last_sign_in_at ?? "");
      const nextSessionStartedAt = getOrCreateCmsSessionStartedAt(
        nextSessionId,
        Number.isFinite(lastSignInAt) ? lastSignInAt : Date.now()
      );

      if (Date.now() >= nextSessionStartedAt + CMS_SESSION_DURATION_MS) {
        setSession(null);
        setSessionId(nextSessionId);
        setSessionStartedAt(nextSessionStartedAt);
        setSessionEndReason("expired");
        setUser(null);

        window.setTimeout(async () => {
          const { error } = await supabase.auth.signOut({ scope: "local" });
          if (!error) clearCmsSessionStartedAt(nextSessionId);
        }, 0);
      } else {
        setSession(nextSession);
        setSessionId(nextSessionId);
        setSessionStartedAt(nextSessionStartedAt);
        setSessionEndReason(null);
        setUser(nextSession.user ?? null);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data, error }) => {
      if (!mounted) return;
      if (error) {
        setSession(null);
        setUser(null);
        setLoading(false);
        return;
      }
      void applySession(data.session);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (mounted) void applySession(nextSession);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [applySession]);

  // Password sign-in creates a session before the second factor is complete.
  // This in-memory gate keeps that short-lived session out of route authorization.
  const beginPasswordVerification = useCallback(() => {
    suppressTemporarySessionRef.current = true;
    setSession(null);
    setSessionId(null);
    setSessionStartedAt(null);
    setUser(null);
  }, []);

  const finishPasswordVerification = useCallback(() => {
    suppressTemporarySessionRef.current = false;
    setSession(null);
    setSessionId(null);
    setSessionStartedAt(null);
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      clearCmsSessionStartedAt(sessionId);
      setSession(null);
      setSessionId(null);
      setSessionStartedAt(null);
      setSessionEndReason(null);
      setUser(null);
    }
    return { error };
  }, [sessionId]);

  const expireSession = useCallback(async () => {
    const expiredSessionId = sessionId;

    setSession(null);
    setSessionStartedAt(null);
    setSessionEndReason("expired");
    setUser(null);

    const { error } = await supabase.auth.signOut({ scope: "local" });
    if (!error) {
      clearCmsSessionStartedAt(expiredSessionId);
      setSessionId(null);
    }
    return { error };
  }, [sessionId]);

  return (
    <AuthContext.Provider
      value={{
        session,
        sessionStartedAt,
        sessionEndReason,
        user,
        loading,
        logout,
        expireSession,
        beginPasswordVerification,
        finishPasswordVerification,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
