"use client";

import React, { useState, useEffect } from "react";
import { getPlaceholderLinks, fetchLinks, type ExternalLinkItem } from "@/lib/data/links";

function LinkIcon({ type }: { type: string }) {
  switch (type.toLowerCase()) {
    case "github":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
        </svg>
      );
    case "x":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "email":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      );
    case "rss":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 11a9 9 0 0 1 9 9" />
          <path d="M4 4a16 16 0 0 1 16 16" />
          <circle cx="5" cy="19" r="1" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <line x1="2" y1="12" x2="22" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
  }
}

export function LinksApp() {
  const [links, setLinks] = useState<readonly ExternalLinkItem[]>(getPlaceholderLinks());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchLinks().then((data) => {
      if (active && data) {
        setLinks(data);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const handleCopyHandle = (item: ExternalLinkItem) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(item.handlePlaceholder).catch(() => {});
      setCopiedId(item.id);
      setTimeout(() => {
        setCopiedId(null);
      }, 2000);
    }
  };

  return (
    <div className="p-4 sm:p-6 space-y-5 max-w-3xl mx-auto text-text-primary">
      {/* Header */}
      <header className="pb-3 border-b border-border-subtle space-y-1">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-bold tracking-tight text-text-primary">
            Online Presence & Profiles
          </h1>
          <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-status-online/15 border border-status-online/30 text-status-online font-medium">
            {links.filter((l) => l.verified).length} Channels Verified
          </span>
        </div>
        <p className="text-xs text-text-muted">
          Official engineering profiles, public repositories, and direct contact avenues.
        </p>
      </header>

      {links.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center p-6 rounded-lg border border-dashed border-border-subtle bg-surface-raised/10">
          <p className="text-xs text-text-secondary font-medium">No external links found</p>
          <p className="font-mono text-[11px] text-text-muted mt-1">
            Online presence channels will populate from database.
          </p>
        </div>
      ) : (
        /* Links List - Supports arbitrary count and categories */
        <div className="space-y-3" role="list">
          {links.map((item) => (
            <div
              key={item.id}
              role="listitem"
              className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-surface-raised/40 border border-border-subtle hover:border-border-highlight transition-all"
            >
              {/* Channel Info */}
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-surface border border-border-subtle flex items-center justify-center text-text-secondary shrink-0 mt-0.5">
                  <LinkIcon type={item.type} />
                </div>

                <div className="space-y-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-semibold text-text-primary">
                      {item.title}
                    </span>
                    <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/[0.06] text-text-muted">
                      {item.category}
                    </span>
                    {item.verified && (
                      <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Verified
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-accent truncate">
                      {item.handlePlaceholder}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyHandle(item)}
                      title="Copy handle or address"
                      className="font-mono text-[10px] text-text-muted hover:text-text-primary cursor-pointer transition-colors shrink-0"
                    >
                      {copiedId === item.id ? "✓ Copied" : "Copy"}
                    </button>
                  </div>

                  {item.description && (
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
              </div>

              {/* External Navigation Button */}
              <div className="shrink-0 pt-1 sm:pt-0 self-end sm:self-center">
                <a
                  href={item.urlPlaceholder}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/[0.05] hover:bg-white/[0.1] border border-border-subtle text-xs font-mono text-text-primary transition-colors cursor-pointer"
                >
                  <span>Navigate</span>
                  <span aria-hidden="true">↗</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
