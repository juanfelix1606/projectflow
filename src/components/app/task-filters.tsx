"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { Search, X } from "lucide-react";

type Assignee = { id: string; name: string };

export function TaskFilters({ assignees, currentUserId }: { assignees: Assignee[]; currentUserId: string }) {
  const router = useRouter();
  const params = useSearchParams();
  const searchTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(searchTimer.current), []);
  function search(value: string) {
    window.clearTimeout(searchTimer.current);
    searchTimer.current = window.setTimeout(() => {
      const current = new URLSearchParams(params.toString());
      if (value.trim()) current.set("q", value.trim());
      else current.delete("q");
      if (current.toString() !== params.toString()) router.replace(`?${current.toString()}`);
    }, 250);
  }
  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`?${next.toString()}`);
  }
  function clear() { router.replace("?"); }
  const active = Boolean(params.get("q") || params.get("status") || params.get("priority") || params.get("assignee") || params.get("due"));
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <label className="relative min-w-[190px] flex-1 sm:max-w-xs"><Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" /><input key={params.get("q") ?? ""} defaultValue={params.get("q") ?? ""} onChange={(event) => search(event.target.value)} className="input h-9 pl-9 text-xs" placeholder="Search tasks…" aria-label="Search tasks" /></label>
      <select value={params.get("status") ?? ""} onChange={(event) => update("status", event.target.value)} className="input h-9 w-auto min-w-32 text-xs" aria-label="Filter by status"><option value="">All statuses</option><option value="backlog">Backlog</option><option value="todo">To do</option><option value="in_progress">In progress</option><option value="in_review">In review</option><option value="done">Done</option></select>
      <select value={params.get("priority") ?? ""} onChange={(event) => update("priority", event.target.value)} className="input h-9 w-auto min-w-32 text-xs" aria-label="Filter by priority"><option value="">All priorities</option><option value="urgent">Urgent</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select>
      <select value={params.get("assignee") ?? ""} onChange={(event) => update("assignee", event.target.value)} className="input h-9 w-auto min-w-32 text-xs" aria-label="Filter by assignee"><option value="">All assignees</option><option value={currentUserId}>Assigned to me</option><option value="unassigned">Unassigned</option>{assignees.filter((assignee) => assignee.id !== currentUserId).map((assignee) => <option key={assignee.id} value={assignee.id}>{assignee.name}</option>)}</select>
      <select value={params.get("due") ?? ""} onChange={(event) => update("due", event.target.value)} className="input h-9 w-auto min-w-32 text-xs" aria-label="Filter by due date"><option value="">Any due date</option><option value="overdue">Overdue</option><option value="next7">Due in 7 days</option><option value="none">No due date</option></select>
      <select value={params.get("sort") ?? "updated"} onChange={(event) => update("sort", event.target.value)} className="input h-9 w-auto min-w-32 text-xs" aria-label="Sort tasks"><option value="updated">Recently updated</option><option value="due">Due date</option><option value="priority">Priority</option></select>
      {active && <button onClick={clear} className="flex items-center gap-1 px-2 text-xs text-slate-500 hover:text-slate-900"><X size={13} /> Clear</button>}
    </div>
  );
}
