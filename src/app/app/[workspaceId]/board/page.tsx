import { PageTitle } from "@/components/app/page-title";
import { KanbanBoard, type BoardTask } from "@/components/app/kanban-board";
import { createClient } from "@/lib/supabase/server";

export default async function BoardPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const [{ data: taskRows, error }, { data: projects }, { data: memberships }] = await Promise.all([
    supabase.from("tasks").select("id,title,description,status,priority,due_date,assignee_id,position,project_id").eq("workspace_id", workspaceId).order("position"),
    supabase.from("projects").select("id,name").eq("workspace_id", workspaceId),
    supabase.from("workspace_members").select("user_id").eq("workspace_id", workspaceId),
  ]);
  const memberIds = (memberships ?? []).map((member) => member.user_id);
  const { data: profiles } = memberIds.length ? await supabase.from("profiles").select("id,full_name").in("id", memberIds) : { data: [] };
  const assignees = (profiles ?? []).map((profile) => ({ id: profile.id, name: profile.full_name || "ProjectFlow member" }));
  return (
    <div>
      <PageTitle eyebrow="Workspace" title="Board" description="Move work forward with a clear, shared view." />
      {error ? <div role="alert" className="surface p-8 text-center text-sm text-red-600">The board could not be loaded. Please refresh and try again.</div> : <KanbanBoard key={(taskRows ?? []).map((task) => `${task.id}:${task.status}:${task.position}:${task.assignee_id}`).join(",")} initialTasks={(taskRows ?? []) as BoardTask[]} workspaceId={workspaceId} projects={projects ?? []} assignees={assignees} />}
    </div>
  );
}
