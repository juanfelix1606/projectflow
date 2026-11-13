"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("ProjectFlow route error", error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-5">
      <div className="surface max-w-md p-7 text-center">
        <AlertTriangle className="mx-auto text-amber-500" size={27} />
        <h1 className="mt-4 text-xl font-semibold">Something didn&apos;t load</h1>
        <p className="mt-2 text-sm leading-6 text-slate-500">The page hit an unexpected error. Try again, and contact your workspace administrator if it continues.</p>
        <button onClick={reset} className="btn-primary mt-5"><RefreshCw size={14} /> Try again</button>
      </div>
    </main>
  );
}
