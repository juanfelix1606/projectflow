import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, ArrowRight, CalendarDays, CheckCircle2 } from "lucide-react";
import { ProjectActions } from "@/components/app/project-actions";
import { ProjectDialog } from "@/components/app/project-dialog";
import { TaskDialog } from "@/components/app/task-dialog";
import { createClient } from "@/lib/supabase/server";

const priorityClass: Record<string, string> = { urgent: "text-rose-600", high: "text-amber-600", medium: "text-sky-600", low: "text-slate-400" };

export default async function ProjectDetailPage({ params }: { params: Promise<{ workspaceId: string; projectId: string }> }) {
  const { workspaceId, projectId } = await params;
  const supabase = await createClient();
  const [{ data: project }, { data: tasks, error }] = await Promise.all([
    supabase.from("projects").select("id,name,description,status,priority,due_date,updated_at,created_at").eq("id", projectId).eq("workspace_id", workspaceId).maybeSingle(),
    supabase.from("tasks").select("id,title,status,priority,due_date,updated_at").eq("project_id", projectId).eq("workspace_id", workspaceId).order("updated_at", { ascending: false }),
  ]);
  if (!project) notFound();
  const completed = tasks?.filter((task) => task.status === "done").length ?? 0;
  const total = tasks?.length ?? 0;
  const percent = total ? Math.round((completed / total) * 100) : 0;
  return (
    <div>
      <Link href={`/app/${workspaceId}/projects`} className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-700"><ArrowLeft size={13} /> All projects</Link>
      <div className="surface mb-5 overflow-hidden">
        <div className="h-1.5 bg-indigo-500" />
        <div className="p-5 sm:p-7">
          <div className="flex flex-col justify-between gap-5 sm:flex-row">
            <div className="min-w-0"><span className="rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-semibold capitalize text-indigo-700">{project.status.replace("_", " ")}</span><h1 className="mt-3 text-2xl font-semibold tracking-tight">{project.name}</h1><p className="mt-2 max-w-3xl whitespace-pre-wrap text-sm leading-6 text-slate-500">{project.description || "No description yet."}</p><div className="mt-4 flex flex-wrap gap-4 text-[11px] text-slate-500"><span className={`font-semibold capitalize ${priorityClass[project.priority]}`}>{project.priority} priority</span>{project.due_date && <span className="flex items-center gap-1"><CalendarDays size={13} /> Due {format(new Date(`${project.due_date}T12:00:00`), "MMM d, yyyy")}</span>}<span>Updated {format(new Date(project.updated_at), "MMM d")}</span></div></div>
            <div className="flex shrink-0 items-start gap-2"><ProjectDialog workspaceId={workspaceId} project={project} /><ProjectActions projectId={project.id} status={project.status} /></div>
          </div>
          <div className="mt-7 max-w-xl"><div className="flex items-center justify-between text-[11px]"><span className="flex items-center gap-1.5 font-medium text-slate-600"><CheckCircle2 size={14} className="text-emerald-500" /> Progress</span><span className="font-semibold">{completed} / {total} tasks · {percent}%</span></div><div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${percent}%` }} /></div></div>
        </div>
      </div>
      <div className="mb-3 flex items-center justify-between"><div><h2 className="text-lg font-semibold">Project tasks</h2><p className="mt-1 text-xs text-slate-400">{total} tasks in this project</p></div><TaskDialog workspaceId={workspaceId} projects={[{ id: project.id, name: project.name }]} defaultProjectId={project.id} /></div>
      {error ? <div role="alert" className="surface p-8 text-center text-sm text-red-600">Tasks could not be loaded.</div> : tasks?.length ? <div className="surface divide-y divide-slate-100">{tasks.map((task) => <Link key={task.id} href={`/app/${workspaceId}/tasks/${task.id}`} className="flex items-center gap-3 px-4 py-3.5 hover:bg-slate-50"><span className={`size-2 rounded-full ${task.status === "done" ? "bg-emerald-500" : "bg-indigo-400"}`} /><span className={`min-w-0 flex-1 truncate text-sm font-medium ${task.status === "done" ? "text-slate-400 line-through" : ""}`}>{task.title}</span><span className={`hidden text-[10px] capitalize sm:inline ${priorityClass[task.priority]}`}>{task.priority}</span><span className="hidden min-w-24 text-right text-[10px] text-slate-400 sm:inline">{task.due_date ? format(new Date(`${task.due_date}T12:00:00`), "MMM d") : "No date"}</span><span className="rounded-md bg-slate-100 px-2 py-1 text-[9px] capitalize text-slate-500">{task.status.replaceAll("_", " ")}</span><ArrowRight size={13} className="text-slate-300" /></Link>)}</div> : <div className="surface p-8 text-center text-sm text-slate-400">Add the first task to this project.</div>}
    </div>
  );
}
