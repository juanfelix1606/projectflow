"use server";

import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function searchWorkspace(workspaceId: string, value: string) {
  const id = z.uuid().safeParse(workspaceId);
  const query = z.string().trim().min(1).max(100).safeParse(value);
  if (!id.success || !query.success) return { projects: [], tasks: [] };
  const term = query.data.replace(/[%_\\]/g, "");
  if (!term) return { projects: [], tasks: [] };
  const supabase = await createClient();
  const [{ data: projects, error: projectError }, { data: tasks, error: taskError }, { data: workspaceMembers, error: memberError }] = await Promise.all([
    supabase.from("projects").select("id,name,status").eq("workspace_id", id.data).ilike("name", `%${term}%`).limit(5),
    supabase.from("tasks").select("id,title,status,project_id").eq("workspace_id", id.data).ilike("title", `%${term}%`).limit(8),
    supabase.from("workspace_members").select("user_id").eq("workspace_id", id.data),
  ]);
  if (projectError || taskError || memberError) return { error: "Search is temporarily unavailable." };
  const memberIds = (workspaceMembers ?? []).map((member) => member.user_id);
  const { data: members, error: profileError } = memberIds.length
    ? await supabase.from("profiles").select("id,full_name").in("id", memberIds).ilike("full_name", `%${term}%`).limit(5)
    : { data: [], error: null };
  if (profileError) return { error: "Search is temporarily unavailable." };
  return { projects: projects ?? [], tasks: tasks ?? [], members: members ?? [] };
}

export async function getCalendarItems(workspaceId: string, startDate: string, endDate: string) {
  const id = z.uuid().safeParse(workspaceId);
  const start = z.iso.date().safeParse(startDate);
  const end = z.iso.date().safeParse(endDate);
  if (!id.success || !start.success || !end.success || start.data > end.data) return { error: "Invalid calendar range." };
  const supabase = await createClient();
  const [{ data: tasks, error: taskError }, { data: projects, error: projectError }] = await Promise.all([
    supabase.from("tasks").select("id,title,status,due_date,project_id").eq("workspace_id", id.data).gte("due_date", start.data).lte("due_date", end.data).order("due_date").limit(500),
    supabase.from("projects").select("id,name,status,due_date").eq("workspace_id", id.data).gte("due_date", start.data).lte("due_date", end.data).order("due_date").limit(200),
  ]);
  if (taskError || projectError) return { error: "Unable to load calendar items." };
  return { tasks: tasks ?? [], projects: projects ?? [] };
}
