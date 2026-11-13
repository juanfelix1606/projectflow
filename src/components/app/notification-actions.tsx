"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { markAllNotificationsRead, markNotificationRead } from "@/app/actions/profile";

export function MarkNotificationRead({ notificationId }: { notificationId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button type="button" disabled={pending} onClick={() => startTransition(async () => {
    const result = await markNotificationRead(notificationId);
    if (result.error) toast.error(result.error);
    else router.refresh();
  })} className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800">Mark read</button>;
}

export function MarkAllNotificationsRead({ workspaceId }: { workspaceId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button disabled={pending} onClick={() => startTransition(async () => {
    const result = await markAllNotificationsRead(workspaceId);
    if (result.error) toast.error(result.error);
    else { toast.success("Notifications marked as read"); router.refresh(); }
  })} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">{pending ? "Updating…" : "Mark all as read"}</button>;
}
