"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { updateTask } from "@/app/actions/task";

type Assignee = { id: string; name: string };
type Task = { id: string; title: string; description: string; status: string; priority: string; due_date: string | null; assignee_id: string | null };

export function TaskDetailForm({ task, assignees }: { task: Task; assignees: Assignee[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function save(formData: FormData) {
    const changes = {
      title: String(formData.get("title") ?? ""),
      description: String(formData.get("description") ?? ""),
      status: String(formData.get("status") ?? ""),
      priority: String(formData.get("priority") ?? ""),
      dueDate: String(formData.get("dueDate") ?? "") || null,
      assigneeId: String(formData.get("assigneeId") ?? "") || null,
    };
    startTransition(async () => {
      const result = await updateTask(task.id, changes);
      if (result.error) toast.error(result.error);
      else { toast.success("Task updated"); router.refresh(); }
    });
  }
  return (
    <form action={save} className="space-y-4">
      <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">Title</span><input name="title" defaultValue={task.title} required maxLength={200} className="input h-10" /></label>
      <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">Description</span><textarea name="description" defaultValue={task.description} maxLength={10000} className="input min-h-32 resize-y" placeholder="Add context, links, or acceptance criteria…" /></label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">Status</span><select name="status" defaultValue={task.status} className="input h-10"><option value="backlog">Backlog</option><option value="todo">To do</option><option value="in_progress">In progress</option><option value="in_review">In review</option><option value="done">Done</option></select></label>
        <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">Priority</span><select name="priority" defaultValue={task.priority} className="input h-10"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select></label>
        <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">Assignee</span><select name="assigneeId" defaultValue={task.assignee_id ?? ""} className="input h-10"><option value="">Unassigned</option>{assignees.map((assignee) => <option key={assignee.id} value={assignee.id}>{assignee.name}</option>)}</select></label>
        <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">Due date</span><input name="dueDate" type="date" defaultValue={task.due_date ?? ""} className="input h-10" /></label>
      </div>
      <div className="flex justify-end border-t border-slate-100 pt-4"><button className="btn-primary" disabled={pending}><Save size={14} />{pending ? "Saving…" : "Save task"}</button></div>
    </form>
  );
}
