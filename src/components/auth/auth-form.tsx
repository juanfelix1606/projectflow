"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signIn, signUp } from "@/app/actions/auth";

const loginSchema = z.object({
  email: z.email("Enter a valid email address."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});
const registerSchema = loginSchema.extend({
  fullName: z.string().trim().min(2, "Enter your name.").max(80),
});

type Props = { mode: "login" | "register" };

export function AuthForm({ mode }: Props) {
  const isRegister = mode === "register";
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [serverError, setServerError] = useState("");
  const form = useForm({
    resolver: zodResolver(isRegister ? registerSchema : loginSchema),
    defaultValues: isRegister ? { fullName: "", email: "", password: "" } : { email: "", password: "" },
  });

  function onSubmit(values: Record<string, string>) {
    setServerError("");
    startTransition(async () => {
      const data = new FormData();
      Object.entries(values).forEach(([key, value]) => data.set(key, value));
      const result = isRegister ? await signUp(data) : await signIn(data);
      if (result.error) {
        setServerError(result.error);
        return;
      }
      if (isRegister) {
        router.push("/check-email");
      } else {
        const nextPath = searchParams.get("next");
        router.push(nextPath?.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/app");
        router.refresh();
      }
    });
  }

  return (
    <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
      {isRegister && (
        <label className="block space-y-1.5">
          <span className="text-sm font-semibold text-slate-700">Full name</span>
          <input className="input" autoComplete="name" placeholder="Jordan Lee" {...form.register("fullName")} />
          {form.formState.errors.fullName && <span className="text-xs text-red-600">{String(form.formState.errors.fullName.message)}</span>}
        </label>
      )}
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-slate-700">Email address</span>
        <input className="input" type="email" autoComplete="email" placeholder="you@company.com" {...form.register("email")} />
        {form.formState.errors.email && <span className="text-xs text-red-600">{String(form.formState.errors.email.message)}</span>}
      </label>
      <label className="block space-y-1.5">
        <span className="flex items-center justify-between text-sm font-semibold text-slate-700">
          Password
          {!isRegister && <Link href="/forgot-password" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">Forgot password?</Link>}
        </span>
        <input className="input" type="password" autoComplete={isRegister ? "new-password" : "current-password"} placeholder="At least 8 characters" {...form.register("password")} />
        {form.formState.errors.password && <span className="text-xs text-red-600">{String(form.formState.errors.password.message)}</span>}
      </label>
      {serverError && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{serverError}</p>}
      <button className="btn-primary w-full" type="submit" disabled={pending}>
        {pending ? "Please wait…" : isRegister ? "Create your account" : "Sign in"}
      </button>
      <p className="pt-1 text-center text-sm text-slate-500">
        {isRegister ? "Already have an account?" : "New to ProjectFlow?"}{" "}
        <Link className="font-semibold text-indigo-600 hover:text-indigo-800" href={isRegister ? "/login" : "/register"}>
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </form>
  );
}
