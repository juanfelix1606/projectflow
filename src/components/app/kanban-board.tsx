"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { DndContext, KeyboardSensor, PointerSensor, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { format } from "date-fns";
import { toast } from "sonner";
import { updateTask } from "@/app/actions/task";
import { TaskDialog } from "@/components/app/task-dialog";

export type BoardTask = {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  due_date: string | null;
  assignee_id: string | null;
  position: number;
  project_id: string;
};
type Project = { id: string; name: string };
type Assignee = { id: string; name: string };
const columns = [
  { id: "backlog", title: "Backlog", color: "bg-slate-400" },
  { id: "todo", title: "To do", color: "bg-sky-500" },
  { id: "in_progress", title: "In progress", color: "bg-indigo-500" },
  { id: "in_review", title: "In review", color: "bg-amber-500" },
  { id: "done", title: "Done", color: "bg-emerald-500" },
];
const priorityColor: Record<string, string> = { urgent: "bg-rose-50 text-rose-700", high: "bg-amber-50 text-amber-700", medium: "bg-sky-50 text-sky-700", low: "bg-slate-100 text-slate-600" };

function DraggableTask({ task, workspaceId, projects, assignees }: { task: BoardTask; workspaceId: string; projects: Project[]; assignees: Assignee[] }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id, data: { status: task.status } });
  return (
    <article ref={setNodeRef} style={{ transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined, opacity: isDragging ? .45 : 1 }} {...listeners} {...attributes} className="group touch-none rounded-xl border border-slate-200 bg-white p-3 shadow-[0_1px_2px_rgba(16,24,40,.04)] transition hover:border-indigo-200 hover:shadow-sm">
      <div className="flex items-start gap-2"><Link href={`/app/${workspaceId}/tasks/${task.id}`} className="min-w-0 flex-1 text-[12px] font-semibold leading-5 text-slate-800 hover:text-indigo-700">{task.title}</Link><span className={`shrink-0 rounded px-1.5 py-0.5 text-[8px] font-semibold capitalize ${priorityColor[task.priority]}`}>{task.priority}</span></div>
      {task.description && <p className="mt-1.5 line-clamp-2 text-[10px] leading-4 text-slate-400">{task.description}</p>}
      <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-2.5">
        <span className="truncate pr-2 text-[9px] text-slate-400">{projects.find((project) => project.id === task.project_id)?.name ?? "Project"}</span>
        <div className="flex items-center gap-2">
          {task.due_date && <span className={`shrink-0 text-[9px] ${task.due_date < format(new Date(), "yyyy-MM-dd") && task.status !== "done" ? "font-semibold text-rose-600" : "text-slate-400"}`}>{format(new Date(`${task.due_date}T12:00:00`), "MMM d")}</span>}
          {task.assignee_id && <span title={assignees.find((assignee) => assignee.id === task.assignee_id)?.name ?? "Workspace member"} className="grid size-5 place-items-center rounded-full bg-indigo-100 text-[8px] font-bold text-indigo-700">{(assignees.find((assignee) => assignee.id === task.assignee_id)?.name ?? "M").split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase()}</span>}
        </div>
      </div>
    </article>
  );
}

function BoardColumn({ column, tasks, workspaceId, projects, assignees }: { column: (typeof columns)[number]; tasks: BoardTask[]; workspaceId: string; projects: Project[]; assignees: Assignee[] }) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <section ref={setNodeRef} className={`min-h-[420px] min-w-[255px] flex-1 rounded-xl border p-2.5 transition ${isOver ? "border-indigo-300 bg-indigo-50/60" : "border-slate-200/80 bg-slate-100/70"}`} aria-label={`${column.title} tasks`}>
      <div className="mb-3 flex items-center justify-between px-1.5 pt-1"><div className="flex items-center gap-2"><span className={`size-2 rounded-full ${column.color}`} /><h2 className="text-[11px] font-semibold">{column.title}</h2><span className="rounded-md bg-white px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">{tasks.length}</span></div><TaskDialog workspaceId={workspaceId} projects={projects} defaultStatus={column.id} /></div>
      <div className="space-y-2">{tasks.map((task) => <DraggableTask key={task.id} task={task} workspaceId={workspaceId} projects={projects} assignees={assignees} />)}</div>
      {tasks.length === 0 && <p className="px-2 py-8 text-center text-[10px] text-slate-400">Drop a task here</p>}
    </section>
  );
}

export function KanbanBoard({ initialTasks, workspaceId, projects, assignees }: { initialTasks: BoardTask[]; workspaceId: string; projects: Project[]; assignees: Assignee[] }) {
  const [tasks, setTasks] = useState(initialTasks);
  const [, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(KeyboardSensor));

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const targetStatus = columns.find((column) => column.id === String(over.id))?.id;
    if (!targetStatus) return;
    const task = tasks.find((item) => item.id === String(active.id));
    if (!task || task.status === targetStatus) return;
    const previous = tasks;
    const nextPosition = Math.max(-1, ...tasks.filter((item) => item.status === targetStatus).map((item) => item.position)) + 1;
    setTasks((current) => current.map((item) => item.id === task.id ? { ...item, status: targetStatus, position: nextPosition } : item));
    startTransition(async () => {
      const result = await updateTask(task.id, { status: targetStatus, position: nextPosition });
      if (result.error) {
        setTasks(previous);
        toast.error(result.error);
      } else {
        toast.success(`Moved to ${columns.find((column) => column.id === targetStatus)?.title}`);
      }
    });
  }

  return (
    <DndContext sensors={sensors} onDragEnd={onDragEnd}>
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-4">
        {columns.map((column) => <BoardColumn key={column.id} column={column} tasks={tasks.filter((task) => task.status === column.id).sort((a, b) => a.position - b.position)} workspaceId={workspaceId} projects={projects} assignees={assignees} />)}
      </div>
    </DndContext>
  );
}
