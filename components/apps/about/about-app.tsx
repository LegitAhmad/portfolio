"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { fetchAboutProfile, getPlaceholderAbout, type ProfileData } from "@/lib/data/about";
import { AboutMeGlyph } from "@/components/desktop/icons/icon-glyphs";

export function AboutApp() {
  const [profile, setProfile] = useState<ProfileData>(getPlaceholderAbout());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    fetchAboutProfile()
      .then((data) => {
        if (active && data) {
          setProfile(data);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch profile:", err);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <article className="p-4 sm:p-6 space-y-6 max-w-3xl mx-auto text-text-primary" aria-label="Professional Profile">
      {/* 1. Header Profile Section */}
      <header className="flex flex-col sm:flex-row items-start sm:items-center gap-4 pb-5 border-b border-border-subtle">
        <div className="w-16 h-16 rounded-xl bg-surface-raised border border-border-highlight flex items-center justify-center text-accent shadow-sm shrink-0 overflow-hidden relative">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.fullName}
              fill
              className="object-cover"
              sizes="64px"
            />
          ) : (
            <AboutMeGlyph size={36} />
          )}
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] px-2 py-0.5 rounded bg-white/[0.04] border border-border-subtle text-text-muted uppercase tracking-wider">
              Professional Profile
            </span>
            <span className="font-mono text-[10px] text-text-muted flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{profile.location}</span>
            </span>
          </div>

          <h1 className="text-base sm:text-lg font-bold tracking-tight text-text-primary truncate">
            {profile.fullName}
          </h1>

          <p className="font-mono text-xs text-accent font-medium">
            {profile.roleHeadline}
          </p>
        </div>
      </header>

      {/* 2. Narrative Bio */}
      {profile.bioParagraphs.length > 0 && (
        <section className="space-y-2.5" aria-labelledby="bio-heading">
          <h2
            id="bio-heading"
            className="font-mono text-[11px] text-text-muted uppercase tracking-wider font-semibold"
          >
            Engineering Background & Philosophy
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
            {profile.bioParagraphs.map((paragraph, idx) => (
              <p key={idx}>{paragraph}</p>
            ))}
          </div>
        </section>
      )}

      {/* 3. Current Focus */}
      {profile.currentFocus.length > 0 && (
        <section className="space-y-3" aria-labelledby="focus-heading">
          <h2
            id="focus-heading"
            className="font-mono text-[11px] text-text-muted uppercase tracking-wider font-semibold"
          >
            Current Architectural Focus
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.currentFocus.map((item) => (
              <div
                key={item.topic}
                className="p-3.5 rounded-lg bg-surface-raised/40 border border-border-subtle space-y-1.5"
              >
                <div className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                  <span className="text-accent text-[10px]">●</span>
                  <span>{item.topic}</span>
                </div>
                <p className="font-mono text-[11px] text-text-muted leading-relaxed">
                  {item.details}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 4. Education */}
      {profile.education.length > 0 && (
        <section className="space-y-3 pt-2 border-t border-border-subtle" aria-labelledby="education-heading">
          <h2
            id="education-heading"
            className="font-mono text-[11px] text-text-muted uppercase tracking-wider font-semibold"
          >
            Education & Academic Background
          </h2>
          <div className="space-y-2.5">
            {profile.education.map((edu) => (
              <div
                key={edu.degree}
                className="p-3.5 rounded-lg bg-surface-raised/30 border border-border-subtle flex flex-col sm:flex-row sm:items-baseline justify-between gap-1"
              >
                <div>
                  <div className="text-xs font-semibold text-text-primary">
                    {edu.degree}
                  </div>
                  <div className="font-mono text-[11px] text-accent mt-0.5">
                    {edu.institution}
                  </div>
                  {edu.details && (
                    <p className="font-mono text-[10px] text-text-muted mt-1 leading-relaxed">
                      {edu.details}
                    </p>
                  )}
                </div>
                <div className="font-mono text-xs text-text-muted shrink-0">
                  {edu.year}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 5. Engineering Interests */}
      {profile.interests.length > 0 && (
        <section className="space-y-3 pt-2 border-t border-border-subtle" aria-labelledby="interests-heading">
          <h2
            id="interests-heading"
            className="font-mono text-[11px] text-text-muted uppercase tracking-wider font-semibold"
          >
            Engineering & Systems Interests
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {profile.interests.map((interest) => (
              <div
                key={interest.title}
                className="p-3 rounded-lg bg-surface-raised/20 border border-border-subtle space-y-1"
              >
                <div className="text-xs font-medium text-text-primary">
                  {interest.title}
                </div>
                <p className="font-mono text-[10px] text-text-muted leading-relaxed">
                  {interest.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Intentional Empty State */}
      {!loading && profile.bioParagraphs.length === 0 && (
        <div className="py-12 text-center p-6 rounded-lg border border-dashed border-border-subtle bg-surface-raised/10">
          <p className="text-xs text-text-secondary font-medium">Profile pending configuration</p>
          <p className="font-mono text-[11px] text-text-muted mt-1">
            The owner can customize biography, current focus, and education in the Admin CMS.
          </p>
        </div>
      )}
    </article>
  );
}
