"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Download, FileText, LoaderCircle, Paperclip, Upload } from "lucide-react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

type Attachment = { id: string; file_name: string; content_type: string; size_bytes: number; storage_path: string; created_at: string };

export function TaskAttachments({ taskId, workspaceId, attachments }: { taskId: string; workspaceId: string; attachments: Attachment[] }) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    const allowed = ["image/png", "image/jpeg", "image/webp", "application/pdf", "text/plain"];
    if (!allowed.includes(file.type) || file.size <= 0 || file.size > 10 * 1024 * 1024) {
      toast.error("Choose a PNG, JPEG, WebP, PDF, or text file under 10 MB.");
      return;
    }
    setUploading(true);
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      setUploading(false);
      toast.error("Sign in again before uploading a file.");
      return;
    }
    const fileName = file.name.replace(/[^\w.-]/g, "_").slice(0, 150) || "attachment";
    const path = `${workspaceId}/${taskId}/${crypto.randomUUID()}-${fileName}`;
    const { error: storageError } = await supabase.storage.from("projectflow-files").upload(path, file, { contentType: file.type, upsert: false });
    if (storageError) {
      setUploading(false);
      toast.error("File upload failed. Check your workspace access and storage policies.");
      return;
    }
    const { error: metadataError } = await supabase.from("task_attachments").insert({
      workspace_id: workspaceId,
      task_id: taskId,
      uploaded_by: user.id,
      storage_path: path,
      file_name: file.name.slice(0, 255),
      content_type: file.type,
      size_bytes: file.size,
    });
    if (metadataError) {
      await supabase.storage.from("projectflow-files").remove([path]);
      setUploading(false);
      toast.error("The file uploaded but its task record could not be saved.");
      return;
    }
    setUploading(false);
    toast.success("Attachment uploaded");
    router.refresh();
  }

  async function download(attachment: Attachment) {
    setDownloading(attachment.id);
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("projectflow-files").createSignedUrl(attachment.storage_path, 60);
    setDownloading("");
    if (error || !data?.signedUrl) {
      toast.error("Unable to create a secure download link.");
      return;
    }
    window.open(data.signedUrl, "_blank", "noopener,noreferrer");
  }

  return (
    <div>
      <label className={`btn-secondary h-9 w-fit ${uploading ? "pointer-events-none opacity-60" : ""}`}><input type="file" className="sr-only" accept="image/png,image/jpeg,image/webp,application/pdf,text/plain" disabled={uploading} onChange={(event) => upload(event.target.files?.[0])} />{uploading ? <LoaderCircle size={14} className="animate-spin" /> : <Upload size={14} />}{uploading ? "Uploading…" : "Attach a file"}</label>
      {attachments.length ? <div className="mt-3 space-y-2">{attachments.map((attachment) => <div key={attachment.id} className="flex items-center gap-2 rounded-lg border border-slate-100 p-2.5"><FileText size={15} className="shrink-0 text-indigo-500" /><div className="min-w-0 flex-1"><p className="truncate text-xs font-medium">{attachment.file_name}</p><p className="mt-0.5 text-[9px] text-slate-400">{Math.max(1, Math.round(attachment.size_bytes / 1024))} KB · {attachment.content_type}</p></div><button type="button" aria-label={`Download ${attachment.file_name}`} disabled={downloading === attachment.id} onClick={() => download(attachment)} className="rounded-md p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600">{downloading === attachment.id ? <LoaderCircle size={14} className="animate-spin" /> : <Download size={14} />}</button></div>)}</div> : <p className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-400"><Paperclip size={12} /> No attachments yet</p>}
    </div>
  );
}
