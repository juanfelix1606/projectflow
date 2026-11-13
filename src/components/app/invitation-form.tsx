"use client";

import { useState, useTransition } from "react";
import { Check, Copy, Send } from "lucide-react";
import { toast } from "sonner";
import { createWorkspaceInvitation } from "@/app/actions/workspace";

export function InvitationForm({ workspaceId }: { workspaceId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  const [link, setLink] = useState("");
  const [email, setEmail] = useState("");
  function submit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await createWorkspaceInvitation(workspaceId, String(formData.get("email") ?? ""), String(formData.get("role") ?? "member"));
      if (result.error) setError(result.error);
      else if (result.link) {
        setLink(result.link);
        setEmail(result.email);
        toast.success("Invitation link created");
      }
    });
  }
  async function copy() {
    await navigator.clipboard.writeText(link);
    toast.success("Invitation link copied");
  }
  return (
    <form action={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-[1fr_150px_auto]">
        <input type="email" name="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="input h-10" placeholder="teammate@company.com" aria-label="Invite by email" />
        <select name="role" className="input h-10" aria-label="Workspace role"><option value="member">Member</option><option value="admin">Admin</option><option value="viewer">Viewer</option></select>
        <button className="btn-primary h-10" disabled={pending}>{pending ? "Creating…" : <><Send size={14} /> Create invite</>}</button>
      </div>
      {error && <p role="alert" className="text-xs text-rose-600">{error}</p>}
      {link && <div role="status" className="rounded-lg border border-emerald-100 bg-emerald-50 p-3"><div className="flex items-center gap-2 text-xs font-semibold text-emerald-800"><Check size={14} /> Invite ready for {email}</div><div className="mt-2 flex gap-2"><input readOnly value={link} className="input h-9 min-w-0 flex-1 bg-white text-xs" aria-label="Invitation link" /><button type="button" onClick={copy} className="btn-secondary h-9 shrink-0"><Copy size={13} /> Copy</button></div><p className="mt-2 text-[10px] text-emerald-700">Share this link with the invited person. It expires in 7 days and only works for the email above. No email delivery provider is configured.</p></div>}
    </form>
  );
}
