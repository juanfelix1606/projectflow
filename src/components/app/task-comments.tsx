"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { addTaskComment } from "@/app/actions/task";

export function TaskCommentForm({ taskId, workspaceId }: { taskId: string; workspaceId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  function submit(formData: FormData) {
    const body = String(formData.get("body") ?? "");
    startTransition(async () => {
      const result = await addTaskComment(taskId, workspaceId, body);
      if (result.error) toast.error(result.error);
      else {
        toast.success("Comment added");
        const form = document.getElementById("task-comment-form") as HTMLFormElement | null;
        form?.reset();
        router.refresh();
      }
    });
  }
  return <form id="task-comment-form" action={submit} className="space-y-2"><textarea name="body" required maxLength={5000} className="input min-h-20 resize-y" placeholder="Share an update or ask a question…" /><div className="flex justify-end"><button className="btn-primary h-9" disabled={pending}>{pending ? "Posting…" : "Post comment"}</button></div></form>;
}
