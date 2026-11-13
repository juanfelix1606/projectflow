import Link from "next/link";
import { format } from "date-fns";
import { Bell, Check, CheckCheck } from "lucide-react";
import { PageTitle } from "@/components/app/page-title";
import { MarkAllNotificationsRead, MarkNotificationRead } from "@/components/app/notification-actions";
import { createClient } from "@/lib/supabase/server";

const icons: Record<string, string> = {
  task_assigned: "Task assigned", task_updated: "Task updated", task_commented: "New comment",
  project_invitation: "Project invitation", workspace_invitation: "Workspace invitation", deadline_approaching: "Upcoming deadline",
};

export default async function NotificationsPage({ params }: { params: Promise<{ workspaceId: string }> }) {
  const { workspaceId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: notifications, error } = await supabase.from("notifications").select("id,type,title,body,href,read_at,created_at").eq("user_id", user.id).eq("workspace_id", workspaceId).order("created_at", { ascending: false }).limit(100);
  const unread = notifications?.filter((item) => !item.read_at).length ?? 0;
  return (
    <div>
      <PageTitle eyebrow="Keep in the loop" title="Notifications" description={`${unread} unread · Recent updates for this workspace`} action={unread > 0 ? <MarkAllNotificationsRead workspaceId={workspaceId} /> : undefined} />
      {error ? <div role="alert" className="surface p-8 text-center text-sm text-red-600">Notifications could not be loaded.</div> : notifications?.length ? <div className="surface divide-y divide-slate-100">{notifications.map((item) => {
        const content = <div className={`flex gap-3 p-4 sm:px-5 ${item.read_at ? "" : "bg-indigo-50/35"}`}><span className={`mt-0.5 grid size-8 shrink-0 place-items-center rounded-lg ${item.read_at ? "bg-slate-100 text-slate-500" : "bg-indigo-100 text-indigo-600"}`}>{item.read_at ? <Check size={15} /> : <Bell size={15} />}</span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><p className="text-[13px] font-semibold">{item.title}</p><span className="rounded bg-slate-100 px-1.5 py-0.5 text-[9px] text-slate-500">{icons[item.type] ?? "Update"}</span><span className="ml-auto text-[10px] text-slate-400">{format(new Date(item.created_at), "MMM d, h:mm a")}</span></div>{item.body && <p className="mt-1 text-xs leading-5 text-slate-500">{item.body}</p>}</div>{!item.read_at && <MarkNotificationRead notificationId={item.id} />}</div>;
        return item.href ? <Link key={item.id} href={item.href} className="block transition hover:bg-slate-50">{content}</Link> : <div key={item.id}>{content}</div>;
      })}</div> : <div className="surface grid min-h-[300px] place-items-center p-8 text-center"><div><div className="mx-auto grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><CheckCheck size={20} /></div><h2 className="mt-4 font-semibold">You&apos;re all caught up</h2><p className="mt-1.5 text-sm text-slate-500">Important updates for this workspace will show up here.</p></div></div>}
    </div>
  );
}
