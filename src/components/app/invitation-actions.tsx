"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { revokeWorkspaceInvitation } from "@/app/actions/workspace";

export function RevokeInvitation({ workspaceId, invitationId }: { workspaceId: string; invitationId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button disabled={pending} onClick={() => startTransition(async () => {
    const result = await revokeWorkspaceInvitation(workspaceId, invitationId);
    if (result.error) toast.error(result.error);
    else { toast.success("Invitation revoked"); router.refresh(); }
  })} className="text-xs font-medium text-slate-400 hover:text-rose-600">{pending ? "Revoking…" : "Revoke"}</button>;
}
