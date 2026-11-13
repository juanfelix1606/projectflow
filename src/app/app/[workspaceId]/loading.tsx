export default function WorkspaceLoading() {
  return <div className="animate-pulse space-y-5" aria-label="Loading workspace">
    <div><div className="h-2 w-24 rounded bg-slate-200" /><div className="mt-3 h-7 w-48 rounded bg-slate-200" /><div className="mt-2 h-3 w-72 max-w-full rounded bg-slate-100" /></div>
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }, (_, index) => <div key={index} className="surface h-28 p-4"><div className="h-3 w-24 rounded bg-slate-100" /><div className="mt-5 h-7 w-14 rounded bg-slate-200" /></div>)}</div>
    <div className="surface h-64" />
  </div>;
}
