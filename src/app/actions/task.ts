"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const taskSchema = z.object({
  workspaceId: z.uuid(),
  projectId: z.uuid(),
  title: z.string().trim().min(1).max(200),
  description: z.string().trim().max(10000).default(""),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum(["backlog", "todo", "in_progress", "in_review", "done"]).default("backlog"),
  dueDate: z.union([z.iso.date(), z.literal("")]).default(""),
});

export async function createTask(formData: FormData) {
  const parsed = taskSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description") ?? "",
    priority: formData.get("priority") ?? "medium",
    status: formData.get("status") ?? "backlog",
    dueDate: formData.get("dueDate") ?? "",
  });
  if (!parsed.success) return { error: "Check the task details and try again." };
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Please sign in again to continue." };
  const { error } = await supabase.from("tasks").insert({
    workspace_id: parsed.data.workspaceId,
    project_id: parsed.data.projectId,
    title: parsed.data.title,
    description: parsed.data.description,
    status: parsed.data.status,
    priority: parsed.data.priority,
    due_date: parsed.data.dueDate || null,
    completed_at: parsed.data.status === "done" ? new Date().toISOString() : null,
    created_by: user.id,
  });
  if (error) return { error: "Unable to create the task. Verify that the project belongs to this workspace." };
  revalidatePath(`/app/${parsed.data.workspaceId}`);
  revalidatePath(`/app/${parsed.data.workspaceId}/tasks`);
  return { success: true };
}

export async function updateTask(taskId: string, changes: {
  status?: string;
  priority?: string;
  assigneeId?: string | null;
  dueDate?: string | null;
  description?: string;
  title?: string;
  position?: number;
}) {
  const id = z.uuid().safeParse(taskId);
  const patchSchema = z.object({
    status: z.enum(["backlog", "todo", "in_progress", "in_review", "done"]).optional(),
    priority: z.enum(["low", "medium", "high", "urgent"]).optional(),
    assigneeId: z.union([z.uuid(), z.null()]).optional(),
    dueDate: z.union([z.iso.date(), z.literal(""), z.null()]).optional(),
    description: z.string().trim().max(10000).optional(),
    title: z.string().trim().min(1).max(200).optional(),
    position: z.number().finite().min(-1000000000).max(1000000000).optional(),
  }).strict();
  const parsed = patchSchema.safeParse(changes);
  if (!id.success || !parsed.success || Object.keys(parsed.data).length === 0) return { error: "Invalid task update." };
  const patch: {
    status?: string;
    priority?: string;
    assignee_id?: string | null;
    due_date?: string | null;
    description?: string;
    title?: string;
    position?: number;
    completed_at?: string | null;
  } = {};
  if (parsed.data.status) {
    patch.status = parsed.data.status;
    patch.completed_at = parsed.data.status === "done" ? new Date().toISOString() : null;
  }
  if (parsed.data.priority) patch.priority = parsed.data.priority;
  if (parsed.data.assigneeId !== undefined) patch.assignee_id = parsed.data.assigneeId;
  if (parsed.data.dueDate !== undefined) patch.due_date = parsed.data.dueDate || null;
  if (parsed.data.description !== undefined) patch.description = parsed.data.description;
  if (parsed.data.title !== undefined) patch.title = parsed.data.title;
  if (parsed.data.position !== undefined) patch.position = parsed.data.position;
  const supabase = await createClient();
  const { data: updated, error } = await supabase.from("tasks").update(patch).eq("id", id.data).select("workspace_id").single();
  if (error) return { error: "Unable to update this task." };
  revalidatePath(`/app/${updated.workspace_id}`);
  revalidatePath(`/app/${updated.workspace_id}/tasks/${id.data}`);
  return { success: true };
}

export async function addTaskComment(taskId: string, workspaceId: string, body: string) {
  const id = z.uuid().safeParse(taskId);
  const workspace = z.uuid().safeParse(workspaceId);
  const content = z.string().trim().min(1).max(5000).safeParse(body);
  if (!id.success || !workspace.success || !content.success) return { error: "Write a comment of up to 5,000 characters." };
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Please sign in again to continue." };
  const { error } = await supabase.from("task_comments").insert({
    task_id: id.data,
    workspace_id: workspace.data,
    author_id: user.id,
    body: content.data,
  });
  if (error) return { error: "Unable to add your comment. Check that you can access this task." };
  revalidatePath(`/app/${workspace.data}/tasks/${id.data}`);
  return { success: true };
}

export async function setTaskLabels(taskId: string, workspaceId: string, labelIds: string[]) {
  const task = z.uuid().safeParse(taskId);
  const workspace = z.uuid().safeParse(workspaceId);
  const labels = z.array(z.uuid()).max(20).safeParse(labelIds);
  if (!task.success || !workspace.success || !labels.success) return { error: "Select up to 20 valid labels." };
  const supabase = await createClient();
  const { error: deleteError } = await supabase.from("task_label_links").delete().eq("task_id", task.data).eq("workspace_id", workspace.data);
  if (deleteError) return { error: "Unable to update task labels." };
  if (labels.data.length) {
    const { error } = await supabase.from("task_label_links").insert(labels.data.map((labelId) => ({
      task_id: task.data,
      workspace_id: workspace.data,
      label_id: labelId,
    })));
    if (error) return { error: "One or more labels are not available in this workspace." };
  }
  revalidatePath(`/app/${workspace.data}/tasks/${task.data}`);
  return { success: true };
}

export async function createTaskLabel(taskId: string, workspaceId: string, name: string) {
  const task = z.uuid().safeParse(taskId);
  const workspace = z.uuid().safeParse(workspaceId);
  const labelName = z.string().trim().min(1).max(40).safeParse(name);
  if (!task.success || !workspace.success || !labelName.success) return { error: "Label names must be 1–40 characters." };
  const supabase = await createClient();
  const { data: label, error: labelError } = await supabase.from("task_labels").upsert({
    workspace_id: workspace.data,
    name: labelName.data,
  }, { onConflict: "workspace_id,name" }).select("id,name,color").single();
  if (labelError || !label) return { error: "Unable to create the label. Check your workspace permissions." };
  const { error: linkError } = await supabase.from("task_label_links").upsert({
    task_id: task.data,
    workspace_id: workspace.data,
    label_id: label.id,
  }, { onConflict: "task_id,label_id" });
  if (linkError) return { error: "Label created, but it could not be added to this task." };
  revalidatePath(`/app/${workspace.data}/tasks/${task.data}`);
  return { label };
}

export async function deleteTask(taskId: string) {
  const id = z.uuid().safeParse(taskId);
  if (!id.success) return { error: "Task not found." };
  const supabase = await createClient();
  const { data: deleted, error } = await supabase.from("tasks").delete().eq("id", id.data).select("workspace_id").single();
  if (error) return { error: "Unable to delete this task." };
  revalidatePath(`/app/${deleted.workspace_id}`);
  return { success: true };
}
