"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function handleAuth() {
      const supabase = getSupabaseBrowserClient();
      if (!supabase) {
        setError("Supabase client is not available");
        return;
      }

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        setError(sessionError?.message || "Failed to establish session");
        return;
      }

      try {
        const res = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            token: session.access_token,
            email: session.user.email,
          }),
        });

        const data = await res.json();
        if (data.success) {
          router.push("/admin/projects");
        } else {
          setError(data.error || "Authorization rejected");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Network error during auth verification");
      }
    }

    handleAuth();
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
