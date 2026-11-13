import Link from "next/link";
import { ArrowRight, FolderPlus } from "lucide-react";

export function OverviewEmpty({ workspaceId }: { workspaceId: string }) {
  return (
    <div className="surface grid min-h-[310px] place-items-center p-8 text-center">
      <div className="max-w-sm">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-indigo-50 text-indigo-600"><FolderPlus size={22} /></div>
        <h2 className="mt-4 text-lg font-semibold">A little space to get started</h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">Create your first project to give your tasks a home. Your workspace metrics will update as your team works.</p>
        <Link href={`/app/${workspaceId}/projects`} className="btn-primary mt-5">Create a project <ArrowRight size={14} /></Link>
      </div>
    </div>
  );
}
