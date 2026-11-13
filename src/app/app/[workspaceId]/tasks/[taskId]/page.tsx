import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { ArrowLeft, CalendarDays, MessageSquare, Paperclip, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getInitials } from "@/lib/utils";
import { PageTitle } from "@/components/app/page-title";
import { TaskDetailForm } from "@/components/app/task-detail-form";
import { TaskCommentForm } from "@/components/app/task-comments";
import { TaskAttachments } from "@/components/app/task-attachments";
import { TaskLabels } from "@/components/app/task-labels";
import { TaskRowActions } from "@/components/app/task-row-actions";

export default async function TaskDetailPage({ params }: { params: Promise<{ workspaceId: string; taskId: string }> }) {
  const { workspaceId, taskId } = await params;
  const supabase = await createClient();
  const [{ data: task }, { data: comments }, { data: attachments }, { data: workspaceMembers }, { data: availableLabels }, { data: taskLabels }] = await Promise.all([
    supabase.from("tasks").select("id,workspace_id,project_id,title,description,status,priority,due_date,assignee_id,created_by,created_at,updated_at").eq("id", taskId).eq("workspace_id", workspaceId).maybeSingle(),
    supabase.from("task_comments").select("id,author_id,body,created_at").eq("task_id", taskId).eq("workspace_id", workspaceId).order("created_at"),
    supabase.from("task_attachments").select("id,file_name,content_type,size_bytes,storage_path,created_at").eq("task_id", taskId).eq("workspace_id", workspaceId).order("created_at", { ascending: false }),
    supabase.from("workspace_members").select("user_id").eq("workspace_id", workspaceId),
    supabase.from("task_labels").select("id,name,color").eq("workspace_id", workspaceId).order("name"),
    supabase.from("task_label_links").select("label_id").eq("task_id", taskId).eq("workspace_id", workspaceId),
  ]);
  if (!task) notFound();
  const [{ data: project }, { data: profiles }, { data: currentUser }] = await Promise.all([
    supabase.from("projects").select("id,name").eq("id", task.project_id).maybeSingle(),
    supabase.from("profiles").select("id,full_name,avatar_url").in("id", [...new Set([...(workspaceMembers ?? []).map((member) => member.user_id), ...(comments ?? []).map((comment) => comment.author_id)])]),
    supabase.auth.getUser(),
  ]);
  const profileMap = new Map((profiles ?? []).map((profile) => [profile.id, profile]));
  const assignees = (workspaceMembers ?? []).map((member) => ({
    id: member.user_id,
    name: profileMap.get(member.user_id)?.full_name || "ProjectFlow member",
  }));
  const openCount = (comments ?? []).length;
  return (
    <div>
      <Link href={`/app/${workspaceId}/tasks`} className="mb-5 inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-700"><ArrowLeft size={13} /> All tasks</Link>
      <PageTitle eyebrow={project?.name ?? "Project task"} title={task.title} description={`Created ${format(new Date(task.created_at), "MMM d, yyyy")} · updated ${format(new Date(task.updated_at), "MMM d")}`} action={<TaskRowActions taskId={task.id} status={task.status} />} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <section className="surface p-5 sm:p-6"><div className="mb-5 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><CalendarDays size={16} /></span><div><h2 className="text-sm font-semibold">Task details</h2><p className="mt-0.5 text-[10px] text-slate-400">{project?.name ?? "Project"}</p></div></div><TaskDetailForm task={task} assignees={assignees} /></section>
          <section className="surface p-5 sm:p-6"><div className="mb-4 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><MessageSquare size={16} /></span><div><h2 className="text-sm font-semibold">Conversation</h2><p className="mt-0.5 text-[10px] text-slate-400">{openCount} comments</p></div></div>
            <div className="mb-5 space-y-4">{comments?.map((comment) => {
              const profile = profileMap.get(comment.author_id);
              const name = profile?.full_name || "A teammate";
              return <article key={comment.id} className="flex gap-2.5"><span className="grid size-8 shrink-0 place-items-center rounded-full bg-sky-100 text-[9px] font-bold text-sky-700">{getInitials(name)}</span><div className="min-w-0 flex-1 rounded-xl bg-slate-50 p-3"><div className="flex flex-wrap items-center gap-2"><span className="text-xs font-semibold">{name}</span><span className="text-[9px] text-slate-400">{format(new Date(comment.created_at), "MMM d, h:mm a")}</span></div><p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-slate-600">{comment.body}</p></div></article>;
            })}</div>
            <TaskCommentForm taskId={task.id} workspaceId={workspaceId} />
          </section>
        </div>
        <aside className="space-y-5">
          <section className="surface p-5"><div className="mb-4 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><Paperclip size={16} /></span><div><h2 className="text-sm font-semibold">Attachments</h2><p className="mt-0.5 text-[10px] text-slate-400">Private workspace files</p></div></div><TaskAttachments taskId={task.id} workspaceId={workspaceId} attachments={attachments ?? []} /></section>
          <section className="surface p-5"><div className="mb-4 flex items-center gap-2"><span className="grid size-8 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><Paperclip size={16} /></span><div><h2 className="text-sm font-semibold">Labels</h2><p className="mt-0.5 text-[10px] text-slate-400">Organize work across this workspace</p></div></div><TaskLabels taskId={task.id} workspaceId={workspaceId} available={availableLabels ?? []} selected={(taskLabels ?? []).map((item) => item.label_id)} /></section>
          <section className="surface p-5"><p className="eyebrow">Task metadata</p><dl className="mt-3 space-y-3 text-xs"><div className="flex justify-between gap-3"><dt className="text-slate-400">Status</dt><dd className="capitalize text-slate-700">{task.status.replaceAll("_", " ")}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-400">Priority</dt><dd className="capitalize text-slate-700">{task.priority}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-400">Due date</dt><dd className="text-slate-700">{task.due_date ? format(new Date(`${task.due_date}T12:00:00`), "MMM d, yyyy") : "Not set"}</dd></div><div className="flex justify-between gap-3"><dt className="text-slate-400">Assignee</dt><dd className="text-right text-slate-700">{task.assignee_id ? profileMap.get(task.assignee_id)?.full_name || "Workspace member" : "Unassigned"}</dd></div></dl><Link href={`/app/${workspaceId}/projects/${task.project_id}`} className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs font-semibold text-indigo-600 hover:text-indigo-800">{project?.name ?? "Open project"}<span>→</span></Link></section>
          {currentUser.user?.id === task.created_by && <p className="text-center text-[10px] text-slate-400"><Trash2 size={11} className="mr-1 inline" />You created this task</p>}
        </aside>
      </div>
    </div>
  );
}
