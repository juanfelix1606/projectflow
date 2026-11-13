import Link from "next/link";
import { addDays, format } from "date-fns";
import { CheckSquare2, CircleCheck, CircleDashed } from "lucide-react";
import { PageTitle } from "@/components/app/page-title";
import { TaskDialog } from "@/components/app/task-dialog";
import { TaskFilters } from "@/components/app/task-filters";
import { TaskRowActions } from "@/components/app/task-row-actions";
import { createClient } from "@/lib/supabase/server";

const priorities: Record<string, string> = { urgent: "bg-rose-50 text-rose-700", high: "bg-amber-50 text-amber-700", medium: "bg-sky-50 text-sky-700", low: "bg-slate-100 text-slate-600" };
const statuses: Record<string, string> = { backlog: "Backlog", todo: "To do", in_progress: "In progress", in_review: "In review", done: "Done" };

export default async function TasksPage({ params, searchParams }: {
  params: Promise<{ workspaceId: string }>;
  searchParams: Promise<{ q?: string; status?: string; priority?: string; assignee?: string; due?: string; sort?: string }>;
}) {
  const { workspaceId } = await params;
  const filters = await searchParams;
  const supabase = await createClient();
  const [{ data: { user } }, { data: projects }, { data: memberships }] = await Promise.all([
    supabase.auth.getUser(),
    supabase.from("projects").select("id,name").eq("workspace_id", workspaceId),
    supabase.from("workspace_members").select("user_id").eq("workspace_id", workspaceId),
  ]);
  const memberIds = (memberships ?? []).map((member) => member.user_id);
  const { data: profiles } = memberIds.length ? await supabase.from("profiles").select("id,full_name").in("id", memberIds) : { data: [] };
  const assignees = (memberships ?? []).map((member) => ({
    id: member.user_id,
    name: profiles?.find((profile) => profile.id === member.user_id)?.full_name || "ProjectFlow member",
  }));
  let query = supabase.from("tasks").select("id,title,status,priority,due_date,project_id,updated_at,assignee_id").eq("workspace_id", workspaceId).limit(200);
  if (filters.status && Object.hasOwn(statuses, filters.status)) query = query.eq("status", filters.status);
  if (filters.priority && Object.hasOwn(priorities, filters.priority)) query = query.eq("priority", filters.priority);
  if (filters.q?.trim()) query = query.ilike("title", `%${filters.q.trim().replace(/[%_\\]/g, "")}%`);
  if (filters.assignee === "unassigned") query = query.is("assignee_id", null);
  else if (filters.assignee && memberIds.includes(filters.assignee)) query = query.eq("assignee_id", filters.assignee);
  const today = format(new Date(), "yyyy-MM-dd");
  if (filters.due === "overdue") query = query.lt("due_date", today).neq("status", "done");
  if (filters.due === "next7") query = query.gte("due_date", today).lte("due_date", format(addDays(new Date(), 7), "yyyy-MM-dd")).neq("status", "done");
  if (filters.due === "none") query = query.is("due_date", null);
  if (filters.sort === "due") query = query.order("due_date", { ascending: true, nullsFirst: false });
  else if (filters.sort === "priority") query = query.order("priority", { ascending: false });
  else query = query.order("updated_at", { ascending: false });
  const { data: tasks, error } = await query;
  const projectNames = new Map((projects ?? []).map((project) => [project.id, project.name]));
  const activeTasks = tasks?.filter((task) => task.status !== "done").length ?? 0;
  return (
    <div>
      <PageTitle eyebrow="Workspace" title="My tasks" description={`${tasks?.length ?? 0} tasks · ${activeTasks} still in progress`} action={<TaskDialog workspaceId={workspaceId} projects={projects ?? []} />} />
      <TaskFilters assignees={assignees} currentUserId={user?.id ?? ""} />
      {error ? <div role="alert" className="surface p-8 text-center text-sm text-red-600">Tasks could not be loaded. Please refresh and try again.</div> : tasks?.length ? <div className="surface overflow-hidden">
        <div className="hidden grid-cols-[minmax(180px,1fr)_130px_100px_110px_100px_180px] gap-3 border-b border-slate-100 bg-slate-50/70 px-4 py-2.5 text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:grid"><span>Task</span><span>Project</span><span>Priority</span><span>Due date</span><span>Assignee</span><span className="text-right">Status</span></div>
        <div className="divide-y divide-slate-100">{tasks.map((task) => <div key={task.id} className="grid gap-3 px-4 py-3.5 sm:grid-cols-[minmax(180px,1fr)_130px_100px_110px_100px_180px] sm:items-center">
          <Link href={`/app/${workspaceId}/tasks/${task.id}`} className="flex min-w-0 items-center gap-2.5 hover:text-indigo-700">{task.status === "done" ? <CircleCheck size={16} className="shrink-0 text-emerald-500" /> : <CircleDashed size={16} className="shrink-0 text-slate-300" />}<span className={`truncate text-[13px] font-medium ${task.status === "done" ? "text-slate-400 line-through" : ""}`}>{task.title}</span></Link>
          <span className="pl-7 text-[11px] text-slate-500 sm:pl-0">{projectNames.get(task.project_id) ?? "Project"}</span>
          <span className={`ml-7 w-fit rounded-md px-2 py-1 text-[10px] font-medium capitalize sm:ml-0 ${priorities[task.priority]}`}>{task.priority}</span>
          <span className="pl-7 text-[10px] text-slate-400 sm:pl-0">{task.due_date ? format(new Date(`${task.due_date}T12:00:00`), "MMM d, yyyy") : "No due date"}</span>
          <span className="hidden truncate text-[10px] text-slate-500 sm:block">{assignees.find((assignee) => assignee.id === task.assignee_id)?.name ?? "Unassigned"}</span>
          <div className="flex justify-between pl-7 sm:justify-end sm:pl-0"><span className="mr-2 text-[10px] capitalize text-slate-400 sm:hidden">{statuses[task.status]}</span><TaskRowActions taskId={task.id} status={task.status} /></div>
        </div>)}</div>
      </div> : <div className="surface grid min-h-[280px] place-items-center p-8 text-center"><div><div className="mx-auto grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><CheckSquare2 size={20} /></div><h2 className="mt-4 font-semibold">No tasks match this view</h2><p className="mt-1.5 text-sm text-slate-500">{filters.q || filters.status || filters.priority ? "Try changing the filters or search terms." : "Create a task to get the work moving."}</p>{!(filters.q || filters.status || filters.priority) && <div className="mt-5"><TaskDialog workspaceId={workspaceId} projects={projects ?? []} /></div>}</div></div>}
    </div>
  );
}
