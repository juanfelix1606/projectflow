import Link from "next/link";
import {
  ArrowDownRight, ArrowRight, ArrowUpRight, BarChart3, Check,
  CheckCircle2, ChevronDown, Command, Layers3, MessageSquareText,
  MoveUpRight, Sparkles, Users2,
} from "lucide-react";

const features = [
  { icon: Layers3, title: "Projects with a point of view", text: "Keep milestones, ownership, and progress in one clear place. Everyone knows what matters next." },
  { icon: CheckCircle2, title: "Tasks that move work forward", text: "A lightweight workflow that makes priorities, handoffs, and deadlines feel effortless." },
  { icon: Users2, title: "A team that's in the loop", text: "Bring context into the work with comments, activity, and shared workspace views." },
  { icon: BarChart3, title: "Progress you can actually see", text: "A focused overview helps your team spot momentum and catch blockers early." },
];

const plans = [
  { name: "ProjectFlow", price: "Available now", copy: "Explore core project and task management with your own Supabase workspace.", items: ["Projects and task boards", "Workspace roles and invitations", "Calendar, comments, and files"], available: true },
  { name: "Team", price: "Coming soon", copy: "Paid plan details will be published when billing is ready.", items: ["Subscription billing not enabled", "No paid feature limits are active", "Core collaboration is available today"], available: false },
  { name: "Business", price: "Coming soon", copy: "Business plan details will be published when billing is ready.", items: ["No subscription is required today", "Advanced billing is not yet available", "Feature availability is documented here"], available: false },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden bg-white text-slate-950">
      <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 backdrop-blur-xl">
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 text-[16px] font-bold tracking-tight">
            <span className="grid size-8 place-items-center rounded-[10px] bg-indigo-600 text-white">P</span> ProjectFlow
          </Link>
          <nav className="hidden items-center gap-8 text-[13px] font-medium text-slate-600 md:flex" aria-label="Main navigation">
            <a href="#features" className="hover:text-slate-950">Features</a>
            <a href="#how-it-works" className="hover:text-slate-950">How it works</a>
            <a href="#pricing" className="hover:text-slate-950">Pricing</a>
            <a href="#faq" className="hover:text-slate-950">FAQ</a>
          </nav>
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden text-[13px] font-semibold text-slate-600 hover:text-slate-950 sm:block">Sign in</Link>
            <Link href="/register" className="inline-flex h-9 items-center gap-2 rounded-lg bg-slate-950 px-3.5 text-[13px] font-semibold text-white transition hover:bg-indigo-700">
              Get started <ArrowUpRight size={14} />
            </Link>
          </div>
        </div>
      </header>

      <section className="relative mx-auto max-w-7xl px-5 pb-20 pt-[76px] sm:px-8 sm:pt-24 lg:grid lg:grid-cols-[.91fr_1.09fr] lg:items-center lg:gap-10 lg:pb-28 lg:pt-24">
        <div className="relative z-10 max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50/80 px-3 py-1.5 text-[11px] font-semibold text-indigo-700">
            <Sparkles size={13} /> A calmer way to do great work
          </div>
          <h1 className="text-[48px] font-semibold leading-[1.07] tracking-[-.055em] sm:text-[62px] lg:text-[67px]">
            Bring your team&apos;s <span className="bg-gradient-to-r from-indigo-600 to-violet-500 bg-clip-text text-transparent">best work</span> together.
          </h1>
          <p className="mt-6 max-w-[480px] text-[16px] leading-7 text-slate-500">
            Plan projects, manage tasks, and collaborate with your team in one beautifully organized workspace.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/register" className="btn-primary h-11 px-5">Get started for free <ArrowRight size={15} /></Link>
            <a href="#features" className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-4 font-semibold text-slate-700 transition hover:bg-slate-50">Explore features <ArrowDownRight size={15} /></a>
          </div>
          <div className="mt-7 flex items-center gap-2 text-[12px] text-slate-400"><Check size={14} className="text-emerald-500" /> No credit card required <span className="mx-1 text-slate-200">·</span> Set up in minutes</div>
        </div>

        <div className="relative mt-14 lg:mt-0">
          <div className="absolute -inset-10 -z-10 rounded-full bg-indigo-100/70 blur-[90px]" />
          <div className="absolute -right-16 top-6 -z-10 h-48 w-48 rounded-full bg-violet-100 blur-[70px]" />
          <div className="overflow-hidden rounded-[18px] border border-slate-200 bg-white shadow-[0_35px_90px_-40px_rgba(29,35,74,.3)]">
            <div className="flex h-12 items-center justify-between border-b border-slate-100 px-4">
              <div className="flex items-center gap-2"><div className="size-2 rounded-full bg-red-300" /><div className="size-2 rounded-full bg-amber-300" /><div className="size-2 rounded-full bg-emerald-300" /></div>
              <div className="flex h-6 items-center gap-1.5 rounded-md bg-slate-50 px-2 text-[10px] text-slate-400"><Command size={10} /> studio.projectflow.app</div>
              <div className="size-5 rounded-full bg-indigo-100" />
            </div>
            <div className="grid min-h-[350px] grid-cols-[150px_1fr] sm:grid-cols-[180px_1fr]">
              <aside className="border-r border-slate-100 bg-[#fbfbfd] p-3.5">
                <div className="mb-7 flex items-center gap-2"><div className="grid size-7 place-items-center rounded-md bg-indigo-600 text-[10px] font-bold text-white">S</div><div><div className="text-[10px] font-bold">Studio North</div><div className="text-[8px] text-slate-400">Free plan</div></div><ChevronDown size={11} className="ml-auto text-slate-400" /></div>
                <div className="space-y-1 text-[10px] text-slate-500">
                  {[["◫", "Overview"], ["▤", "Projects"], ["✓", "My tasks"], ["▦", "Calendar"]].map(([icon, text], i) => <div key={text} className={`flex items-center gap-2 rounded-md px-2 py-2 ${i === 0 ? "bg-indigo-50 font-semibold text-indigo-700" : ""}`}><span>{icon}</span>{text}</div>)}
                </div>
                <div className="mb-2 mt-7 flex items-center justify-between text-[8px] font-bold uppercase tracking-wider text-slate-400"><span>Your projects</span><span>+</span></div>
                {["Website refresh", "Product launch", "Brand toolkit"].map((name, i) => <div key={name} className="flex items-center gap-2 py-2 text-[9px] text-slate-600"><span className={`size-1.5 rounded-full ${["bg-violet-500", "bg-sky-500", "bg-amber-500"][i]}`} />{name}</div>)}
              </aside>
              <div className="p-4 sm:p-5">
                <div className="flex items-start justify-between">
                  <div><div className="text-[9px] text-slate-400">Monday, October 12, 2026</div><h3 className="mt-1 text-[17px] font-semibold tracking-tight">Good morning, Jordan <span>✦</span></h3><p className="mt-1 text-[9px] text-slate-400">Here&apos;s what&apos;s moving across your workspace.</p></div>
                  <div className="flex -space-x-1.5">{["bg-pink-200", "bg-sky-200", "bg-amber-200"].map((x) => <div key={x} className={`size-6 rounded-full border-2 border-white ${x}`} />)}<div className="grid size-6 place-items-center rounded-full border-2 border-white bg-slate-100 text-[7px] text-slate-500">+2</div></div>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-2">
                  {[["Active projects", "08", "+2 this month"], ["Tasks completed", "24", "On track this week"], ["Team focus", "86%", "↑ 12% this month"]].map(([label, value, note]) => <div key={label} className="rounded-lg border border-slate-100 p-2.5"><div className="text-[8px] text-slate-400">{label}</div><div className="mt-1 flex items-baseline gap-1.5"><span className="text-[18px] font-semibold">{value}</span></div><div className="mt-0.5 text-[7px] text-emerald-600">{note}</div></div>)}
                </div>
                <div className="mt-4 grid grid-cols-[1.15fr_.85fr] gap-2.5">
                  <div className="rounded-lg border border-slate-100 p-2.5">
                    <div className="flex items-center justify-between"><div className="text-[9px] font-semibold">Your tasks</div><div className="text-[7px] text-indigo-600">View all <MoveUpRight size={8} className="inline" /></div></div>
                    {["Review homepage copy", "Share new wireframes", "Finalize project scope"].map((task, i) => <div key={task} className="flex items-center gap-2 border-b border-slate-50 py-2 last:border-0"><span className={`size-3 rounded border ${i === 1 ? "border-indigo-300 bg-indigo-100" : "border-slate-200"}`} /> <span className="flex-1 text-[8px] text-slate-600">{task}</span><span className={`rounded px-1.5 py-0.5 text-[7px] ${i === 0 ? "bg-amber-50 text-amber-700" : "bg-slate-100 text-slate-500"}`}>{i === 0 ? "Today" : "Oct 16"}</span></div>)}
                  </div>
                  <div className="rounded-lg border border-slate-100 p-2.5">
                    <div className="text-[9px] font-semibold">Weekly progress</div><div className="mt-1 text-[7px] text-slate-400">Tasks completed</div>
                    <div className="mt-2 flex h-[70px] items-end justify-around gap-1 border-b border-slate-100 px-1">{[35, 54, 46, 75, 58, 88, 69].map((h, i) => <div key={i} style={{ height: `${h}%` }} className={`w-3 rounded-t-sm ${i === 5 ? "bg-indigo-500" : "bg-indigo-100"}`} />)}</div>
                    <div className="mt-1 flex justify-around text-[6px] text-slate-400">{["M", "T", "W", "T", "F", "S", "S"].map((d, i) => <span key={i}>{d}</span>)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-5 -left-5 hidden items-center gap-2.5 rounded-xl border border-slate-100 bg-white p-3 shadow-lg sm:flex">
            <div className="grid size-8 place-items-center rounded-lg bg-emerald-50 text-emerald-600"><CheckCircle2 size={16} /></div>
            <div><div className="text-[10px] font-semibold">Project on track</div><div className="text-[8px] text-slate-400">Website refresh · just now</div></div>
          </div>
          <p className="mt-4 text-center text-[10px] text-slate-400">Illustrative product preview — all displayed sample data is fictional.</p>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-[#fafbff] py-9">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-x-14 gap-y-4 px-5 text-[13px] font-semibold tracking-tight text-slate-400">
          <span className="text-[11px] font-medium tracking-normal text-slate-400">A thoughtful home for work of every kind</span>
          {["Independent teams", "Creative studios", "Product builders", "Growing teams"].map((x) => <span key={x}>{x}</span>)}
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Everything in rhythm</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-[42px]">A little more focus.<br />A lot less friction.</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-slate-500">The essentials your team needs to stay aligned, without adding another layer of busywork.</p>
        </div>
        <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, text }) => <article key={title} className="rounded-2xl border border-slate-200 bg-white p-6 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-indigo-950/5"><div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={19} /></div><h3 className="mt-5 font-semibold tracking-tight">{title}</h3><p className="mt-2 text-[13px] leading-6 text-slate-500">{text}</p></article>)}
        </div>
      </section>

      <section id="how-it-works" className="bg-[#11121b] px-5 py-24 text-white sm:px-8 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[.9fr_1.1fr]">
          <div className="max-w-lg"><span className="text-xs font-bold uppercase tracking-[.15em] text-indigo-300">A better way to work</span><h2 className="mt-4 text-3xl font-semibold tracking-[-.04em] sm:text-[42px]">From scattered to in sync.</h2><p className="mt-5 leading-7 text-slate-400">Start with the work. ProjectFlow gives every task a home and every team member the context to make progress confidently.</p><Link href="/register" className="mt-7 inline-flex items-center gap-2 font-semibold text-white hover:text-indigo-200">Create your workspace <ArrowRight size={16} /></Link></div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[["01", "Set up your space", "Bring your projects and people together in one shared home."], ["02", "Make the next step clear", "Turn goals into tasks with owners, due dates, and priorities."], ["03", "Keep momentum visible", "See progress, celebrate small wins, and unblock the next thing."], ["04", "Grow at your own pace", "Start simple. Add structure as your team and work grow."]].map(([n, title, copy]) => <div key={n} className="rounded-xl border border-white/10 bg-white/[.04] p-5"><div className="text-xs font-semibold text-indigo-300">{n}</div><h3 className="mt-3 font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-400">{copy}</p></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="rounded-[24px] bg-gradient-to-br from-indigo-600 to-violet-600 px-7 py-12 text-center text-white sm:px-14 sm:py-16">
          <MessageSquareText className="mx-auto mb-4 opacity-80" size={25} />
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-[-.04em] sm:text-[42px]">Good work happens when everyone sees the whole picture.</h2>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-indigo-100">Share context, give feedback, and move work forward together. No more chasing updates across a dozen tools.</p>
          <Link href="/register" className="mt-7 inline-flex h-11 items-center gap-2 rounded-lg bg-white px-5 font-semibold text-indigo-700 transition hover:bg-indigo-50">Bring your team together <ArrowRight size={15} /></Link>
        </div>
      </section>

      <section aria-labelledby="stories-title" className="border-y border-slate-100 bg-[#fafbff] px-5 py-16 text-center sm:px-8">
        <div className="mx-auto max-w-2xl"><span className="eyebrow">Customer stories</span><h2 id="stories-title" className="mt-3 text-2xl font-semibold tracking-tight">Honest work deserves honest proof.</h2><p className="mt-3 text-sm leading-6 text-slate-500">We don&apos;t have verified customer testimonials to share yet. When we do, you&apos;ll hear directly from the people doing the work.</p></div>
      </section>

      <section id="pricing" className="bg-[#fafbff] px-5 py-24 sm:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center"><span className="eyebrow">Clear about what&apos;s available</span><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-[42px]">Start with the work.</h2><p className="mt-4 text-slate-500">ProjectFlow billing and paid subscriptions aren&apos;t active yet. No invented prices or unavailable plans.</p></div>
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {plans.map((plan, index) => <article key={plan.name} className={`rounded-2xl border bg-white p-6 ${index === 0 ? "border-indigo-300 ring-4 ring-indigo-100/60" : "border-slate-200"}`}><div className="flex items-center justify-between"><h3 className="font-semibold">{plan.name}</h3>{index === 0 && <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-[10px] font-bold text-indigo-700">CORE PRODUCT</span>}</div><p className="mt-3 min-h-10 text-sm leading-5 text-slate-500">{plan.copy}</p><div className="mt-5 text-2xl font-semibold tracking-tight">{plan.price}</div>{plan.available ? <Link href="/register" className="mt-5 flex h-10 items-center justify-center rounded-lg bg-indigo-600 text-sm font-semibold text-white hover:bg-indigo-700">Create an account</Link> : <span className="mt-5 flex h-10 items-center justify-center rounded-lg border border-slate-200 text-sm font-medium text-slate-400">Not available yet</span>}<div className="mt-6 space-y-3 border-t border-slate-100 pt-5">{plan.items.map((item) => <div key={item} className="flex items-center gap-2 text-[13px] text-slate-600"><Check size={14} className="text-emerald-500" />{item}</div>)}</div></article>)}
          </div>
        </div>
      </section>

      <section id="faq" className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
        <div className="text-center"><span className="eyebrow">A few good questions</span><h2 className="mt-3 text-3xl font-semibold tracking-[-.04em] sm:text-[40px]">Before you dive in</h2></div>
        <div className="mt-10 divide-y divide-slate-200 border-y border-slate-200">
          {[["What is ProjectFlow?", "ProjectFlow is a project and team management workspace for planning projects, organizing tasks, and keeping teams aligned."], ["Can I use ProjectFlow on my own?", "Yes. Create an account and workspace to organize personal projects. You can invite teammates whenever you're ready."], ["Is my team data private?", "ProjectFlow is designed with workspace-level access controls backed by Supabase Row Level Security. Set up your own Supabase project and review the included policies before production use."], ["Is billing available?", "No. ProjectFlow does not currently offer paid plans, subscriptions, or billing. The core product can be used after you connect a Supabase project."]].map(([q, a]) => <details key={q} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-6 font-semibold">{q}<ChevronDown size={17} className="shrink-0 text-slate-400 transition group-open:rotate-180" /></summary><p className="max-w-3xl pt-3 text-sm leading-6 text-slate-500">{a}</p></details>)}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-8 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold"><span className="grid size-7 place-items-center rounded-lg bg-indigo-600 text-xs text-white">P</span> ProjectFlow</Link>
          <p className="text-xs text-slate-400">Thoughtfully built for people doing good work. © {new Date().getFullYear()} ProjectFlow.</p>
          <div className="flex gap-5 text-xs text-slate-500"><a href="#features" className="hover:text-slate-900">Features</a><a href="#pricing" className="hover:text-slate-900">Pricing</a><Link href="/login" className="hover:text-slate-900">Sign in</Link></div>
        </div>
      </footer>
    </main>
  );
}
