"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { ProjectForm } from "@/components/app/project-form";

type InitialProject = { id: string; name: string; description: string; status: string; priority: string; due_date: string | null };

export function ProjectDialog({ workspaceId, project }: { workspaceId: string; project?: InitialProject }) {
  const [open, setOpen] = useState(false);
  return <>
    <button className={project ? "btn-secondary" : "btn-primary"} onClick={() => setOpen(true)}>{project ? "Edit project" : <><Plus size={15} /> New project</>}</button>
    {open && <div className="fixed inset-0 z-50 grid place-items-center overflow-y-auto bg-slate-950/40 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="project-dialog-title" className="surface my-8 w-full max-w-lg p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between"><div><p className="eyebrow">{project ? "Project details" : "New project"}</p><h2 id="project-dialog-title" className="mt-1 text-xl font-semibold">{project ? "Edit project" : "Create a project"}</h2></div><button aria-label="Close dialog" onClick={() => setOpen(false)} className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"><X size={17} /></button></div>
        <ProjectForm workspaceId={workspaceId} initialProject={project} onDone={() => setOpen(false)} />
      </section>
    </div>}
  </>;
}
