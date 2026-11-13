"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Archive, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProject, updateProjectStatus } from "@/app/actions/project";

export function ProjectActions({ projectId, status }: { projectId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function archive() {
    startTransition(async () => {
      const result = await updateProjectStatus(projectId, status === "archived" ? "restore" : "archived");
      if (result.error) toast.error(result.error);
      else { toast.success(status === "archived" ? "Project restored" : "Project archived"); router.refresh(); }
    });
  }
  function remove() {
    if (!window.confirm("Delete this project and all its tasks? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteProject(projectId);
      if (result.error) toast.error(result.error);
      else { toast.success("Project deleted"); router.refresh(); }
    });
  }
  return <div className="flex items-center gap-1">
    <button type="button" title={status === "archived" ? "Restore project" : "Archive project"} disabled={pending} onClick={archive} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"><Archive size={15} /></button>
    <button type="button" title="Delete project" disabled={pending} onClick={remove} className="rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600"><Trash2 size={15} /></button>
  </div>;
}
