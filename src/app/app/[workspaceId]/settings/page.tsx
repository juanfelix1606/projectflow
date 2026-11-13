import { notFound } from "next/navigation";
import { Settings2, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageTitle } from "@/components/app/page-title";
import { ProfileSettingsForm, WorkspaceSettingsForm } from "@/components/app/settings-form";

export default async function SettingsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [{ data: workspace }, { data: membership }, { data: profile }, { data: preferences }] = await Promise.all([
    supabase.from("workspaces").select("id,name,description").eq("id", workspaceId).maybeSingle(),
    supabase.from("workspace_members").select("role").eq("workspace_id", workspaceId).eq("user_id", user.id).maybeSingle(),
    supabase.from("profiles").select("full_name,avatar_url").eq("id", user.id).maybeSingle(),
    supabase.from("user_preferences").select("theme,date_format,timezone,email_notifications").eq("user_id", user.id).maybeSingle(),
  ]);
  if (!workspace || !membership) notFound();
  return (
    <div>
      <PageTitle eyebrow="Make it yours" title="Settings" description="Your profile and workspace preferences." />
      <section className="surface mb-5 p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><UserRound size={16} /></span><div><h2 className="text-sm font-semibold">Your profile</h2><p className="mt-0.5 text-[10px] text-slate-400">Personal information and preferences</p></div></div>
        <ProfileSettingsForm
          userId={user.id}
          email={user.email ?? ""}
          name={profile?.full_name ?? ""}
          avatarUrl={profile?.avatar_url ?? null}
          preferences={{
            theme: preferences?.theme ?? "system",
            date_format: preferences?.date_format ?? "MMM d, yyyy",
            timezone: preferences?.timezone ?? "UTC",
            email_notifications: preferences?.email_notifications ?? true,
          }}
        />
      </section>
      <section className="surface p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><Settings2 size={16} /></span><div><h2 className="text-sm font-semibold">Workspace settings</h2><p className="mt-0.5 text-[10px] text-slate-400">Manage the space you&apos;re working in</p></div></div>
        <WorkspaceSettingsForm workspaceId={workspace.id} name={workspace.name} description={workspace.description} role={membership.role} />
      </section>
    </div>
  );
}
