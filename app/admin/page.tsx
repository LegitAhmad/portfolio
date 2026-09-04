import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin/auth";

export default async function AdminRootPage() {
  const session = await verifyAdminSession();

  if (!session.isAdmin) {
    redirect("/admin/login");
  }

  redirect("/admin/projects");
}
