"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function handleAuth() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        if (active) setError("Supabase client is not available");
        return;
      }

      // 1. Check for error parameters in URL query or hash
      const urlParams = new URLSearchParams(window.location.search);
      const urlError = urlParams.get("error_description") || urlParams.get("error");
      if (urlError) {
        if (active) setError(decodeURIComponent(urlError));
        return;
      }

      const code = urlParams.get("code");
      let activeSession = null;

      if (code) {
        // Exchange PKCE code for session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) {
          console.warn("Code exchange error:", exchangeError);
          // Try fallback to getSession in case Supabase client already exchanged it
          const { data: sessionData } = await supabase.auth.getSession();
          activeSession = sessionData?.session;
          if (!activeSession && active) {
            setError(exchangeError.message);
            return;
          }
        } else {
          activeSession = data.session;
        }
      } else {
        // Implicit hash flow or existing session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          if (active) setError(sessionError.message);
          return;
        }
        activeSession = session;
      }

      if (!activeSession) {
        // Final fallback: listen for SIGNED_IN event briefly in case auto-exchange is completing
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
          if (session && active) {
            authListener.subscription.unsubscribe();
            await verifyAndRedirect(session.access_token, session.user.email);
          }
        });

        setTimeout(() => {
          if (active && !activeSession) {
            authListener.subscription.unsubscribe();
            setError("Failed to establish session. Please ensure you are logged into GitHub and try again.");
          }
        }, 4000);
        return;
      }

      await verifyAndRedirect(activeSession.access_token, activeSession.user.email);
    }

    async function verifyAndRedirect(token: string, email?: string) {
      try {
        const res = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token,
            email,
          }),
        });

        const data = await res.json();
        if (data.success) {
          router.push("/admin/projects");
        } else {
          if (active) setError(data.error || "Authorization rejected");
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Network error during auth verification");
      }
    }

    handleAuth();

    return () => {
      active = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e1e4ea] flex items-center justify-center p-4">
      <div className="bg-[#12161f] border border-[#212631] rounded-xl p-6 text-center space-y-4 max-w-sm">
        {error ? (
          <>
            <div className="text-rose-400 font-semibold text-sm">Access Denied</div>
            <p className="text-xs text-[#8b949e]">{error}</p>
            <a
              href="/admin/login"
              className="inline-block mt-3 px-4 py-1.5 rounded-lg bg-[#212631] hover:bg-[#2d3748] text-xs text-white"
            >
              Back to Login
            </a>
          </>
        ) : (
          <>
            <div className="animate-spin w-6 h-6 border-2 border-[#4e95ff] border-t-transparent rounded-full mx-auto" />
            <p className="text-xs text-[#8b949e]">Verifying admin privileges...</p>
          </>
        )}
      </div>
    </div>
  );
}
