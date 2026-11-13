"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const projectSchema = z.object({
  workspaceId: z.uuid(),
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(5000).default(""),
  status: z.enum(["planning", "active", "on_hold", "completed", "archived"]).default("planning"),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  dueDate: z.union([z.iso.date(), z.literal("")]).default(""),
});

export async function createProject(formData: FormData) {
  const parsed = projectSchema.safeParse({
    workspaceId: formData.get("workspaceId"),
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    status: formData.get("status") ?? "planning",
    priority: formData.get("priority") ?? "medium",
    dueDate: formData.get("dueDate") ?? "",
  });
  if (!parsed.success) return { error: "Check the project details and try again." };
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Please sign in again to continue." };
  const { data, error } = await supabase.from("projects").insert({
    workspace_id: parsed.data.workspaceId,
    name: parsed.data.name,
    description: parsed.data.description,
    status: parsed.data.status,
    priority: parsed.data.priority,
    due_date: parsed.data.dueDate || null,
    archived_at: parsed.data.status === "archived" ? new Date().toISOString() : null,
    archived_from_status: parsed.data.status === "archived" ? "planning" : null,
    created_by: user.id,
  }).select("id").single();
  if (error) return { error: "Unable to create the project. Verify your workspace access." };
  revalidatePath(`/app/${parsed.data.workspaceId}`);
  return { id: data.id };
}

export async function updateProject(projectId: string, formData: FormData) {
  const id = z.uuid().safeParse(projectId);
  const parsed = projectSchema.omit({ workspaceId: true }).safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
    status: formData.get("status") ?? "planning",
    priority: formData.get("priority") ?? "medium",
    dueDate: formData.get("dueDate") ?? "",
  });
  if (!id.success || !parsed.success) return { error: "Check the project details and try again." };
  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase.from("projects").select("status,archived_from_status").eq("id", id.data).maybeSingle();
  if (currentError || !current) return { error: "Unable to load this project for editing." };
  const archiveFrom = current.status === "archived" ? current.archived_from_status : current.status;
  const { error } = await supabase.from("projects").update({
    name: parsed.data.name,
    description: parsed.data.description,
    status: parsed.data.status,
    priority: parsed.data.priority,
    due_date: parsed.data.dueDate || null,
    archived_at: parsed.data.status === "archived" ? new Date().toISOString() : null,
    archived_from_status: parsed.data.status === "archived" ? archiveFrom ?? "planning" : null,
  }).eq("id", id.data);
  if (error) return { error: "Unable to update this project." };
  revalidatePath("/app");
  return { success: true };
}

export async function updateProjectStatus(projectId: string, status: string) {
  const id = z.uuid().safeParse(projectId);
  const parsedStatus = z.enum(["planning", "active", "on_hold", "completed", "archived", "restore"]).safeParse(status);
  if (!id.success || !parsedStatus.success) return { error: "Invalid project status." };
  const supabase = await createClient();
  const { data: current, error: currentError } = await supabase.from("projects").select("workspace_id,status,archived_from_status").eq("id", id.data).maybeSingle();
  if (currentError || !current) return { error: "Unable to load this project." };
  const nextStatus = parsedStatus.data === "restore"
    ? current.archived_from_status ?? "planning"
    : parsedStatus.data;
  const { data: updated, error } = await supabase.from("projects").update({
    status: nextStatus,
    archived_at: nextStatus === "archived" ? new Date().toISOString() : null,
    archived_from_status: nextStatus === "archived" ? current.archived_from_status ?? current.status : null,
  }).eq("id", id.data).select("workspace_id").single();
  if (error) return { error: "Unable to update this project." };
  revalidatePath(`/app/${updated.workspace_id}`);
  return { success: true };
}

export async function deleteProject(projectId: string) {
  const id = z.uuid().safeParse(projectId);
  if (!id.success) return { error: "Project not found." };
  const supabase = await createClient();
  const { data: deleted, error } = await supabase.from("projects").delete().eq("id", id.data).select("workspace_id").single();
  if (error) return { error: "Only workspace admins can delete projects." };
  revalidatePath(`/app/${deleted.workspace_id}`);
  return { success: true };
}
