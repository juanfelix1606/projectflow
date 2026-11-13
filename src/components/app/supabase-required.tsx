import Link from "next/link";
import { ArrowLeft, Cable } from "lucide-react";

export function SupabaseRequired({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`surface mx-auto w-full max-w-2xl p-6 sm:p-8 ${compact ? "" : "my-8"}`}>
      <div className="grid size-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Cable size={21} /></div>
      <p className="eyebrow mt-5">External setup required</p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">Connect your Supabase project</h1>
      <p className="mt-3 text-sm leading-6 text-slate-500">ProjectFlow uses Supabase for authentication, PostgreSQL, and Row Level Security. Add your project URL and public anon key to a local <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">.env.local</code>, then apply the included migration.</p>
      <pre className="mt-5 overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs leading-6 text-slate-200"><code>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co{"\n"}NEXT_PUBLIC_SUPABASE_ANON_KEY=your-public-anon-key{"\n"}NEXT_PUBLIC_SITE_URL=http://localhost:3000</code></pre>
      <p className="mt-4 text-xs leading-5 text-slate-500">Never put a Supabase service-role key in a <code>NEXT_PUBLIC_</code> variable or expose it in the browser. See the README for migration and Auth setup steps.</p>
      <Link href="/" className="btn-secondary mt-5"><ArrowLeft size={14} /> Back to ProjectFlow</Link>
    </div>
  );
}
