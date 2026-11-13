"use server";

import { createHash, randomBytes } from "node:crypto";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

const workspaceSchema = z.object({
  name: z.string().trim().min(2).max(80),
  description: z.string().trim().max(500).default(""),
});

export async function createWorkspace(formData: FormData) {
  const parsed = workspaceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
  });
  if (!parsed.success) return { error: "Workspace name must be 2–80 characters. Description must be under 500 characters." };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_workspace", {
    workspace_name: parsed.data.name,
    workspace_description: parsed.data.description,
  });
  if (error) return { error: "Unable to create the workspace. Check your permissions and try again." };
  revalidatePath("/app");
  return { id: data };
}

export async function updateWorkspace(workspaceId: string, formData: FormData) {
  const id = z.uuid().safeParse(workspaceId);
  const parsed = workspaceSchema.safeParse({
    name: formData.get("name"),
    description: formData.get("description") ?? "",
  });
  if (!id.success || !parsed.success) return { error: "Check the workspace details and try again." };
  const supabase = await createClient();
  const { error } = await supabase.from("workspaces").update(parsed.data).eq("id", id.data);
  if (error) return { error: "Unable to update workspace details." };
  revalidatePath(`/app/${id.data}`);
  return { success: true };
}

export async function deleteWorkspace(workspaceId: string) {
  const id = z.uuid().safeParse(workspaceId);
  if (!id.success) return { error: "Workspace not found." };
  const supabase = await createClient();
  const { error } = await supabase.from("workspaces").delete().eq("id", id.data);
  if (error) return { error: "Only a workspace owner can delete a workspace." };
  revalidatePath("/app");
  return { success: true };
}

export async function createWorkspaceInvitation(workspaceId: string, email: string, role: string) {
  const id = z.uuid().safeParse(workspaceId);
  const address = z.email().safeParse(email.trim().toLowerCase());
  const memberRole = z.enum(["admin", "member", "viewer"]).safeParse(role);
  if (!id.success || !address.success || !memberRole.success) return { error: "Enter a valid email address and role." };
  const supabase = await createClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) return { error: "Please sign in again to continue." };
  const token = randomBytes(32).toString("base64url");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const { error } = await supabase.from("workspace_invitations").upsert({
    workspace_id: id.data,
    email: address.data,
    role: memberRole.data,
    invited_by: user.id,
    token_hash: tokenHash,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    accepted_at: null,
  }, { onConflict: "workspace_id,email" });
  if (error) return { error: "Unable to create the invitation. Workspace admins can invite members." };
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  revalidatePath(`/app/${id.data}/members`);
  return { link: `${origin}/invite?token=${encodeURIComponent(token)}`, email: address.data, expiresInDays: 7 };
}

export async function acceptWorkspaceInvitation(token: string) {
  const parsedToken = z.string().regex(/^[A-Za-z0-9_-]{40,50}$/).safeParse(token);
  if (!parsedToken.success) return { error: "This invitation link is invalid or expired." };
  const tokenHash = createHash("sha256").update(parsedToken.data).digest("hex");
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("accept_workspace_invitation", { invitation_token_hash: tokenHash });
  if (error || !data) return { error: "Sign in with the invited email address to accept this invitation." };
  revalidatePath("/app");
  return { workspaceId: data };
}

export async function changeWorkspaceMemberRole(workspaceId: string, userId: string, role: string) {
  const workspace = z.uuid().safeParse(workspaceId);
  const member = z.uuid().safeParse(userId);
  const parsedRole = z.enum(["owner", "admin", "member", "viewer"]).safeParse(role);
  if (!workspace.success || !member.success || !parsedRole.success) return { error: "Invalid member role." };
  const supabase = await createClient();
  const { error } = await supabase.from("workspace_members").update({ role: parsedRole.data }).eq("workspace_id", workspace.data).eq("user_id", member.data);
  if (error) return { error: "Unable to update this member's role." };
  revalidatePath(`/app/${workspace.data}/members`);
  return { success: true };
}

export async function removeWorkspaceMember(workspaceId: string, userId: string) {
  const workspace = z.uuid().safeParse(workspaceId);
  const member = z.uuid().safeParse(userId);
  if (!workspace.success || !member.success) return { error: "Invalid workspace member." };
  const supabase = await createClient();
  const { error } = await supabase.from("workspace_members").delete().eq("workspace_id", workspace.data).eq("user_id", member.data);
  if (error) return { error: "Unable to remove this member. A workspace must retain at least one owner." };
  revalidatePath(`/app/${workspace.data}/members`);
  return { success: true };
}

export async function revokeWorkspaceInvitation(workspaceId: string, invitationId: string) {
  const workspace = z.uuid().safeParse(workspaceId);
  const invitation = z.uuid().safeParse(invitationId);
  if (!workspace.success || !invitation.success) return { error: "Invitation not found." };
  const supabase = await createClient();
  const { error } = await supabase.from("workspace_invitations").delete().eq("workspace_id", workspace.data).eq("id", invitation.data);
  if (error) return { error: "Unable to revoke this invitation." };
  revalidatePath(`/app/${workspace.data}/members`);
  return { success: true };
}
