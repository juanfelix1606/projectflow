"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { changeWorkspaceMemberRole, removeWorkspaceMember } from "@/app/actions/workspace";

export function MemberActions({ workspaceId, userId, role, canManage, canManageOwner }: { workspaceId: string; userId: string; role: string; canManage: boolean; canManageOwner: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  if (!canManage) return <span className="text-xs capitalize text-slate-400">{role}</span>;
  function change(newRole: string) {
    startTransition(async () => {
      const result = await changeWorkspaceMemberRole(workspaceId, userId, newRole);
      if (result.error) toast.error(result.error);
      else { toast.success("Member role updated"); router.refresh(); }
    });
  }
  function remove() {
    if (!window.confirm("Remove this member from the workspace?")) return;
    startTransition(async () => {
      const result = await removeWorkspaceMember(workspaceId, userId);
      if (result.error) toast.error(result.error);
      else { toast.success("Member removed"); router.refresh(); }
    });
  }
  return <div className="flex items-center gap-2"><select disabled={pending} aria-label="Member role" value={role} onChange={(event) => change(event.target.value)} className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs capitalize text-slate-600">{canManageOwner && <option value="owner">Owner</option>}<option value="admin">Admin</option><option value="member">Member</option><option value="viewer">Viewer</option></select><button disabled={pending} onClick={remove} className="rounded-md px-2 py-1.5 text-xs text-rose-600 hover:bg-rose-50">Remove</button></div>;
}
