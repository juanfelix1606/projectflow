"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createProject, updateProject } from "@/app/actions/project";

type InitialProject = { id: string; name: string; description: string; status: string; priority: string; due_date: string | null };

export function ProjectForm({ workspaceId, initialProject, onDone }: { workspaceId: string; initialProject?: InitialProject; onDone?: () => void }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    formData.set("workspaceId", workspaceId);
    setError("");
    startTransition(async () => {
      const result = initialProject ? await updateProject(initialProject.id, formData) : await createProject(formData);
      if (result.error) setError(result.error);
      else {
        onDone?.();
        router.refresh();
      }
    });
  }

  return (
    <form action={submit} className="space-y-4">
      <label className="block space-y-1.5"><span className="text-sm font-semibold">Project name</span><input name="name" required minLength={2} maxLength={120} className="input" placeholder="Website refresh" defaultValue={initialProject?.name} /></label>
      <label className="block space-y-1.5"><span className="text-sm font-semibold">Description</span><textarea name="description" maxLength={5000} className="input min-h-24 resize-y" placeholder="What does success look like?" defaultValue={initialProject?.description} /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5"><span className="text-sm font-semibold">Status</span><select name="status" className="input" defaultValue={initialProject?.status ?? "planning"}><option value="planning">Planning</option><option value="active">Active</option><option value="on_hold">On hold</option><option value="completed">Completed</option><option value="archived">Archived</option></select></label>
        <label className="block space-y-1.5"><span className="text-sm font-semibold">Priority</span><select name="priority" className="input" defaultValue={initialProject?.priority ?? "medium"}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
      </div>
      <label className="block space-y-1.5"><span className="text-sm font-semibold">Due date</span><input name="dueDate" type="date" className="input" defaultValue={initialProject?.due_date ?? ""} /></label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button className="btn-primary w-full" disabled={pending}>{pending ? "Saving…" : initialProject ? "Save changes" : "Create project"}</button>
    </form>
  );
}
