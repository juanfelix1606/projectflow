"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command, FolderKanban, Search, UserRound, X } from "lucide-react";
import { searchWorkspace } from "@/app/actions/search";

type Props = { workspaceId: string };

export function GlobalSearch({ workspaceId }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ projects: { id: string; name: string; status: string }[]; tasks: { id: string; title: string; status: string; project_id: string }[]; members: { id: string; full_name: string }[] }>({ projects: [], tasks: [], members: [] });
  const [error, setError] = useState("");

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen(true);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    if (!open) return;
    inputRef.current?.focus();
    const timer = window.setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults({ projects: [], tasks: [], members: [] });
        setError("");
        return;
      }
      const response = await searchWorkspace(workspaceId, query);
      if (response.error) setError(response.error);
      else {
        setError("");
        setResults({ projects: response.projects ?? [], tasks: response.tasks ?? [], members: response.members ?? [] });
      }
    }, 250);
    return () => window.clearTimeout(timer);
  }, [open, query, workspaceId]);

  const hasResults = results.projects.length + results.tasks.length + results.members.length > 0;
  return <>
    <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-400 hover:border-slate-300 hover:bg-white">
      <Search size={13} /><span className="hidden sm:inline">Search tasks & projects</span><kbd className="ml-1 rounded border border-slate-200 bg-white px-1 text-[9px]">⌘ K</kbd>
    </button>
    {open && <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/40 px-4 pt-[12vh]" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-label="Search workspace" className="w-full max-w-xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-center gap-3 border-b border-slate-100 px-4">
          <Search size={17} className="shrink-0 text-slate-400" />
          <input ref={inputRef} value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
            if (event.key === "Enter" && hasResults) {
              const target = results.tasks[0] ? `/app/${workspaceId}/tasks/${results.tasks[0].id}` : `/app/${workspaceId}/projects/${results.projects[0].id}`;
              setOpen(false);
              router.push(target);
            }
          }} placeholder="Search projects and tasks…" className="h-14 min-w-0 flex-1 text-sm outline-none placeholder:text-slate-400" />
          <button onClick={() => setOpen(false)} aria-label="Close search" className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100"><X size={15} /></button>
        </div>
        <div className="max-h-[55vh] overflow-y-auto p-2">
          {error ? <p role="alert" className="p-4 text-sm text-rose-600">{error}</p> : query.trim().length < 2 ? <p className="p-4 text-xs text-slate-400">Type at least 2 characters to search your workspace.</p> : hasResults ? <>
            {results.projects.length > 0 && <div className="px-2 pb-1 pt-2 text-[9px] font-bold uppercase tracking-wider text-slate-400">Projects</div>}
            {results.projects.map((project) => <Link key={project.id} href={`/app/${workspaceId}/projects/${project.id}`} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 hover:bg-indigo-50"><FolderKanban size={15} className="text-indigo-500" /><span className="min-w-0 flex-1 truncate text-sm font-medium">{project.name}</span><span className="text-[10px] capitalize text-slate-400">{project.status.replace("_", " ")}</span></Link>)}
            {results.tasks.length > 0 && <div className="px-2 pb-1 pt-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">Tasks</div>}
            {results.tasks.map((task) => <Link key={task.id} href={`/app/${workspaceId}/tasks/${task.id}`} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 hover:bg-indigo-50"><Command size={15} className="text-slate-400" /><span className="min-w-0 flex-1 truncate text-sm font-medium">{task.title}</span><span className="text-[10px] capitalize text-slate-400">{task.status.replaceAll("_", " ")}</span></Link>)}
            {results.members.length > 0 && <div className="px-2 pb-1 pt-3 text-[9px] font-bold uppercase tracking-wider text-slate-400">Workspace members</div>}
            {results.members.map((member) => <Link key={member.id} href={`/app/${workspaceId}/members`} onClick={() => setOpen(false)} className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 hover:bg-indigo-50"><UserRound size={15} className="text-slate-400" /><span className="min-w-0 flex-1 truncate text-sm font-medium">{member.full_name || "ProjectFlow member"}</span><span className="text-[10px] text-slate-400">Member</span></Link>)}
          </> : <p className="p-4 text-xs text-slate-400">No matching projects or tasks.</p>}
        </div>
        <div className="flex items-center gap-2 border-t border-slate-100 px-4 py-2.5 text-[10px] text-slate-400"><Command size={12} /> Search only includes content you can access in this workspace.</div>
      </section>
    </div>}
  </>;
}
