import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordForm } from "@/components/auth/password-form";
import { hasSupabaseConfig } from "@/lib/supabase/config";
import { SupabaseRequired } from "@/components/app/supabase-required";

export const metadata: Metadata = { title: "Reset your password" };

export default function ForgotPasswordPage() {
  return <AuthLayout title="Reset your password" description="We'll send you a secure link to choose a new password.">{hasSupabaseConfig() ? <PasswordForm mode="forgot" /> : <SupabaseRequired compact />}</AuthLayout>;
}
