import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AuthForm } from "@/components/auth/auth-form";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { SupabaseRequired } from "@/components/app/supabase-required";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return <AuthLayout title="Welcome back" description="Sign in to pick up where your team left off.">{hasSupabaseConfig() ? <AuthForm mode="login" /> : <SupabaseRequired compact />}</AuthLayout>;
}
