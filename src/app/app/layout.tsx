import { redirect } from "next/navigation";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { SupabaseRequired } from "@/components/app/supabase-required";

export const dynamic = "force-dynamic";

export default async function ProtectedAppLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  if (!hasSupabaseConfig()) return <div className="min-h-screen px-5 py-12"><SupabaseRequired /></div>;
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  return children;
}
