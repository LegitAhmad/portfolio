"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);

  const handleGitHubOAuth = async () => {
    setLoading(true);
    setMessage(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      // If Supabase not configured in client, test dev bypass
      try {
        const res = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: "dev-admin@portfolio.local" }),
        });
        const data = await res.json();
        if (data.success) {
          router.push("/admin/projects");
          return;
        }
      } catch {
        // Continue
      }
      setMessage({
        type: "error",
        text: "Supabase client is not configured. Configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "github",
        options: {
          redirectTo: `${window.location.origin}/admin/callback`,
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
        setLoading(false);
      }
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "OAuth failed" });
      setLoading(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setMessage(null);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      // Fallback dev bypass attempt
      try {
        const res = await fetch("/api/admin/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        const data = await res.json();
        if (data.success) {
          router.push("/admin/projects");
          return;
        }
      } catch {
        // Continue
      }
      setMessage({
        type: "error",
        text: "Supabase is not configured. Please supply keys in .env.local.",
      });
      setLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/admin/callback`,
        },
      });

      if (error) {
        setMessage({ type: "error", text: error.message });
      } else {
        setMessage({
          type: "success",
          text: "Magic sign-in link sent to your email. Check your inbox.",
        });
      }
    } catch (err) {
      setMessage({ type: "error", text: err instanceof Error ? err.message : "Sign-in failed" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e1e4ea] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md bg-[#12161f] border border-[#212631] rounded-xl p-6 sm:p-8 shadow-2xl space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#1b2230] border border-[#2d3748] text-xs font-mono text-[#4e95ff]">
            <span>Portfolio CMS</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight text-white">
            Admin Authentication
          </h1>
          <p className="text-xs text-[#8b949e]">
            Personal administrator access for portfolio management.
          </p>
        </div>

        {message && (
          <div
            className={`p-3 rounded-lg text-xs border ${
              message.type === "error"
                ? "bg-rose-500/10 border-rose-500/30 text-rose-300"
                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="space-y-4">
          <button
            type="button"
            onClick={handleGitHubOAuth}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg bg-[#212631] hover:bg-[#2d3748] text-white font-medium text-sm border border-[#30363d] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span>Sign in with GitHub Admin</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-[#212631] w-full" />
            <span className="bg-[#12161f] px-2 text-[10px] uppercase font-mono text-[#8b949e]">
              Or Magic Link
            </span>
          </div>

          <form onSubmit={handleMagicLink} className="space-y-3">
            <div>
              <label className="block text-xs text-[#8b949e] mb-1 font-mono">
                Admin Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="owner@example.com"
                required
                className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-sm text-white placeholder:text-[#484f58] focus:outline-none focus:border-[#4e95ff]"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 px-4 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-medium text-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              {loading ? "Sending..." : "Send Magic Link"}
            </button>
          </form>
        </div>

        <div className="text-center pt-2">
          <Link
            href="/"
            className="text-xs font-mono text-[#8b949e] hover:text-white transition-colors"
          >
            ← Return to Public Portfolio
          </Link>
        </div>
      </div>
    </div>
  );
}
