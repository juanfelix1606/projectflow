import Link from "next/link";
import { format } from "date-fns";
import { ArrowRight, FolderKanban, ListTodo } from "lucide-react";
import { PageTitle } from "@/components/app/page-title";
import { ProjectDialog } from "@/components/app/project-dialog";
import { ProjectActions } from "@/components/app/project-actions";
import { createClient } from "@/lib/supabase/server";

const statusClass: Record<string, string> = {
  planning: "bg-slate-100 text-slate-600", active: "bg-emerald-50 text-emerald-700",
  on_hold: "bg-amber-50 text-amber-700", completed: "bg-indigo-50 text-indigo-700", archived: "bg-slate-100 text-slate-500",
};

export default async function ProjectsPage({ params, searchParams }: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { workspaceId } = await params;
  const { status } = await searchParams;
  const supabase = await createClient();
  let projectQuery = supabase.from("projects").select("id,name,description,status,priority,due_date,updated_at,created_at").eq("workspace_id", workspaceId).order("updated_at", { ascending: false });
  if (status && ["planning", "active", "on_hold", "completed", "archived"].includes(status)) projectQuery = projectQuery.eq("status", status);
  const [{ data: projects, error }, { data: taskRows }] = await Promise.all([
    projectQuery,
    supabase.from("tasks").select("project_id,status").eq("workspace_id", workspaceId),
  ]);
  const stats = new Map<string, { total: number; done: number }>();
  (taskRows ?? []).forEach((task) => {
    const current = stats.get(task.project_id) ?? { total: 0, done: 0 };
    current.total += 1;
    if (task.status === "done") current.done += 1;
    stats.set(task.project_id, current);
  });
  const filters = [{ label: "All projects", value: "" }, { label: "Active", value: "active" }, { label: "Planning", value: "planning" }, { label: "Completed", value: "completed" }, { label: "Archived", value: "archived" }];
  return (
    <div>
      <PageTitle eyebrow="Workspace" title="Projects" description="Keep the big picture clear and the next step close." action={<ProjectDialog workspaceId={workspaceId} />} />
      <nav className="mb-5 flex flex-wrap gap-2" aria-label="Filter projects">
        {filters.map((filter) => <Link key={filter.value} href={filter.value ? `?status=${filter.value}` : "?"} className={`rounded-lg px-3 py-1.5 text-xs font-medium ${((status ?? "") === filter.value) ? "bg-indigo-600 text-white" : "border border-slate-200 bg-white text-slate-500 hover:bg-slate-50"}`}>{filter.label}</Link>)}
      </nav>
      {error ? <div role="alert" className="surface p-8 text-center text-sm text-red-600">Projects could not be loaded. Please refresh and try again.</div> : projects?.length ? <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {projects.map((project) => {
          const progress = stats.get(project.id) ?? { total: 0, done: 0 };
          const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
          return <article key={project.id} className="surface overflow-hidden transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="h-1 bg-indigo-500" />
            <div className="p-5">
              <div className="flex items-start justify-between gap-2"><div className="grid size-9 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><FolderKanban size={17} /></div><ProjectActions projectId={project.id} status={project.status} /></div>
              <Link href={`/app/${workspaceId}/projects/${project.id}`} className="group mt-4 block"><h2 className="flex items-center gap-1.5 truncate font-semibold tracking-tight group-hover:text-indigo-700">{project.name}<ArrowRight size={13} className="opacity-0 transition group-hover:opacity-100" /></h2><p className="mt-1.5 line-clamp-2 min-h-10 text-xs leading-5 text-slate-500">{project.description || "No project description yet."}</p></Link>
              <div className="mt-4 flex items-center justify-between"><span className={`rounded-md px-2 py-1 text-[10px] font-semibold capitalize ${statusClass[project.status] ?? "bg-slate-100 text-slate-600"}`}>{project.status.replace("_", " ")}</span><span className="text-[10px] text-slate-400">{project.due_date ? `Due ${format(new Date(`${project.due_date}T12:00:00`), "MMM d, yyyy")}` : "No deadline"}</span></div>
              <div className="mt-5 flex items-center justify-between text-[10px] text-slate-500"><span className="flex items-center gap-1.5"><ListTodo size={13} />{progress.done} of {progress.total} tasks done</span><span className="font-semibold text-slate-700">{percent}%</span></div>
              <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${percent}%` }} /></div>
              <p className="mt-4 border-t border-slate-100 pt-3 text-[10px] text-slate-400">Updated {format(new Date(project.updated_at), "MMM d")}</p>
            </div>
          </article>;
        })}
      </div> : <div className="surface grid min-h-[300px] place-items-center p-8 text-center"><div><div className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><FolderKanban size={22} /></div><h2 className="mt-4 text-lg font-semibold">No projects here yet</h2><p className="mt-2 text-sm text-slate-500">{status ? "Try another status filter or create a new project." : "Create a project to give your team's work a clear home."}</p><div className="mt-5"><ProjectDialog workspaceId={workspaceId} /></div></div></div>}
    </div>
  );
}
