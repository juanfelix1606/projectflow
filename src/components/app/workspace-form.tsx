"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createWorkspace } from "@/app/actions/workspace";

export function WorkspaceForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    setError("");
    startTransition(async () => {
      const result = await createWorkspace(formData);
      if (result.error) setError(result.error);
      else if (result.id) router.push(`/app/${result.id}/overview`);
    });
  }

  return (
    <form action={submit} className="space-y-4">
      <label className="block space-y-1.5"><span className="text-sm font-semibold">Workspace name</span><input name="name" required minLength={2} maxLength={80} className="input" placeholder="Studio North" /></label>
      <label className="block space-y-1.5"><span className="text-sm font-semibold">Description <span className="font-normal text-slate-400">(optional)</span></span><textarea name="description" maxLength={500} className="input min-h-24 resize-y" placeholder="What are you working on together?" /></label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button className="btn-primary w-full" disabled={pending}>{pending ? "Creating…" : "Create workspace"}</button>
    </form>
  );
}
