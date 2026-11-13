import { format } from "date-fns";
import { Users2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getInitials } from "@/lib/utils";
import { PageTitle } from "@/components/app/page-title";
import { InvitationForm } from "@/components/app/invitation-form";
import { MemberActions } from "@/components/app/member-actions";
import { RevokeInvitation } from "@/components/app/invitation-actions";

export default async function MembersPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const [{ data: members, error }, { data: invitations }, { data: currentMember }] = await Promise.all([
    supabase.from("workspace_members").select("user_id,role,joined_at").eq("workspace_id", workspaceId).order("joined_at"),
    supabase.from("workspace_invitations").select("id,email,role,expires_at,created_at").eq("workspace_id", workspaceId).is("accepted_at", null).order("created_at", { ascending: false }),
    supabase.from("workspace_members").select("role").eq("workspace_id", workspaceId).eq("user_id", user.id).maybeSingle(),
  ]);
  const { data: profiles } = await supabase.from("profiles").select("id,full_name,avatar_url").in("id", (members ?? []).map((member) => member.user_id));
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const canManage = currentMember?.role === "owner" || currentMember?.role === "admin";
  const canManageOwner = currentMember?.role === "owner";
  return (
    <div>
      <PageTitle eyebrow="Workspace" title="Members" description={`${members?.length ?? 0} people working together`} />
      {canManage && <section className="surface mb-5 p-5"><div className="mb-4"><h2 className="font-semibold">Invite someone new</h2><p className="mt-1 text-xs text-slate-500">Create a secure, single-use link for a teammate.</p></div><InvitationForm workspaceId={workspaceId} /></section>}
      <section className="surface overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold">Workspace members</h2><p className="mt-1 text-xs text-slate-400">People with access to this workspace</p></div><Users2 size={17} className="text-slate-400" /></div>
        {error ? <div role="alert" className="p-6 text-sm text-rose-600">Members could not be loaded.</div> : members?.length ? <div className="divide-y divide-slate-100">{members.map((member) => {
          const profile = profileMap.get(member.user_id);
          const name = profile?.full_name || "ProjectFlow member";
          return <div key={member.user_id} className="flex items-center gap-3 px-5 py-3.5"><span className="grid size-9 place-items-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">{getInitials(name)}</span><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{name}{member.user_id === user.id && <span className="ml-1.5 text-[10px] text-slate-400">(you)</span>}</p><p className="mt-0.5 text-[10px] text-slate-400">Joined {format(new Date(member.joined_at), "MMM d, yyyy")}</p></div><MemberActions workspaceId={workspaceId} userId={member.user_id} role={member.role} canManage={canManage && member.user_id !== user.id} canManageOwner={canManageOwner} /></div>;
        })}</div> : <p className="p-8 text-center text-sm text-slate-400">No workspace members yet.</p>}
      </section>
      {canManage && invitations && invitations.length > 0 && <section className="surface mt-5 overflow-hidden"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold">Pending invitations</h2><p className="mt-1 text-xs text-slate-400">Invitations expire seven days after they are created.</p></div><div className="divide-y divide-slate-100">{invitations.map((invite) => <div key={invite.id} className="flex items-center gap-3 px-5 py-3"><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{invite.email}</p><p className="mt-1 text-[10px] capitalize text-slate-400">{invite.role} · expires {format(new Date(invite.expires_at), "MMM d, yyyy")}</p></div><RevokeInvitation workspaceId={workspaceId} invitationId={invite.id} /></div>)}</div></section>}
    </div>
  );
}
