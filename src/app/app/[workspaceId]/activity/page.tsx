import { format } from "date-fns";
import { Activity } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { PageTitle } from "@/components/app/page-title";

export default async function ActivityPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const { data: activity, error } = await supabase.from("activity_logs").select("id,entity_type,action,details,created_at,actor_id").eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(100);
  const actorIds = [...new Set((activity ?? []).map((item) => item.actor_id).filter(Boolean))];
  const { data: profiles } = actorIds.length ? await supabase.from("profiles").select("id,full_name").in("id", actorIds) : { data: [] };
  const names = new Map((profiles ?? []).map((profile) => [profile.id, profile.full_name]));
  return (
    <div>
      <PageTitle eyebrow="Workspace history" title="Activity" description="A shared timeline of what has changed." />
      {error ? <div role="alert" className="surface p-8 text-center text-sm text-rose-600">Activity could not be loaded.</div> : activity?.length ? <div className="surface divide-y divide-slate-100">{activity.map((item) => <div key={item.id} className="flex items-start gap-3 px-5 py-4"><span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600"><Activity size={15} /></span><div className="min-w-0 flex-1"><p className="text-sm"><span className="font-semibold">{names.get(item.actor_id) ?? "A teammate"}</span><span className="text-slate-500"> {item.action} </span><span className="capitalize text-slate-700">{item.entity_type}</span></p>{item.details?.name && <p className="mt-1 truncate text-xs text-slate-500">{item.details.name}</p>}<p className="mt-1.5 text-[10px] text-slate-400">{format(new Date(item.created_at), "EEEE, MMM d, yyyy 'at' h:mm a")}</p></div></div>)}</div> : <div className="surface grid min-h-[280px] place-items-center p-8 text-center"><div><Activity className="mx-auto text-slate-300" size={24} /><h2 className="mt-4 font-semibold">Your team&apos;s story starts here</h2><p className="mt-1.5 text-sm text-slate-500">Project and task updates will appear in this timeline.</p></div></div>}
    </div>
  );
}
