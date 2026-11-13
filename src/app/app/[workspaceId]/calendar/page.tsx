import { format, startOfMonth, endOfMonth } from "date-fns";
import { PageTitle } from "@/components/app/page-title";
import { CalendarView } from "@/components/app/calendar-view";
import { createClient } from "@/lib/supabase/server";

export default async function CalendarPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const start = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const end = format(endOfMonth(new Date()), "yyyy-MM-dd");
  const supabase = await createClient();
  const [{ data: tasks }, { data: projects }] = await Promise.all([
    supabase.from("tasks").select("id,title,status,due_date,project_id").eq("workspace_id", workspaceId).gte("due_date", start).lte("due_date", end),
    supabase.from("projects").select("id,name,status,due_date").eq("workspace_id", workspaceId).gte("due_date", start).lte("due_date", end),
  ]);
  return <div><PageTitle eyebrow="Plan ahead" title="Calendar" description="See project and task deadlines at a glance." /><CalendarView workspaceId={workspaceId} initialTasks={tasks ?? []} initialProjects={projects ?? []} /></div>;
}
