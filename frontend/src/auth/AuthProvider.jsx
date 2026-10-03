import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";
import { isVerifiedAdminClaims } from "./authConfig";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const suppressTemporarySessionRef = useRef(false);
  const sessionCheckIdRef = useRef(0);
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const applySession = useCallback(async (nextSession) => {
    const checkId = ++sessionCheckIdRef.current;
    if (suppressTemporarySessionRef.current) {
      setSession(null);
      setUser(null);
      setLoading(false);
      return;
    }

    if (!nextSession) {
      setSession(null);
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

    if (claimsResult.error || !isVerifiedAdminClaims(claimsResult.data?.claims)) {
      setSession(null);
      setUser(null);
    } else {
      setSession(nextSession);
      setUser(nextSession.user ?? null);
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
    setUser(null);
  }, []);

  const finishPasswordVerification = useCallback(() => {
    suppressTemporarySessionRef.current = false;
    setSession(null);
    setUser(null);
  }, []);

  const logout = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) {
      setSession(null);
      setUser(null);
    }
    return { error };
  }, []);

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        logout,
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
