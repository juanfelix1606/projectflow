"use client";

import { useState, useTransition } from "react";
import { Plus, Tag } from "lucide-react";
import { toast } from "sonner";
import { createTaskLabel, setTaskLabels } from "@/app/actions/task";

type Label = { id: string; name: string; color: string };

export function TaskLabels({ taskId, workspaceId, available, selected }: {
  taskId: string;
  workspaceId: string;
  available: Label[];
  selected: string[];
}) {
  const [labels, setLabels] = useState(available);
  const [chosen, setChosen] = useState(selected);
  const [newName, setNewName] = useState("");
  const [pending, startTransition] = useTransition();
  function toggle(labelId: string) {
    const next = chosen.includes(labelId) ? chosen.filter((id) => id !== labelId) : [...chosen, labelId];
    setChosen(next);
    startTransition(async () => {
      const result = await setTaskLabels(taskId, workspaceId, next);
      if (result.error) {
        setChosen(chosen);
        toast.error(result.error);
      }
    });
  }
  function create() {
    startTransition(async () => {
      const result = await createTaskLabel(taskId, workspaceId, newName);
      if (result.error) toast.error(result.error);
      else if (result.label) {
        setLabels((current) => [...current.filter((label) => label.id !== result.label.id), result.label]);
        setChosen((current) => current.includes(result.label.id) ? current : [...current, result.label.id]);
        setNewName("");
        toast.success("Label added to task");
      }
    });
  }
  return (
    <div>
      {labels.length ? <div className="space-y-2">{labels.map((label) => <label key={label.id} className="flex items-center gap-2 text-xs text-slate-600"><input type="checkbox" checked={chosen.includes(label.id)} onChange={() => toggle(label.id)} disabled={pending} className="accent-indigo-600" /><span className="size-2 rounded-full" style={{ backgroundColor: label.color }} />{label.name}</label>)}</div> : <p className="flex items-center gap-1.5 text-[10px] text-slate-400"><Tag size={12} /> No labels yet</p>}
      <form className="mt-3 flex gap-1.5" onSubmit={(event) => { event.preventDefault(); create(); }}>
        <input value={newName} onChange={(event) => setNewName(event.target.value)} maxLength={40} className="input h-8 min-w-0 flex-1 text-[11px]" placeholder="New label" aria-label="New label name" />
        <button type="submit" disabled={pending || !newName.trim()} aria-label="Create label" className="btn-secondary h-8 px-2"><Plus size={14} /></button>
      </form>
    </div>
  );
}
