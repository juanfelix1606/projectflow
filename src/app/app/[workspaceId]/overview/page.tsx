import Link from "next/link";
import { format, eachDayOfInterval, subDays, startOfDay } from "date-fns";
import { ArrowRight, ArrowUpRight, CalendarClock, CheckCircle2, CircleAlert, FolderKanban, ListTodo } from "lucide-react";
import { PageTitle } from "@/components/app/page-title";
import { DashboardCharts } from "@/components/app/dashboard-charts";
import { OverviewEmpty } from "@/components/app/overview-empty";
import { createClient } from "@/lib/supabase/server";

const taskStatusLabels: Record<string, string> = {
  backlog: "Backlog", todo: "To do", in_progress: "In progress", in_review: "In review", done: "Done",
};
const priorityClasses: Record<string, string> = {
  low: "bg-slate-100 text-slate-600", medium: "bg-sky-50 text-sky-700", high: "bg-amber-50 text-amber-700", urgent: "bg-rose-50 text-rose-700",
};

export default async function OverviewPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const today = startOfDay(new Date());
  const since = subDays(today, 6).toISOString();
  const [
    { count: projectCount },
    { count: activeProjectCount },
    { count: completedProjectCount },
    { count: taskCount },
    { count: completedTaskCount },
    { count: overdueCount },
    { data: projects },
    { data: tasks },
    { data: recentTasks },
    { data: activities },
    { data: dueTasks },
  ] = await Promise.all([
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).neq("status", "archived"),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "active"),
    supabase.from("projects").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "completed"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).eq("status", "done"),
    supabase.from("tasks").select("id", { count: "exact", head: true }).eq("workspace_id", workspaceId).lt("due_date", format(today, "yyyy-MM-dd")).neq("status", "done"),
    supabase.from("projects").select("id,name,status,priority,due_date,updated_at").eq("workspace_id", workspaceId).neq("status", "archived").order("updated_at", { ascending: false }).limit(5),
    supabase.from("tasks").select("id,status,completed_at").eq("workspace_id", workspaceId).gte("completed_at", since).order("completed_at"),
    supabase.from("tasks").select("id,title,status,priority,due_date,project_id,updated_at").eq("workspace_id", workspaceId).eq("assignee_id", user.id).neq("status", "done").order("due_date", { ascending: true, nullsFirst: false }).limit(5),
    supabase.from("activity_logs").select("id,entity_type,action,details,created_at,actor_id").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(5),
    supabase.from("tasks").select("id,title,due_date,priority,project_id").eq("workspace_id", workspaceId).neq("status", "done").not("due_date", "is", null).gte("due_date", format(today, "yyyy-MM-dd")).order("due_date").limit(4),
  ]);
  const [{ data: projectStatusRows }, { data: recentProjectRows }, { data: actorRows }, { data: projectTaskRows }] = await Promise.all([
    supabase.from("projects").select("status").eq("workspace_id", workspaceId).neq("status", "archived"),
    supabase.from("projects").select("id,name").eq("workspace_id", workspaceId),
    supabase.from("profiles").select("id,full_name").in("id", (activities ?? []).map((activity) => activity.actor_id).filter(Boolean)),
    supabase.from("tasks").select("project_id,status").eq("workspace_id", workspaceId),
  ]);

  const projectStatus = ["planning", "active", "on_hold", "completed"].map((status) => ({
    name: status,
    value: (projectStatusRows ?? []).filter((row) => row.status === status).length,
  }));
  const days = eachDayOfInterval({ start: subDays(today, 6), end: today });
  const trend = days.map((day) => ({
    day: format(day, "EEE"),
    completed: (tasks ?? []).filter((task) => task.completed_at && format(new Date(task.completed_at), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")).length,
  }));
  const projectNames = new Map((recentProjectRows ?? []).map((project) => [project.id, project.name]));
  const actors = new Map((actorRows ?? []).map((actor) => [actor.id, actor.full_name]));
  const projectProgress = new Map((projects ?? []).map((project) => [project.id, project.name]));
  const projectTaskProgress = new Map<string, { total: number; done: number }>();
  (projectTaskRows ?? []).forEach((task) => {
    const progress = projectTaskProgress.get(task.project_id) ?? { total: 0, done: 0 };
    progress.total += 1;
    if (task.status === "done") progress.done += 1;
    projectTaskProgress.set(task.project_id, progress);
  });
  const safeProjectCount = projectCount ?? 0;
  const safeTaskCount = taskCount ?? 0;
  const completionRate = safeTaskCount ? Math.round(((completedTaskCount ?? 0) / safeTaskCount) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageTitle eyebrow={format(new Date(), "EEEE, MMMM d")} title="Your overview" description="A clear picture of what your team is moving forward." action={<Link className="btn-primary" href={`/app/${workspaceId}/projects`}>Explore projects <ArrowRight size={14} /></Link>} />
      {safeProjectCount === 0 && safeTaskCount === 0 ? <OverviewEmpty workspaceId={workspaceId} /> : <>
        <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Active projects", value: activeProjectCount ?? 0, note: `${safeProjectCount} in this workspace`, icon: FolderKanban, tone: "text-indigo-600 bg-indigo-50" },
            { label: "Tasks completed", value: completedTaskCount ?? 0, note: `${completionRate}% of all tasks`, icon: CheckCircle2, tone: "text-emerald-600 bg-emerald-50" },
            { label: "Open tasks", value: safeTaskCount - (completedTaskCount ?? 0), note: "Across all projects", icon: ListTodo, tone: "text-sky-600 bg-sky-50" },
            { label: "Overdue tasks", value: overdueCount ?? 0, note: `${completedProjectCount ?? 0} projects completed`, icon: CircleAlert, tone: (overdueCount ?? 0) ? "text-rose-600 bg-rose-50" : "text-amber-600 bg-amber-50" },
          ].map(({ label, value, note, icon: Icon, tone }) => <article key={label} className="surface p-4"><div className="flex items-center justify-between"><span className="text-xs font-medium text-slate-500">{label}</span><span className={`grid size-8 place-items-center rounded-lg ${tone}`}><Icon size={16} /></span></div><div className="mt-3 text-[26px] font-semibold tracking-tight">{value}</div><div className="mt-1 text-[11px] text-slate-400">{note}</div></article>)}
        </section>

        <DashboardCharts trend={trend} distribution={projectStatus} />

        <div className="grid gap-4 xl:grid-cols-[1.25fr_.75fr]">
          <section className="surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold tracking-tight">Your assigned tasks</h2><p className="mt-1 text-xs text-slate-400">A quick look at what needs your attention</p></div><Link href={`/app/${workspaceId}/tasks`} className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800">View all <ArrowUpRight size={13} /></Link></div>
            {recentTasks?.length ? <div className="divide-y divide-slate-100">{recentTasks.map((task) => <Link key={task.id} href={`/app/${workspaceId}/tasks?task=${task.id}`} className="flex items-center gap-3 px-5 py-3.5 transition hover:bg-slate-50"><span className={`size-2 shrink-0 rounded-full ${task.status === "in_progress" ? "bg-indigo-500" : "bg-slate-300"}`} /><span className="min-w-0 flex-1"><span className="block truncate text-[13px] font-medium">{task.title}</span><span className="mt-1 block text-[10px] text-slate-400">{projectNames.get(task.project_id) ?? "Project"}</span></span><span className={`rounded-md px-2 py-1 text-[10px] font-medium ${priorityClasses[task.priority] ?? "bg-slate-100 text-slate-600"}`}>{task.priority}</span><span className="hidden min-w-20 text-right text-[10px] text-slate-400 sm:block">{task.due_date ? format(new Date(`${task.due_date}T12:00:00`), "MMM d") : "No due date"}</span></Link>)}</div> : <div className="p-8 text-center text-sm text-slate-400">No open tasks assigned to you yet.</div>}
          </section>

          <section className="surface overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold tracking-tight">Coming up</h2><p className="mt-1 text-xs text-slate-400">Upcoming task deadlines</p></div><CalendarClock size={17} className="text-slate-400" /></div>
            {dueTasks?.length ? <div className="divide-y divide-slate-100">{dueTasks.map((task) => <div key={task.id} className="flex items-start gap-3 px-5 py-3.5"><div className="mt-0.5 grid min-w-9 place-items-center rounded-lg bg-amber-50 px-1.5 py-1 text-[9px] font-bold text-amber-700">{format(new Date(`${task.due_date}T12:00:00`), "MMM d")}</div><div className="min-w-0"><p className="truncate text-[12px] font-medium">{task.title}</p><p className="mt-1 truncate text-[10px] text-slate-400">{projectProgress.get(task.project_id) ?? "Project"} · {task.priority} priority</p></div></div>)}</div> : <div className="p-8 text-center text-sm text-slate-400">No upcoming deadlines. Enjoy the breathing room.</div>}
          </section>
        </div>

        <section className="surface overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4"><div><h2 className="font-semibold tracking-tight">Recently updated projects</h2><p className="mt-1 text-xs text-slate-400">The latest work across this workspace</p></div><Link className="text-xs font-semibold text-indigo-600" href={`/app/${workspaceId}/projects`}>All projects <ArrowRight size={12} className="ml-1 inline" /></Link></div>
          {projects?.length ? <div className="grid divide-y divide-slate-100 sm:grid-cols-2 sm:divide-y-0 lg:grid-cols-3">{projects.map((project) => {
            const progress = projectTaskProgress.get(project.id) ?? { total: 0, done: 0 };
            const percent = progress.total ? Math.round((progress.done / progress.total) * 100) : 0;
            return <Link key={project.id} href={`/app/${workspaceId}/projects/${project.id}`} className="border-slate-100 p-4 transition hover:bg-slate-50 sm:border-r lg:border-b"><div className="flex items-center justify-between"><span className="truncate text-sm font-semibold">{project.name}</span><span className="rounded-md bg-indigo-50 px-2 py-1 text-[9px] font-semibold capitalize text-indigo-700">{taskStatusLabels[project.status] ?? project.status.replace("_", " ")}</span></div><p className="mt-2 text-[10px] text-slate-400">Updated {format(new Date(project.updated_at), "MMM d")}{project.due_date ? ` · Due ${format(new Date(`${project.due_date}T12:00:00`), "MMM d")}` : ""}</p><div className="mt-3 h-1 rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-500" style={{ width: `${percent}%` }} /></div></Link>;
          })}</div> : <div className="p-8 text-center text-sm text-slate-400">Projects you update will show up here.</div>}
        </section>

        <section className="surface overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold tracking-tight">Recent activity</h2><p className="mt-1 text-xs text-slate-400">What&apos;s been happening in your workspace</p></div>
          {activities?.length ? <div className="divide-y divide-slate-100">{activities.map((activity) => <div key={activity.id} className="flex items-start gap-3 px-5 py-3"><span className="mt-1.5 size-2 rounded-full bg-indigo-400" /><div className="min-w-0 flex-1"><p className="text-xs text-slate-600"><span className="font-semibold text-slate-800">{actors.get(activity.actor_id) ?? "A teammate"}</span> {activity.action} <span className="text-slate-400">{activity.entity_type}</span></p><p className="mt-1 text-[10px] text-slate-400">{format(new Date(activity.created_at), "MMM d, h:mm a")}</p></div></div>)}</div> : <div className="p-7 text-center text-sm text-slate-400">Workspace activity will appear here as your team gets going.</div>}
        </section>
      </>}
    </div>
  );
}
