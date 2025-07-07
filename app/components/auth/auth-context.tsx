// AuthContext.tsx  ────────────────────────────────────────────────────────────
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  type User,
  onAuthStateChanged,
  getRedirectResult,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth } from "~/lib/firebaseClient";

type Shape = { user: User | null; loading: boolean };
const Ctx = createContext<Shape>({ user: null, loading: true });
export const useAuth = () => useContext(Ctx);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, set] = useState<Shape>({ user: null, loading: true });

  useEffect(() => {
    // 1. pick up redirect result (safe to ignore if none)
    getRedirectResult(auth).catch(console.error);

    // 2. listen for user changes
    const unsub = onAuthStateChanged(auth, (u) =>
      set({ user: u, loading: false })
    );
    return unsub;
  }, []);

  return <Ctx.Provider value={state}>{children}</Ctx.Provider>;
};
