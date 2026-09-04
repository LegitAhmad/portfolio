"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface AdminNavProps {
  adminEmail?: string;
}

export function AdminNav({ adminEmail }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Don't render navigation on login and callback pages
  if (pathname === "/admin/login" || pathname === "/admin/callback") {
    return null;
  }

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/auth", { method: "DELETE" });
      router.push("/admin/login");
    } catch {
      router.push("/admin/login");
    }
  };

  const navItems = [
    { label: "Profile", href: "/admin/profile", icon: "👤" },
    { label: "Projects", href: "/admin/projects", icon: "▤" },
    { label: "GitHub Repositories", href: "/admin/github", icon: "★" },
    { label: "Experience", href: "/admin/experience", icon: "⏱" },
    { label: "Skills", href: "/admin/skills", icon: "⚡" },
    { label: "Links", href: "/admin/links", icon: "↗" },
  ];

  return (
    <header className="border-b border-[#212631] bg-[#12161f]/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-6">
            <Link
              href="/admin/projects"
              className="flex items-center gap-2 text-sm font-semibold tracking-tight text-white hover:text-[#4e95ff] transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#4e95ff]" />
              <span>Portfolio CMS</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href === "/admin/projects" && pathname.startsWith("/admin/projects"));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[#212631] text-white font-semibold"
                        : "text-[#8b949e] hover:text-white hover:bg-[#1a202c]"
                    }`}
                  >
                    <span className="text-[10px] text-[#4e95ff]">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="px-2.5 py-1 text-xs font-mono text-[#8b949e] hover:text-white hover:bg-[#1a202c] rounded transition-colors"
              title="Open public desktop in new tab"
            >
              Desktop ↗
            </Link>

            {adminEmail && (
              <span className="hidden sm:inline-block text-[11px] font-mono text-[#8b949e] bg-[#0a0c10] px-2 py-0.5 rounded border border-[#212631]">
                {adminEmail}
              </span>
            )}

            <button
              type="button"
              onClick={handleLogout}
              className="px-2.5 py-1 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded transition-colors cursor-pointer"
            >
              Sign out
            </button>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="flex md:hidden items-center gap-1 overflow-x-auto py-2 border-t border-[#212631]/60">
          {navItems.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href === "/admin/projects" && pathname.startsWith("/admin/projects"));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`px-2.5 py-1 rounded text-xs whitespace-nowrap transition-colors ${
                  isActive
                    ? "bg-[#212631] text-white font-semibold"
                    : "text-[#8b949e] hover:text-white"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </header>
  );
}
