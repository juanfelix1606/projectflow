"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteTask, updateTask } from "@/app/actions/task";

export function TaskRowActions({ taskId, status }: { taskId: string; status: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function changeStatus(value: string) {
    startTransition(async () => {
      const result = await updateTask(taskId, { status: value });
      if (result.error) toast.error(result.error);
      else { toast.success("Task updated"); router.refresh(); }
    });
  }
  function remove() {
    if (!window.confirm("Delete this task? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteTask(taskId);
      if (result.error) toast.error(result.error);
      else { toast.success("Task deleted"); router.refresh(); }
    });
  }
  return <div className="flex items-center gap-1">
    <select aria-label="Change task status" value={status} disabled={pending} onChange={(event) => changeStatus(event.target.value)} className="max-w-32 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] capitalize text-slate-600"><option value="backlog">Backlog</option><option value="todo">To do</option><option value="in_progress">In progress</option><option value="in_review">In review</option><option value="done">Done</option></select>
    <button type="button" aria-label="Delete task" title="Delete task" disabled={pending} onClick={remove} className="rounded-md p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600">×</button>
  </div>;
}
