"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { requestPasswordReset, updatePassword } from "@/app/actions/auth";

export function PasswordForm({ mode }: { mode: "forgot" | "reset" }) {
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function submit(formData: FormData) {
    setMessage("");
    setError("");
    startTransition(async () => {
      const result = mode === "forgot" ? await requestPasswordReset(formData) : await updatePassword(formData);
      if (result.error) setError(result.error);
      else setMessage(mode === "forgot" ? "If an account exists for that address, a reset link is on its way." : "Your password has been updated. You can now sign in.");
    });
  }

  return (
    <form action={submit} className="space-y-4">
      {mode === "forgot" ? (
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">Email address</span>
          <input name="email" type="email" required autoComplete="email" className="input" placeholder="you@company.com" />
        </label>
      ) : (
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">New password</span>
          <input name="password" type="password" required minLength={8} autoComplete="new-password" className="input" placeholder="At least 8 characters" />
        </label>
      )}
      {error && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
      {message && <p role="status" className="rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-800">{message}</p>}
      <button className="btn-primary w-full" disabled={pending}>{pending ? "Please wait…" : mode === "forgot" ? "Send reset link" : "Update password"}</button>
      <p className="text-center text-sm text-slate-500"><Link href="/login" className="font-semibold text-indigo-600">Back to sign in</Link></p>
    </form>
  );
}
