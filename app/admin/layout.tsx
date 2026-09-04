import React from "react";
import { verifyAdminSession } from "@/lib/admin/auth";
import { AdminNav } from "@/components/admin/admin-nav";

export const metadata = {
  title: "Admin CMS — Portfolio",
  robots: "noindex, nofollow",
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await verifyAdminSession();

  return (
    <div className="min-h-screen bg-[#0a0c10] text-[#e1e4ea] font-sans antialiased selection:bg-[#4e95ff]/20">
      <AdminNav adminEmail={session.email} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
