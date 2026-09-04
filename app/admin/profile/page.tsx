"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface FocusItem {
  topic: string;
  details: string;
}

interface EducationItem {
  degree: string;
  institution: string;
  year: string;
  details?: string;
}

interface InterestItem {
  title: string;
  description: string;
}

interface ProfileForm {
  id?: string;
  full_name: string;
  role_headline: string;
  location: string;
  avatar_url: string;
  bioText: string;
  current_focus: FocusItem[];
  education: EducationItem[];
  interests: InterestItem[];
}

export default function AdminProfilePage() {
  const router = useRouter();
  const [form, setForm] = useState<ProfileForm>({
    full_name: "",
    role_headline: "",
    location: "Remote",
    avatar_url: "",
    bioText: "",
    current_focus: [],
    education: [],
    interests: [],
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const loadProfile = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/profile");
      if (res.status === 401) {
        router.push("/admin/login");
        return;
      }
      const data = await res.json();
      if (data.success && data.profile) {
        const p = data.profile;
        setForm({
          id: p.id,
          full_name: p.full_name || "",
          role_headline: p.role_headline || "",
          location: p.location || "Remote",
          avatar_url: p.avatar_url || "",
          bioText: Array.isArray(p.bio_paragraphs) ? p.bio_paragraphs.join("\n\n") : "",
          current_focus: Array.isArray(p.current_focus) ? p.current_focus : [],
          education: Array.isArray(p.education) ? p.education : [],
          interests: Array.isArray(p.interests) ? p.interests : [],
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    let active = true;
    fetch("/api/admin/profile")
      .then((res) => {
        if (res.status === 401) {
          router.push("/admin/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (!active || !data) return;
        if (data.success && data.profile) {
          const p = data.profile;
          setForm({
            id: p.id,
            full_name: p.full_name || "",
            role_headline: p.role_headline || "",
            location: p.location || "Remote",
            avatar_url: p.avatar_url || "",
            bioText: Array.isArray(p.bio_paragraphs) ? p.bio_paragraphs.join("\n\n") : "",
            current_focus: Array.isArray(p.current_focus) ? p.current_focus : [],
            education: Array.isArray(p.education) ? p.education : [],
            interests: Array.isArray(p.interests) ? p.interests : [],
          });
        }
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "Failed to load profile");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("category", "avatar");

    try {
      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((prev) => ({ ...prev, avatar_url: data.url }));
      } else {
        setError(data.error || "Avatar upload failed");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error uploading avatar");
    } finally {
      setUploading(false);
    }
  };

  const handleAddFocus = () => {
    setForm((prev) => ({
      ...prev,
      current_focus: [...prev.current_focus, { topic: "", details: "" }],
    }));
  };

  const handleRemoveFocus = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      current_focus: prev.current_focus.filter((_, i) => i !== idx),
    }));
  };

  const handleAddEducation = () => {
    setForm((prev) => ({
      ...prev,
      education: [...prev.education, { degree: "", institution: "", year: "", details: "" }],
    }));
  };

  const handleRemoveEducation = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== idx),
    }));
  };

  const handleAddInterest = () => {
    setForm((prev) => ({
      ...prev,
      interests: [...prev.interests, { title: "", description: "" }],
    }));
  };

  const handleRemoveInterest = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      interests: prev.interests.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const bio_paragraphs = form.bioText
      .split("\n\n")
      .map((p) => p.trim())
      .filter(Boolean);

    const payload = {
      ...(form.id ? { id: form.id } : {}),
      full_name: form.full_name,
      role_headline: form.role_headline,
      location: form.location,
      avatar_url: form.avatar_url || null,
      bio_paragraphs,
      current_focus: form.current_focus.filter((f) => f.topic.trim()),
      education: form.education.filter((e) => e.degree.trim()),
      interests: form.interests.filter((i) => i.title.trim()),
    };

    try {
      const res = await fetch("/api/admin/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess(true);
        loadProfile();
      } else {
        setError(data.error || "Failed to update profile");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error saving profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12 text-xs text-[#8b949e]">
        <div className="animate-spin w-5 h-5 border-2 border-[#4e95ff] border-t-transparent rounded-full mr-2" />
        Loading profile configuration...
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">About Me & Profile CMS</h1>
        <p className="text-xs text-[#8b949e] mt-0.5">
          Manage your personal biography, active architectural focus, education, and technical interests.
        </p>
      </div>

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-lg text-xs text-rose-300">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-xs text-emerald-300">
          Profile saved successfully.
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 1. Header Profile Basics */}
        <div className="bg-[#12161f] border border-[#212631] rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-white border-b border-[#212631] pb-3">
            Profile Basics
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="Software Engineer"
                className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-xs text-white focus:outline-none focus:border-[#4e95ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Role Headline *
              </label>
              <input
                type="text"
                required
                value={form.role_headline}
                onChange={(e) => setForm({ ...form, role_headline: e.target.value })}
                placeholder="Systems & Web Applications Architect"
                className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-xs text-white focus:outline-none focus:border-[#4e95ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[#8b949e] mb-1">
                Location
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="San Francisco, CA / Remote"
                className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-xs text-white focus:outline-none focus:border-[#4e95ff]"
              />
            </div>
          </div>

          {/* Avatar upload */}
          <div>
            <label className="block text-xs font-mono text-[#8b949e] mb-1">
              Profile Avatar / Photo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-[#0a0c10] border border-[#212631] overflow-hidden relative flex items-center justify-center">
                {form.avatar_url ? (
                  <Image
                    src={form.avatar_url}
                    alt="Avatar"
                    fill
                    className="object-cover"
                    sizes="56px"
                  />
                ) : (
                  <span className="text-[10px] text-[#484f58] font-mono">No Avatar</span>
                )}
              </div>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/avif"
                onChange={handleAvatarUpload}
                disabled={uploading}
                className="text-xs text-[#8b949e] file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:bg-[#212631] file:text-white hover:file:bg-[#2d3748] cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 2. Biography & Philosophy */}
        <div className="bg-[#12161f] border border-[#212631] rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-white border-b border-[#212631] pb-3">
            Engineering Narrative & Background
          </h2>
          <p className="text-[11px] text-[#8b949e]">
            Separate paragraphs with a blank line.
          </p>
          <textarea
            rows={5}
            value={form.bioText}
            onChange={(e) => setForm({ ...form, bioText: e.target.value })}
            placeholder="Specializing in high-performance web systems...&#10;&#10;Driven by building software where mechanical sympathy meets intentional visual design..."
            className="w-full px-3 py-2 rounded-lg bg-[#0a0c10] border border-[#212631] text-xs text-white focus:outline-none focus:border-[#4e95ff]"
          />
        </div>

        {/* 3. Current Focus */}
        <div className="bg-[#12161f] border border-[#212631] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#212631] pb-3">
            <h2 className="text-sm font-semibold text-white">Current Architectural Focus</h2>
            <button
              type="button"
              onClick={handleAddFocus}
              className="px-2.5 py-1 rounded bg-[#212631] hover:bg-[#2d3748] text-white text-xs"
            >
              + Add Focus
            </button>
          </div>

          <div className="space-y-3">
            {form.current_focus.map((item, idx) => (
              <div key={idx} className="p-3 bg-[#0a0c10] border border-[#212631] rounded-lg space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={item.topic}
                    onChange={(e) => {
                      const copy = [...form.current_focus];
                      copy[idx].topic = e.target.value;
                      setForm({ ...form, current_focus: copy });
                    }}
                    placeholder="Focus Topic (e.g. Event-Driven Client Runtimes)"
                    className="w-full px-2.5 py-1.5 rounded bg-[#12161f] border border-[#212631] text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveFocus(idx)}
                    className="text-xs text-rose-400 hover:text-rose-300 px-2"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={item.details}
                  onChange={(e) => {
                    const copy = [...form.current_focus];
                    copy[idx].details = e.target.value;
                    setForm({ ...form, current_focus: copy });
                  }}
                  placeholder="Details on what you are currently engineering..."
                  className="w-full px-2.5 py-1.5 rounded bg-[#12161f] border border-[#212631] text-xs text-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 4. Education */}
        <div className="bg-[#12161f] border border-[#212631] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#212631] pb-3">
            <h2 className="text-sm font-semibold text-white">Education & Academics</h2>
            <button
              type="button"
              onClick={handleAddEducation}
              className="px-2.5 py-1 rounded bg-[#212631] hover:bg-[#2d3748] text-white text-xs"
            >
              + Add Education
            </button>
          </div>

          <div className="space-y-3">
            {form.education.map((item, idx) => (
              <div key={idx} className="p-3 bg-[#0a0c10] border border-[#212631] rounded-lg space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <input
                      type="text"
                      value={item.degree}
                      onChange={(e) => {
                        const copy = [...form.education];
                        copy[idx].degree = e.target.value;
                        setForm({ ...form, education: copy });
                      }}
                      placeholder="Degree / Certificate"
                      className="px-2.5 py-1.5 rounded bg-[#12161f] border border-[#212631] text-xs text-white"
                    />
                    <input
                      type="text"
                      value={item.institution}
                      onChange={(e) => {
                        const copy = [...form.education];
                        copy[idx].institution = e.target.value;
                        setForm({ ...form, education: copy });
                      }}
                      placeholder="Institution"
                      className="px-2.5 py-1.5 rounded bg-[#12161f] border border-[#212631] text-xs text-white"
                    />
                    <input
                      type="text"
                      value={item.year}
                      onChange={(e) => {
                        const copy = [...form.education];
                        copy[idx].year = e.target.value;
                        setForm({ ...form, education: copy });
                      }}
                      placeholder="2018 — 2022"
                      className="px-2.5 py-1.5 rounded bg-[#12161f] border border-[#212631] text-xs text-white"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveEducation(idx)}
                    className="text-xs text-rose-400 hover:text-rose-300 px-2"
                  >
                    ✕
                  </button>
                </div>
                <input
                  type="text"
                  value={item.details || ""}
                  onChange={(e) => {
                    const copy = [...form.education];
                    copy[idx].details = e.target.value;
                    setForm({ ...form, education: copy });
                  }}
                  placeholder="Optional details, concentration, honors..."
                  className="w-full px-2.5 py-1.5 rounded bg-[#12161f] border border-[#212631] text-xs text-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* 5. Interests */}
        <div className="bg-[#12161f] border border-[#212631] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-[#212631] pb-3">
            <h2 className="text-sm font-semibold text-white">Engineering Interests</h2>
            <button
              type="button"
              onClick={handleAddInterest}
              className="px-2.5 py-1 rounded bg-[#212631] hover:bg-[#2d3748] text-white text-xs"
            >
              + Add Interest
            </button>
          </div>

          <div className="space-y-3">
            {form.interests.map((item, idx) => (
              <div key={idx} className="p-3 bg-[#0a0c10] border border-[#212631] rounded-lg space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => {
                      const copy = [...form.interests];
                      copy[idx].title = e.target.value;
                      setForm({ ...form, interests: copy });
                    }}
                    placeholder="Interest Title (e.g. Distributed State Engines)"
                    className="w-full px-2.5 py-1.5 rounded bg-[#12161f] border border-[#212631] text-xs text-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(idx)}
                    className="text-xs text-rose-400 hover:text-rose-300 px-2"
                  >
                    ✕
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={item.description}
                  onChange={(e) => {
                    const copy = [...form.interests];
                    copy[idx].description = e.target.value;
                    setForm({ ...form, interests: copy });
                  }}
                  placeholder="Brief description of your curiosity or research..."
                  className="w-full px-2.5 py-1.5 rounded bg-[#12161f] border border-[#212631] text-xs text-white"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-[#2563eb] hover:bg-[#1d4ed8] text-xs font-medium text-white transition-colors disabled:opacity-50 cursor-pointer shadow-lg shadow-blue-500/10"
          >
            {saving ? "Saving Profile..." : "Save Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
