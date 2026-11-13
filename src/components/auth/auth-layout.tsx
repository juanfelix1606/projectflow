import Link from "next/link";
import { ArrowUpRight, CheckCircle2 } from "lucide-react";

export function AuthLayout({ children, title, description }: { children: React.ReactNode; title: string; description: string }) {
  return (
    <main className="grid min-h-screen bg-white lg:grid-cols-[1fr_1fr]">
      <section className="relative hidden overflow-hidden bg-[#12131d] p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Link href="/" className="flex w-fit items-center gap-2.5 font-bold tracking-tight">
          <span className="grid size-9 place-items-center rounded-xl bg-indigo-500 text-white">P</span>
          <span className="text-lg">ProjectFlow</span>
        </Link>
        <div className="relative z-10 max-w-lg pb-8">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-indigo-200">
            <span className="size-1.5 rounded-full bg-emerald-400" /> Your team&apos;s calm, clear workspace
          </div>
          <h2 className="text-4xl font-semibold leading-tight tracking-tight">Make space for your team&apos;s best work.</h2>
          <p className="mt-4 leading-7 text-slate-400">Bring projects, priorities, and people together. Spend less time coordinating and more time moving forward.</p>
          <div className="mt-8 space-y-3 text-sm text-slate-300">
            {["A clear view of every project", "Tasks that stay in sync", "A workspace made for focus"].map((item) => (
              <div key={item} className="flex items-center gap-2.5"><CheckCircle2 size={16} className="text-indigo-300" />{item}</div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-500">A better rhythm for work, together.</p>
        <div className="pointer-events-none absolute -right-36 -top-32 size-[520px] rounded-full border border-white/5" />
        <div className="pointer-events-none absolute -right-24 -top-20 size-[390px] rounded-full border border-indigo-400/10" />
        <div className="pointer-events-none absolute -bottom-48 -left-24 size-[470px] rounded-full bg-indigo-600/10 blur-3xl" />
      </section>
      <section className="flex min-h-screen flex-col px-6 py-7 sm:px-12 lg:justify-center lg:px-20">
        <Link href="/" className="flex items-center gap-2 font-bold lg:hidden">
          <span className="grid size-8 place-items-center rounded-lg bg-indigo-600 text-white">P</span> ProjectFlow
        </Link>
        <div className="mx-auto w-full max-w-[410px] py-12">
          <div className="mb-8">
            <span className="eyebrow">ProjectFlow</span>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{title}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
          </div>
          {children}
          <p className="mt-8 flex items-center justify-center gap-1 text-center text-xs text-slate-400"><ArrowUpRight size={12} /> Secure authentication powered by Supabase</p>
        </div>
      </section>
    </main>
  );
}
