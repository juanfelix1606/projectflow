import { notFound } from "next/navigation";
import { AuthLayout } from "@/components/auth/auth-layout";
import { InviteAcceptance } from "@/components/app/invite-acceptance";
import { SupabaseRequired } from "@/components/app/supabase-required";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export default async function InvitationPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token } = await searchParams;
  if (!token || token.length > 100) notFound();
  if (!hasSupabaseConfig()) return <AuthLayout title="Join your team" description="Connect the project workspace to continue."><SupabaseRequired compact /></AuthLayout>;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return <AuthLayout title="Join your team" description="Your next project is one step away."><InviteAcceptance token={token} signedIn={Boolean(user)} /></AuthLayout>;
}
