import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthForm } from "@/components/auth/auth-form";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { SupabaseRequired } from "@/components/app/supabase-required";

export const metadata: Metadata = { title: "Create your account" };

export default function RegisterPage() {
  return <AuthLayout title="Create your account" description="Start organizing your work in a few simple steps.">{hasSupabaseConfig() ? <AuthForm mode="register" /> : <SupabaseRequired compact />}</AuthLayout>;
}
