import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordForm } from "@/components/auth/password-form";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { SupabaseRequired } from "@/components/app/supabase-required";

export const metadata: Metadata = { title: "Choose a new password" };

export default function ResetPasswordPage() {
  return <AuthLayout title="Choose a new password" description="Create a strong password to secure your account.">{hasSupabaseConfig() ? <PasswordForm mode="reset" /> : <SupabaseRequired compact />}</AuthLayout>;
}
