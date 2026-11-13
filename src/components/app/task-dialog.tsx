"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { TaskForm } from "@/components/app/task-form";

type Project = { id: string; name: string };

export function TaskDialog({ workspaceId, projects, defaultProjectId, defaultStatus }: {
  workspaceId: string;
  projects: Project[];
  defaultProjectId?: string;
  defaultStatus?: string;
}) {
  const [open, setOpen] = useState(false);
  return <>
    <button className="btn-primary" onClick={() => setOpen(true)}><Plus size={15} /> New task</button>
    {open && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="task-dialog-title" className="surface my-8 w-full max-w-lg p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between"><div><p className="eyebrow">Task details</p><h2 id="task-dialog-title" className="mt-1 text-xl font-semibold">Create a task</h2></div><button aria-label="Close dialog" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={17} /></button></div>
        <TaskForm workspaceId={workspaceId} projects={projects} defaultProjectId={defaultProjectId} defaultStatus={defaultStatus} onDone={() => setOpen(false)} />
      </section>
    </div>}
  </>;
}
