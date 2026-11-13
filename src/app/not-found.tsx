import Link from "next/link";

export default function NotFoundPage() {
  return <main className="grid min-h-screen place-items-center px-5"><div className="text-center"><p className="eyebrow">404 · Not found</p><h1 className="mt-3 text-3xl font-semibold">This page is out of the picture.</h1><p className="mt-3 text-sm text-slate-500">It may have moved, or you may not have permission to view it.</p><Link className="btn-primary mt-6" href="/">Back to ProjectFlow</Link></div></main>;
}
