"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { createTask } from "@/app/actions/task";

type Project = { id: string; name: string };

export function TaskForm({ workspaceId, projects, defaultProjectId, defaultStatus = "backlog", onDone }: { workspaceId: string; projects: Project[]; defaultProjectId?: string; defaultStatus?: string; onDone?: () => void }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(formData: FormData) {
    formData.set("workspaceId", workspaceId);
    setError("");
    startTransition(async () => {
      const result = await createTask(formData);
      if (result.error) setError(result.error);
      else {
        onDone?.();
        router.refresh();
      }
    });
  }

  return (
    <form action={submit} className="space-y-4">
      <label className="block space-y-1.5"><span className="text-sm font-semibold">Task title</span><input name="title" required maxLength={200} className="input" placeholder="Write the first draft" /></label>
      <label className="block space-y-1.5"><span className="text-sm font-semibold">Project</span><select name="projectId" required className="input" defaultValue={defaultProjectId ?? ""}><option value="" disabled>Select a project</option>{projects.map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
      <label className="block space-y-1.5"><span className="text-sm font-semibold">Description</span><textarea name="description" maxLength={10000} className="input min-h-20 resize-y" placeholder="Add helpful context…" /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5"><span className="text-sm font-semibold">Status</span><select name="status" className="input" defaultValue={defaultStatus}><option value="backlog">Backlog</option><option value="todo">To do</option><option value="in_progress">In progress</option><option value="in_review">In review</option><option value="done">Done</option></select></label>
        <label className="block space-y-1.5"><span className="text-sm font-semibold">Priority</span><select name="priority" className="input"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
      </div>
      <label className="block space-y-1.5"><span className="text-sm font-semibold">Due date</span><input name="dueDate" type="date" className="input" /></label>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button className="btn-primary w-full" disabled={pending || projects.length === 0}>{pending ? "Creating…" : projects.length === 0 ? "Create a project first" : "Create task"}</button>
    </form>
  );
}
