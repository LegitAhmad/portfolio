"use client";

import { useState, useEffect } from "react";
import { getPlaceholderLinks, fetchLinks, type ExternalLinkItem } from "@/lib/data/links";

export function LinksApp() {
  const [links, setLinks] = useState<readonly ExternalLinkItem[]>(getPlaceholderLinks());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchLinks().then((data) => {
      if (data && data.length > 0) {
        setLinks(data);
      }
    });
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
    <div className="flex flex-col h-full overflow-y-auto p-4 sm:p-6 space-y-4 bg-surface text-text-primary">
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
          <p className="font-mono text-[11px] text-text-muted mt-1">Online presence channels will populate from database.</p>
        </div>
      ) : (
        /* Links List */
        <div className="space-y-2.5" role="list">
        {links.map((item) => (
          <div
            key={item.id}
            role="listitem"
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg bg-surface-raised/40 border border-border-subtle hover:border-border-highlight transition-all"
          >
            {/* Channel Info */}
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-semibold text-text-primary">
                  {item.title}
                </span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-white/[0.04] border border-white/[0.06] text-text-muted">
                  {item.category}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-accent">
                  {item.handlePlaceholder}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyHandle(item)}
                  title="Copy handle"
                  className="font-mono text-[10px] text-text-muted hover:text-text-primary cursor-pointer transition-colors"
                >
                  {copiedId === item.id ? "✓ Copied" : "Copy"}
                </button>
              </div>

              <p className="text-xs text-text-secondary">
                {item.description}
              </p>
            </div>

            {/* External Navigation Button */}
            <div className="shrink-0 pt-1 sm:pt-0">
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
