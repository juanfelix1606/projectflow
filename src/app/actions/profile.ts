"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export async function updateProfile(formData: FormData) {
  const parsed = z.object({
    fullName: z.string().trim().min(2).max(80),
    theme: z.enum(["light", "dark", "system"]),
    dateFormat: z.enum(["MMM d, yyyy", "MM/dd/yyyy", "dd/MM/yyyy"]),
    timezone: z.string().trim().min(1).max(80),
    emailNotifications: z.enum(["on", "off"]),
  }).safeParse({
    fullName: formData.get("fullName"),
    theme: formData.get("theme"),
    dateFormat: formData.get("dateFormat"),
    timezone: formData.get("timezone"),
    emailNotifications: formData.get("emailNotifications"),
  });
  if (!parsed.success) return { error: "Check your profile and preference settings." };
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Please sign in again to continue." };
  const [{ error: profileError }, { error: preferencesError }] = await Promise.all([
    supabase.from("profiles").update({ full_name: parsed.data.fullName }).eq("id", user.id),
    supabase.from("user_preferences").upsert({
      user_id: user.id,
      theme: parsed.data.theme,
      date_format: parsed.data.dateFormat,
      timezone: parsed.data.timezone,
      email_notifications: parsed.data.emailNotifications === "on",
    }),
  ]);
  if (profileError || preferencesError) return { error: "Unable to save your profile settings." };
  revalidatePath("/app");
  return { success: true };
}

export async function markNotificationRead(notificationId: string) {
  const id = z.uuid().safeParse(notificationId);
  if (!id.success) return { error: "Notification not found." };
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Please sign in again to continue." };
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("id", id.data).eq("user_id", user.id);
  if (error) return { error: "Unable to update this notification." };
  revalidatePath("/app");
  return { success: true };
}

export async function markAllNotificationsRead(workspaceId: string) {
  const id = z.uuid().safeParse(workspaceId);
  if (!id.success) return { error: "Workspace not found." };
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Please sign in again to continue." };
  const { error } = await supabase.from("notifications").update({ read_at: new Date().toISOString() }).eq("workspace_id", id.data).eq("user_id", user.id).is("read_at", null);
  if (error) return { error: "Unable to update your notifications." };
  revalidatePath(`/app/${id.data}/notifications`);
  return { success: true };
}
