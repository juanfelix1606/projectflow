import type { ReactNode } from "react";

export function PageTitle({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h1 className="mt-1 text-[26px] font-semibold tracking-[-.035em] text-slate-950">{title}</h1>{description && <p className="mt-1.5 text-sm text-slate-500">{description}</p>}</div>
      {action}
    </div>
  );
}
