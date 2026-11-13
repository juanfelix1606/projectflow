"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  addDays, addMonths, addWeeks, eachDayOfInterval, endOfMonth, endOfWeek,
  format, isSameDay, isSameMonth, startOfMonth, startOfWeek, subDays, subMonths, subWeeks,
} from "date-fns";
import { ChevronLeft, ChevronRight, LoaderCircle } from "lucide-react";
import { toast } from "sonner";
import { getCalendarItems } from "@/app/actions/search";

type TaskItem = { id: string; title: string; status: string; due_date: string; project_id: string };
type ProjectItem = { id: string; name: string; status: string; due_date: string };
type EventItem = { id: string; title: string; due_date: string; kind: "task" | "project"; href: string; status: string };
type Props = {
  workspaceId: string;
  initialTasks: TaskItem[];
  initialProjects: ProjectItem[];
};

const modes = ["month", "week", "day"] as const;
type Mode = (typeof modes)[number];

export function CalendarView({ workspaceId, initialTasks, initialProjects }: Props) {
  const [mode, setMode] = useState<Mode>("month");
  const [current, setCurrent] = useState(new Date());
  const [tasks, setTasks] = useState(initialTasks);
  const [projects, setProjects] = useState(initialProjects);
  const [loading, startTransition] = useTransition();

  const range = useMemo(() => {
    if (mode === "day") return { start: current, end: current };
    if (mode === "week") return { start: startOfWeek(current, { weekStartsOn: 1 }), end: endOfWeek(current, { weekStartsOn: 1 }) };
    return { start: startOfWeek(startOfMonth(current), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(current), { weekStartsOn: 1 }) };
  }, [current, mode]);
  const startDate = format(range.start, "yyyy-MM-dd");
  const endDate = format(range.end, "yyyy-MM-dd");

  useEffect(() => {
    let active = true;
    startTransition(async () => {
      const result = await getCalendarItems(workspaceId, startDate, endDate);
      if (!active) return;
      if ("error" in result) toast.error(result.error);
      else {
        setTasks(result.tasks);
        setProjects(result.projects);
      }
    });
    return () => { active = false; };
  }, [workspaceId, startDate, endDate]);

  const days = useMemo(() => eachDayOfInterval({ start: range.start, end: range.end }), [range]);
  const events = useMemo<EventItem[]>(() => [
    ...tasks.map((task) => ({ id: task.id, title: task.title, due_date: task.due_date, kind: "task" as const, href: `/app/${workspaceId}/tasks/${task.id}`, status: task.status })),
    ...projects.map((project) => ({ id: project.id, title: project.name, due_date: project.due_date, kind: "project" as const, href: `/app/${workspaceId}/projects/${project.id}`, status: project.status })),
  ], [projects, tasks, workspaceId]);
  const monthLabel = mode === "day" ? format(current, "MMMM d, yyyy") : mode === "week" ? `${format(range.start, "MMM d")} – ${format(range.end, "MMM d, yyyy")}` : format(current, "MMMM yyyy");

  function navigate(direction: -1 | 1) {
    setCurrent((date) => mode === "day" ? (direction < 0 ? subDays(date, 1) : addDays(date, 1)) : mode === "week" ? (direction < 0 ? subWeeks(date, 1) : addWeeks(date, 1)) : (direction < 0 ? subMonths(date, 1) : addMonths(date, 1)));
  }

  return (
    <section className="surface overflow-hidden">
      <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2"><button aria-label="Previous date range" onClick={() => navigate(-1)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><ChevronLeft size={15} /></button><button aria-label="Next date range" onClick={() => navigate(1)} className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50"><ChevronRight size={15} /></button><button onClick={() => setCurrent(new Date())} className="btn-secondary h-8 text-xs">Today</button><h2 className="ml-1 text-sm font-semibold">{monthLabel}</h2>{loading && <LoaderCircle size={14} className="animate-spin text-slate-400" />}</div>
        <div className="flex rounded-lg bg-slate-100 p-1" role="group" aria-label="Calendar view">
          {modes.map((item) => <button key={item} onClick={() => setMode(item)} className={`rounded-md px-3 py-1.5 text-[11px] font-medium capitalize ${mode === item ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"}`}>{item}</button>)}
        </div>
      </div>
      {mode === "month" && <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/60">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => <div key={day} className="px-2 py-2.5 text-center text-[9px] font-bold uppercase tracking-wider text-slate-400">{day}</div>)}</div>}
      <div className={mode === "month" ? "grid grid-cols-7" : mode === "week" ? "grid grid-cols-7" : "grid grid-cols-1"}>
        {days.map((day) => {
          const dayEvents = events.filter((event) => isSameDay(new Date(`${event.due_date}T12:00:00`), day));
          const outside = mode === "month" && !isSameMonth(day, current);
          return <div key={day.toISOString()} className={`min-h-[120px] border-b border-r border-slate-100 p-1.5 sm:min-h-[148px] sm:p-2 ${outside ? "bg-slate-50/60" : "bg-white"}`}>
            <div className="mb-1 flex items-center justify-between"><span className={`grid size-6 place-items-center rounded-full text-[10px] ${isSameDay(day, new Date()) ? "bg-indigo-600 font-bold text-white" : outside ? "text-slate-300" : "text-slate-500"}`}>{format(day, "d")}</span><span className="hidden text-[9px] text-slate-400 sm:inline">{mode !== "month" && format(day, "EEE")}</span></div>
            <div className="space-y-1">
              {dayEvents.slice(0, mode === "day" ? 20 : mode === "week" ? 4 : 3).map((event) => <Link key={`${event.kind}-${event.id}`} href={event.href} title={`${event.kind}: ${event.title}`} className={`block truncate rounded px-1.5 py-1 text-[9px] font-medium sm:text-[10px] ${event.kind === "project" ? "bg-violet-50 text-violet-700" : event.status === "done" ? "bg-emerald-50 text-emerald-700" : "bg-indigo-50 text-indigo-700"}`}>{event.kind === "project" ? "◆ " : "• "}{event.title}</Link>)}
              {dayEvents.length > (mode === "day" ? 20 : mode === "week" ? 4 : 3) && <span className="block px-1 text-[9px] text-slate-400">+{dayEvents.length - (mode === "week" ? 4 : 3)} more</span>}
            </div>
          </div>;
        })}
      </div>
      <div className="flex flex-wrap gap-4 border-t border-slate-100 px-4 py-3 text-[10px] text-slate-500"><span><span className="mr-1.5 inline-block size-2 rounded-full bg-indigo-400" />Task deadline</span><span><span className="mr-1.5 inline-block size-2 rounded-full bg-violet-400" />Project deadline</span><span className="ml-auto">{events.length} scheduled items</span></div>
    </section>
  );
}
