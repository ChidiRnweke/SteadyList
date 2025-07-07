// AuthGuard.tsx
import React, { useEffect } from "react";
import { GoogleAuthProvider, signInWithRedirect } from "firebase/auth";
import { auth } from "~/lib/firebaseClient";
import { useAuth } from "./auth-context";

const REDIRECT_FLAG = "firebaseRedirectInProgress";

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  useEffect(() => {
    // Run only when auth check is finished and there is *no* user
    if (!loading && !user) {
      // Have we already kicked off a redirect in this browser tab?
      const alreadyRedirecting =
        sessionStorage.getItem(REDIRECT_FLAG) === "true";
      if (alreadyRedirecting) return; // 🔁 stop the loop

      // Mark that we’re about to leave the page
      sessionStorage.setItem(REDIRECT_FLAG, "true");

      signInWithRedirect(auth, new GoogleAuthProvider()).catch((err) => {
        console.error("sign-in redirect failed:", err);
        // Make another attempt possible only if this call itself crashed
        sessionStorage.removeItem(REDIRECT_FLAG);
      });
    }
  }, [loading, user]);

  /* UX placeholders */
  if (loading) return <p>Checking credentials…</p>;
  if (!user) return <p>Redirecting to sign-in…</p>;

  return <>{children}</>;
};
