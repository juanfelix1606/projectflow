"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight, LoaderCircle, MailCheck } from "lucide-react";
import { acceptWorkspaceInvitation } from "@/app/actions/workspace";

export function InviteAcceptance({ token, signedIn }: { token: string; signedIn: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState("");
  function accept() {
    setError("");
    startTransition(async () => {
      const result = await acceptWorkspaceInvitation(token);
      if (result.error) setError(result.error);
      else if (result.workspaceId) {
        router.push(`/app/${result.workspaceId}/overview`);
        router.refresh();
      }
    });
  }
  if (!signedIn) {
    const next = `/invite?token=${encodeURIComponent(token)}`;
    return <div className="text-center"><MailCheck className="mx-auto text-indigo-600" size={34} /><h2 className="mt-4 font-semibold">Sign in to accept</h2><p className="mt-2 text-sm leading-6 text-slate-500">Sign in with the email address this invitation was sent to.</p><Link className="btn-primary mt-5 w-full" href={`/login?next=${encodeURIComponent(next)}`}>Continue to sign in <ArrowRight size={14} /></Link></div>;
  }
  return <div className="text-center"><MailCheck className="mx-auto text-indigo-600" size={34} /><h2 className="mt-4 font-semibold">You&apos;re invited</h2><p className="mt-2 text-sm leading-6 text-slate-500">Accept the invitation to join your teammate&apos;s ProjectFlow workspace. The link can only be used by the invited email address.</p>{error && <p role="alert" className="mt-4 text-sm text-rose-600">{error}</p>}<button onClick={accept} disabled={pending} className="btn-primary mt-5 w-full">{pending ? <><LoaderCircle size={15} className="animate-spin" /> Checking invitation…</> : <>Accept invitation <ArrowRight size={14} /></>}</button></div>;
}
