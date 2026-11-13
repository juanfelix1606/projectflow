import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { WorkspaceShell } from "@/components/app/workspace-shell";

export default async function WorkspaceLayout({ children, params }: Readonly<{
  children: React.ReactNode;
  params: Promise<{ workspaceId: string }>;
}>) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const [{ data: workspace }, { data: membership }, { data: workspaces }, { data: profile }, { count: unreadNotifications }] = await Promise.all([
    supabase.from("workspaces").select("id,name").eq("id", workspaceId).maybeSingle(),
    supabase.from("workspace_members").select("role").eq("workspace_id", workspaceId).eq("user_id", user.id).maybeSingle(),
    supabase.from("workspaces").select("id,name").order("created_at"),
    supabase.from("profiles").select("full_name").eq("id", user.id).maybeSingle(),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("user_id", user.id).is("read_at", null),
  ]);
  if (!workspace || !membership) notFound();

  return (
    <WorkspaceShell
      workspace={workspace}
      workspaces={workspaces ?? []}
      user={{ id: user.id, email: user.email, name: profile?.full_name }}
      unreadNotifications={unreadNotifications ?? 0}
    >
      {children}
    </WorkspaceShell>
  );
}
