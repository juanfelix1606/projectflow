"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Activity, Bell, CalendarDays, CheckSquare2, ChevronsUpDown, Command,
  LayoutDashboard, LogOut, Menu, Plus, Settings2, Users2, X, FolderKanban,
} from "lucide-react";
import { signOut } from "@/app/actions/auth";
import { getInitials } from "@/lib/utils";
import { GlobalSearch } from "@/components/app/global-search";

type Workspace = { id: string; name: string };
type Props = {
  workspace: Workspace;
  workspaces: Workspace[];
  user: { id: string; email?: string; name?: string | null };
  unreadNotifications: number;
  children: React.ReactNode;
};

const primaryNavigation = [
  { label: "Overview", path: "overview", icon: LayoutDashboard },
  { label: "Projects", path: "projects", icon: FolderKanban },
  { label: "My tasks", path: "tasks", icon: CheckSquare2 },
  { label: "Board", path: "board", icon: Command },
  { label: "Calendar", path: "calendar", icon: CalendarDays },
];

export function WorkspaceShell({ workspace, workspaces, user, unreadNotifications, children }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [switcherOpen, setSwitcherOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const base = `/app/${workspace.id}`;
  const displayName = user.name?.trim() || user.email?.split("@")[0] || "Teammate";
  const isActive = (path: string) => pathname === `${base}/${path}` || (path === "projects" && pathname.startsWith(`${base}/projects/`));

  function logout() {
    startTransition(async () => {
      await signOut();
      router.push("/login");
      router.refresh();
    });
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col bg-[#11121b] text-white lg:flex">
        <Link href="/" className="flex h-[68px] items-center gap-2.5 border-b border-white/[.07] px-5">
          <span className="grid size-8 place-items-center rounded-[10px] bg-indigo-500 text-sm font-bold">P</span><span className="font-bold tracking-tight">ProjectFlow</span>
        </Link>
        <div className="relative px-3 pt-4">
          <button onClick={() => setSwitcherOpen(!switcherOpen)} className="flex w-full items-center gap-2.5 rounded-xl border border-white/10 bg-white/[.04] p-2.5 text-left hover:bg-white/[.08]">
            <span className="grid size-8 place-items-center rounded-lg bg-indigo-500/20 text-xs font-bold text-indigo-200">{getInitials(workspace.name)}</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-[12px] font-semibold">{workspace.name}</span><span className="mt-0.5 block text-[10px] text-slate-400">Workspace</span></span><ChevronsUpDown size={15} className="text-slate-500" />
          </button>
          {switcherOpen && <div className="absolute left-3 right-3 top-[70px] z-40 overflow-hidden rounded-xl border border-white/10 bg-[#20212b] p-1 shadow-xl">
            {workspaces.map((item) => <Link key={item.id} href={`/app/${item.id}/overview`} onClick={() => setSwitcherOpen(false)} className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs ${item.id === workspace.id ? "bg-indigo-500/20 text-white" : "text-slate-300 hover:bg-white/5"}`}><span className="grid size-6 place-items-center rounded bg-white/10 text-[9px]">{getInitials(item.name)}</span>{item.name}</Link>)}
            <Link href="/app" className="mt-1 flex items-center gap-2 border-t border-white/10 px-2.5 py-2.5 text-xs text-indigo-200 hover:text-white"><Plus size={14} /> Create workspace</Link>
          </div>}
        </div>
        <nav className="px-3 pt-6" aria-label="Workspace navigation">
          <div className="mb-2 px-2 text-[9px] font-bold uppercase tracking-[.15em] text-slate-500">Workspace</div>
          {primaryNavigation.map(({ label, path, icon: Icon }) => (
            <Link key={path} href={`${base}/${path}`} className={`mb-1 flex h-9 items-center gap-3 rounded-lg px-2.5 text-[12px] transition ${isActive(path) ? "bg-indigo-500/15 font-semibold text-indigo-200" : "text-slate-400 hover:bg-white/[.05] hover:text-white"}`}>
              <Icon size={15} strokeWidth={1.8} />{label}
            </Link>
          ))}
          <div className="mb-2 mt-7 px-2 text-[9px] font-bold uppercase tracking-[.15em] text-slate-500">Manage</div>
          <Link href={`${base}/notifications`} className={`mb-1 flex h-9 items-center gap-3 rounded-lg px-2.5 text-[12px] transition ${isActive("notifications") ? "bg-indigo-500/15 font-semibold text-indigo-200" : "text-slate-400 hover:bg-white/[.05] hover:text-white"}`}><Bell size={15} strokeWidth={1.8} />Notifications{unreadNotifications > 0 && <span className="ml-auto rounded-full bg-indigo-400/20 px-1.5 py-0.5 text-[9px] text-indigo-200">{unreadNotifications}</span>}</Link>
          <Link href={`${base}/activity`} className={`mb-1 flex h-9 items-center gap-3 rounded-lg px-2.5 text-[12px] transition ${isActive("activity") ? "bg-indigo-500/15 font-semibold text-indigo-200" : "text-slate-400 hover:bg-white/[.05] hover:text-white"}`}><Activity size={15} strokeWidth={1.8} />Activity</Link>
          <Link href={`${base}/members`} className={`mb-1 flex h-9 items-center gap-3 rounded-lg px-2.5 text-[12px] transition ${isActive("members") ? "bg-indigo-500/15 font-semibold text-indigo-200" : "text-slate-400 hover:bg-white/[.05] hover:text-white"}`}><Users2 size={15} strokeWidth={1.8} />Members</Link>
          <Link href={`${base}/settings`} className={`mb-1 flex h-9 items-center gap-3 rounded-lg px-2.5 text-[12px] transition ${isActive("settings") ? "bg-indigo-500/15 font-semibold text-indigo-200" : "text-slate-400 hover:bg-white/[.05] hover:text-white"}`}><Settings2 size={15} strokeWidth={1.8} />Settings</Link>
        </nav>
        <div className="mt-auto border-t border-white/[.07] p-3">
          <div className="flex items-center gap-2.5 rounded-lg px-2 py-2">
            <span className="grid size-8 place-items-center rounded-full bg-violet-300 text-[10px] font-bold text-violet-950">{getInitials(displayName)}</span>
            <span className="min-w-0 flex-1"><span className="block truncate text-[11px] font-semibold">{displayName}</span><span className="block truncate text-[9px] text-slate-500">{user.email}</span></span>
            <button type="button" aria-label="Sign out" onClick={logout} disabled={pending} className="rounded-md p-1.5 text-slate-500 hover:bg-white/10 hover:text-white"><LogOut size={15} /></button>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[62px] items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 backdrop-blur-xl sm:px-7">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 lg:hidden" aria-label="Open menu" onClick={() => setMenuOpen(!menuOpen)}>{menuOpen ? <X size={19} /> : <Menu size={19} />}</button>
            <select aria-label="Switch workspace" value={workspace.id} onChange={(event) => router.push(`/app/${event.target.value}/overview`)} className="max-w-32 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[10px] font-medium text-slate-600 lg:hidden">
              {workspaces.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
            </select>
            <div className="hidden items-center gap-1.5 text-[11px] text-slate-400 sm:flex"><span className="font-medium text-slate-600">{workspace.name}</span><span>/</span><span className="capitalize">{pathname.split("/").at(-1)?.replaceAll("-", " ") || "Overview"}</span></div>
            <div className="sm:ml-4"><GlobalSearch workspaceId={workspace.id} /></div>
          </div>
          <div className="flex items-center gap-2">
            <Link aria-label={unreadNotifications > 0 ? `Notifications, ${unreadNotifications} unread` : "Notifications"} href={`${base}/notifications`} className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Bell size={17} />{unreadNotifications > 0 && <span className="absolute right-1 top-1 size-2 rounded-full bg-rose-500" />}</Link>
            <span className="grid size-8 place-items-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700 lg:hidden">{getInitials(displayName)}</span>
          </div>
        </header>
        {menuOpen && <div className="fixed inset-0 z-40 bg-[#11121b] p-5 text-white lg:hidden">
          <div className="mb-7 flex items-center justify-between"><Link href="/" className="flex items-center gap-2 font-bold"><span className="grid size-8 place-items-center rounded-lg bg-indigo-500">P</span>ProjectFlow</Link><button onClick={() => setMenuOpen(false)} aria-label="Close menu"><X /></button></div>
          <div className="mb-4 rounded-lg bg-white/5 p-3 text-sm font-semibold">{workspace.name}</div>
          {[...primaryNavigation, { label: "Notifications", path: "notifications", icon: Bell }, { label: "Activity", path: "activity", icon: Activity }, { label: "Members", path: "members", icon: Users2 }, { label: "Settings", path: "settings", icon: Settings2 }].map(({ label, path, icon: Icon }) => <Link key={path} href={`${base}/${path}`} onClick={() => setMenuOpen(false)} className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-white/5"><Icon size={17} />{label}</Link>)}
          <button onClick={logout} className="mt-4 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm text-slate-300 hover:bg-white/5"><LogOut size={17} />Sign out</button>
        </div>}
        <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-7 sm:py-8">{children}</main>
      </div>
    </div>
  );
}
