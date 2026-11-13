"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Camera, LoaderCircle, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { updateProfile } from "@/app/actions/profile";
import { deleteWorkspace, updateWorkspace } from "@/app/actions/workspace";
import { createClient } from "@/lib/supabase/client";
import { getInitials } from "@/lib/utils";

type SettingsProps = {
  userId: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  preferences: { theme: string; date_format: string; timezone: string; email_notifications: boolean };
};

export function ProfileSettingsForm({ userId, email, name, avatarUrl, preferences }: SettingsProps) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [avatar, setAvatar] = useState(avatarUrl);
  const [uploading, setUploading] = useState(false);
  const [pending, startTransition] = useTransition();
  const [theme, setTheme] = useState(preferences.theme);

  useEffect(() => {
    const dark = preferences.theme === "dark" || (preferences.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }, [preferences.theme]);

  function setThemePreview(value: string) {
    setTheme(value);
    const dark = value === "dark" || (value === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.dataset.theme = dark ? "dark" : "light";
  }

  function save(formData: FormData) {
    formData.set("theme", theme);
    startTransition(async () => {
      const result = await updateProfile(formData);
      if (result.error) toast.error(result.error);
      else { toast.success("Profile and preferences saved"); router.refresh(); }
    });
  }

  async function uploadAvatar(file?: File) {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type) || file.size > 2 * 1024 * 1024) {
      toast.error("Choose a PNG, JPEG, or WebP image smaller than 2 MB.");
      return;
    }
    setUploading(true);
    const supabase = createClient();
    const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${userId}/avatar-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("projectflow-avatars").upload(path, file, { contentType: file.type, upsert: false });
    if (uploadError) {
      setUploading(false);
      toast.error("Avatar upload failed. Check the Supabase storage setup.");
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from("projectflow-avatars").getPublicUrl(path);
    const { error: profileError } = await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", userId);
    if (profileError) {
      await supabase.storage.from("projectflow-avatars").remove([path]);
      setUploading(false);
      toast.error("Avatar uploaded, but profile could not be updated.");
      return;
    }
    setAvatar(publicUrl);
    setUploading(false);
    toast.success("Profile photo updated");
    router.refresh();
  }

  return (
    <form action={save} className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="relative grid size-16 place-items-center overflow-hidden rounded-full bg-indigo-100 text-lg font-bold text-indigo-700">{avatar ? <Image src={avatar} alt={`${name || "Your"} profile photo`} fill sizes="64px" unoptimized className="object-cover" /> : getInitials(name)}</div>
        <div><button type="button" onClick={() => fileRef.current?.click()} disabled={uploading} className="btn-secondary h-9">{uploading ? <LoaderCircle size={14} className="animate-spin" /> : <Camera size={14} />} Change photo</button><input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={(event) => uploadAvatar(event.target.files?.[0])} /><p className="mt-1.5 text-[10px] text-slate-400">PNG, JPEG or WebP · max 2 MB</p></div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">Full name</span><input name="fullName" className="input h-10" defaultValue={name} required minLength={2} maxLength={80} /></label>
        <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">Email address</span><input className="input h-10 bg-slate-50 text-slate-500" value={email} readOnly /><span className="block text-[10px] text-slate-400">Email changes are managed by your authentication provider.</span></label>
      </div>
      <div className="border-t border-slate-100 pt-4"><h3 className="text-sm font-semibold">Preferences</h3><div className="mt-3 grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">Appearance</span><select name="theme" value={theme} onChange={(event) => setThemePreview(event.target.value)} className="input h-10"><option value="system">System</option><option value="light">Light</option><option value="dark">Dark</option></select></label>
        <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">Date format</span><select name="dateFormat" defaultValue={preferences.date_format} className="input h-10"><option value="MMM d, yyyy">Oct 12, 2026</option><option value="MM/dd/yyyy">10/12/2026</option><option value="dd/MM/yyyy">12/10/2026</option></select></label>
        <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">Timezone</span><select name="timezone" defaultValue={preferences.timezone} className="input h-10">{["UTC", "America/Los_Angeles", "America/New_York", "Europe/London", "Europe/Paris", "Asia/Jakarta", "Asia/Singapore", "Asia/Tokyo", "Australia/Sydney"].map((timezone) => <option key={timezone} value={timezone}>{timezone.replace("_", " ")}</option>)}</select></label>
        <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">Email notifications</span><select name="emailNotifications" defaultValue={preferences.email_notifications ? "on" : "off"} className="input h-10"><option value="on">On</option><option value="off">Off</option></select></label>
      </div></div>
      <div className="flex justify-end border-t border-slate-100 pt-4"><button className="btn-primary" disabled={pending}>{pending ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />}{pending ? "Saving…" : "Save changes"}</button></div>
    </form>
  );
}

export function WorkspaceSettingsForm({ workspaceId, name, description, role }: { workspaceId: string; name: string; description: string; role: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const canManage = role === "owner" || role === "admin";
  function save(formData: FormData) {
    startTransition(async () => {
      const result = await updateWorkspace(workspaceId, formData);
      if (result.error) toast.error(result.error);
      else { toast.success("Workspace updated"); router.refresh(); }
    });
  }
  function remove() {
    if (!window.confirm("Delete this workspace and permanently remove its projects and tasks? This cannot be undone.")) return;
    startTransition(async () => {
      const result = await deleteWorkspace(workspaceId);
      if (result.error) toast.error(result.error);
      else { toast.success("Workspace deleted"); router.push("/app"); router.refresh(); }
    });
  }
  return <>
    <form action={save} className="space-y-4">
      <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">Workspace name</span><input name="name" className="input h-10" defaultValue={name} required minLength={2} maxLength={80} disabled={!canManage} /></label>
      <label className="block space-y-1.5"><span className="text-xs font-semibold text-slate-600">Description</span><textarea name="description" className="input min-h-24 resize-y" defaultValue={description} maxLength={500} disabled={!canManage} /></label>
      {canManage && <div className="flex justify-end border-t border-slate-100 pt-4"><button disabled={pending} className="btn-primary"><Save size={14} /> Save workspace</button></div>}
    </form>
    {role === "owner" && <div className="mt-7 border-t border-rose-100 pt-5"><h3 className="text-sm font-semibold text-rose-700">Danger zone</h3><p className="mt-1 text-xs leading-5 text-slate-500">Deleting the workspace also removes its projects, tasks, member access, and associated records.</p><button disabled={pending} onClick={remove} className="mt-3 inline-flex h-9 items-center gap-2 rounded-lg border border-rose-200 px-3 text-xs font-semibold text-rose-700 hover:bg-rose-50"><Trash2 size={13} /> Delete workspace</button></div>}
  </>;
}
