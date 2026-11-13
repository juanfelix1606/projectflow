import { redirect } from "next/navigation";
import { Boxes, Plus } from "lucide-react";
import { WorkspaceForm } from "@/components/app/workspace-form";
import { createClient } from "@/lib/supabase/server";

export default async function AppEntryPage() {
  const supabase = await createClient();
  const { data: workspaces, error } = await supabase.from("workspaces").select("id, name").order("created_at");
  if (error) {
    return <div className="mx-auto max-w-xl rounded-xl border border-red-100 bg-white p-8 text-sm text-red-700">We couldn&apos;t load your workspaces. Check the Supabase migration and try refreshing.</div>;
  }
  if (workspaces.length > 0) redirect(`/app/${workspaces[0].id}/overview`);
  return (
    <div className="mx-auto grid min-h-[calc(100vh-124px)] max-w-5xl items-center gap-10 lg:grid-cols-[.8fr_1.2fr]">
      <div>
        <div className="grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><Boxes size={23} /></div>
        <p className="eyebrow mt-6">A fresh start</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">Create your first workspace.</h1>
        <p className="mt-3 max-w-md text-sm leading-6 text-slate-500">Give your projects and teammates a shared home. You can invite the rest of your team after setup.</p>
        <div className="mt-6 flex items-center gap-2 text-xs text-slate-400"><Plus size={14} /> Your first workspace is free to create.</div>
      </div>
      <div className="surface p-6 sm:p-8"><WorkspaceForm /></div>
    </div>
  );
}
